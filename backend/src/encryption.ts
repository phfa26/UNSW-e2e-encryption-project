import crypto from 'crypto';

// Function to encrypt a message using the sender's private key and receiver's public key
export const encryptMessage = (message: string, senderPublicKey: string, receiverPublicKey: string) => {
  try {
    console.log(receiverPublicKey)
    const encryptedMessage = crypto.publicEncrypt(
      {
        key: receiverPublicKey,
      },
      Buffer.from(message + `\n\rFrom: ${senderPublicKey}`) 
    );

    console.log()

    return encryptedMessage.toString('base64'); // Return the encrypted message as Base64 string
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed.');
  }
};

// Function to decrypt an encrypted message using the receiver's private key and sender's public key
export const decryptMessage = (encryptedMessage: string, receiverPrivateKey: string) => {
  try {
    const decryptedMessage = crypto.privateDecrypt(
      {
        key: receiverPrivateKey.split(String.raw`\n`).join('\n'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedMessage, 'base64')
    );

    return decryptedMessage.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed.');
  }
};
