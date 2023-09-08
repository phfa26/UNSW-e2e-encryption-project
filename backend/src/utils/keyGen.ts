import crypto from 'crypto';

// Function to generate ECC key pairs and return as JSON
export const generateECCKeyPairs = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1', // You can choose other named curves if needed
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'sec1', format: 'pem' }
    });

    const publicKeyText = publicKey.toString().trim();
    const privateKeyText = privateKey.toString().trim();

    const keyPair = {
        publicKey: publicKeyText,
        privateKey: privateKeyText
    };

    return keyPair;
};
