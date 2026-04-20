import tls from 'node:tls';

export const upgradeToTLS = (socket, hostname) => {
    return new Promise((resolve) => {
        const tlsSocket = tls.connect({
            socket: socket,
            rejectUnauthorized: false,
            servername: hostname,
        });
        
        tlsSocket.once('secureConnect', () => {
            resolve({
                right: tlsSocket,
            });
        });
        
        tlsSocket.once('error', (e) => {
            resolve({
                left: e,
            });
        });
    });
}
