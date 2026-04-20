export const getCertificateExpiry = (tlsSocket) => {
    try {
        const cert = tlsSocket.getPeerCertificate();
        if (cert && cert.valid_to) {
            return new Date(cert.valid_to).toISOString();
        }
        return null;
    } catch (e) {
        return {
            message: e.message,
            code: e.code,
        };
    }
}
  