import * as forge from 'node-forge';

// Function to generate RSA key pairs and return as JSON
export const generateRSAKeyPairs = () => {
    try {
        // Generate RSA key pair
        const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        const publicKey = forge.pki.publicKeyToPem(keys.publicKey);
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey);

        const keyPair = {
            publicKey,
            privateKey,
        };

        return keyPair;
    } catch (error) {
        console.error('Key pair generation error:', error);
        throw new Error('Key pair generation failed.');
    }
};
