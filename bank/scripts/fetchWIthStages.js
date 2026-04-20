import { URL } from 'node:url';

import { withLatency } from './withLatency.js';
import { resolveDNS } from './resolveDNS.js';
import { createConnection } from './createConnection.js';
import { upgradeToTLS } from './upgradeToTLS.js';
import { getCertificateExpiry } from './getCertificateExpiry.js';
import { fetchHtml } from './fetchHtml.js';

export const fetchWIthStages = async (url, uuid) => {
    let stage = 'idle';
    const diagnostics = {
      timestamp: new Date().toISOString(),
      target: url,
      stages: [],
      tcpErrors: [],
      body: '',
    };
    
    stage = 'dns';
    const hostname = new URL(url).hostname;
    const [dnsResult, dnsDuration] = await withLatency(resolveDNS)(hostname);
    if ('left' in dnsResult) {
        diagnostics.stages.push({
            stage,
            result: 'failure',
            duration: dnsDuration,
            message: dnsResult.left.message,
            error: dnsResult.left.code,
        });

        return diagnostics;
    }
    const [resolvedIp] = dnsResult.right.addresses;
    diagnostics.stages.push({
        stage,
        result: 'success',
        duration: dnsDuration,
        resolvedIp,
    });

    stage = "tcp";
    const [createConnectionResult, createConnectionDuration] = await withLatency(createConnection)({
        host: resolvedIp,
        port: 443,
        timeout: 5000
    })
    if ('left' in createConnectionResult) {
        diagnostics.stages.push({
            stage,
            result: 'failure',
            duration: createConnectionDuration,
            message: createConnectionResult.left.message,
            error: createConnectionResult.left.code,
            syscall: createConnectionResult.left.syscall,
        });
        return diagnostics;
    }
    const socket = createConnectionResult.right;
    socket.on('error', (e) => {
        diagnostics.tcpErrors.push({
            stage,
            result: 'failure',
            time: Date.now(),
            code: e.code,
            syscall: e.syscall,
            message: e.message,
        });
    });
    diagnostics.stages.push({
        stage,
        result: 'success',
        duration: createConnectionDuration,
        localPort: socket.localPort
    });

    stage = "tls";
    const [upgradeToTLSResult, upgradeToTLSDuration] = await withLatency(upgradeToTLS)(socket, hostname);
    if ('left' in upgradeToTLSResult) {
        diagnostics.stages.push({
            stage,
            result: 'failure',
            duration: upgradeToTLSDuration,
            message: upgradeToTLSResult.left.message,
            error: upgradeToTLSResult.left.code,
            reason: upgradeToTLSResult.left.reason
        });
        return diagnostics;
    }
    const tlsSocket = upgradeToTLSResult.right;
    diagnostics.stages.push({
        stage,
        result: 'success',
        duration: upgradeToTLSDuration,
        protocol: tlsSocket.getProtocol(),
        cipher: tlsSocket.getCipher().name,
        certExpiry: getCertificateExpiry(tlsSocket)
    });

    stage = "https";
    const [httpResult, httpDuration] = await withLatency(fetchHtml)(url, {
        socket: tlsSocket,
        timeout: { read: 10000 }
    }, uuid);
    if ('left' in httpResult) {
        diagnostics.stages.push({
            stage,
            result: 'failure',
            duration: httpDuration,
            error: httpResult.left.code,
            syscall: httpResult.left.syscall,
            message: httpResult.left.message
        });
        return diagnostics;
    }
    const response = httpResult.right;
    diagnostics.stages.push({
        stage,
        result: 'success',
        duration: httpDuration,
        status: response.status,
        statusMessage: response.statusMessage,
        headers: response.headers,
        bodyLength: response.body.length,
    });

    diagnostics.body = response.body;
    
    return diagnostics;
}
