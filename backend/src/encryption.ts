import * as forge from 'node-forge';

// Function to encrypt a message using the sender's private key and receiver's public key
export const encryptMessage = (message: string, receiverPublicKey: string) => {
  try {
    console.log(receiverPublicKey)
    const publicKey = forge.pki.publicKeyFromPem(receiverPublicKey);

    const messageBytes = forge.util.encodeUtf8(message);
    const encryptedMessage = publicKey.encrypt(messageBytes, 'RSA-OAEP');

    return forge.util.encode64(encryptedMessage); // Return the encrypted message as Base64 string
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed.');
  }
};

// Function to decrypt an encrypted message using the receiver's private key and sender's public key
export const decryptMessage = (encryptedMessage: string, receiverPrivateKey: string) => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(receiverPrivateKey);

    const encryptedMessageBytes = forge.util.decode64(encryptedMessage); // Decode Base64 message
    const decryptedMessageBytes = privateKey.decrypt(encryptedMessageBytes, 'RSA-OAEP');

    return forge.util.decodeUtf8(decryptedMessageBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed.');
  }
};
