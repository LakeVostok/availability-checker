import net from 'node:net';
  
export const createConnection = (options) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(options.timeout || 5000);
        
        socket.once('connect', () => {
            socket.setTimeout(0);

            resolve({
                right: socket,
            });
        });
        
        socket.once('error', (e) => {
            if (socket.readyState !== 'open') {
                socket.destroy();

                resolve({
                    left: e,
                });
            }
        });
        
        socket.once('timeout', () => {
            if (socket.readyState !== 'open') {
                socket.destroy();

                const e = new Error('Connection timeout');
                e.code = 'ETIMEDOUT';
                e.syscall = 'connect';

                resolve({
                    left: e,
                });
            }
        });
        
        socket.connect(options.port, options.host);
    });
}
