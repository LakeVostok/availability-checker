import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export const fetchHtml = (url, options = {}, uuid) => {
    return new Promise((resolve) => {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        
        const existingSocket = options.socket;
        
        if (!existingSocket || existingSocket.destroyed) {
            const e = new Error('Socket not available or already destroyed');
            e.code = 'ECONNRESET';
            e.syscall = 'read';

            resolve({
                left: e,
            });
            return;
        }
        
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'Host': parsedUrl.hostname,
                'Accept': '*/*',
                'Connection': 'close',
                "User-Agent": "Friend",
                "Req-Id": uuid,
            },
            createConnection: () => existingSocket,
            timeout: options.timeout?.read || 10000,
        };
        
        const client = isHttps ? https : http;
        const req = client.request(requestOptions, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    right: {
                        status: res.statusCode,
                        headers: res.headers,
                        statusMessage: res.statusMessage,
                        body: body,
                    },
                });
            });
        });
        
        req.on('error', (e) => {
            if (!e.syscall) {
                if (e.code === 'ECONNRESET') e.syscall = 'read';
                if (e.code === 'ETIMEDOUT') e.syscall = 'read';
                if (e.code === 'ECONNREFUSED') e.syscall = 'connect';
            }

            resolve({
                left: e,
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            const e = new Error('Read timeout');
            e.code = 'ETIMEDOUT';
            e.syscall = 'read';
            resolve({
                left: e,
            });
        });
        
        req.end();
    });
}
