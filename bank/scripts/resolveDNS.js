import dns from 'node:dns';

export const resolveDNS = (hostname) => {
    return new Promise((resolve) => {      
        dns.resolve4(hostname, (e, addresses) => {
            if (e) {
                resolve({
                    left: e,
                });
            } else {
                resolve({
                    right: {
                        addresses,
                    },
                });
            }
        });
    });
}
