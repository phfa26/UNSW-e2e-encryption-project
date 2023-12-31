import express, { Request, Response } from 'express';
import { encryptMessage, decryptMessage } from './encryption'; // Import your encryption functions
import {generateRSAKeyPairs } from './utils/keyGen';

const router = express.Router();

// Route to generate RSA key pairs and return as JSON
router.get('/key-gen', (req: Request, res: Response) => {
    try {
        const keyPairs = generateRSAKeyPairs();
        res.json(keyPairs);
    } catch (error) {
        console.error('Error generating keys:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Define a route for encrypting messages
router.post('/encrypt', (req: Request, res: Response) => {
    try {
        const { message, senderPublicKey, receiverPublicKey } = req.body;

        if (!message || !senderPublicKey || !receiverPublicKey)
            return res.status(400).json({ error: 'Message, Sender Public Key, and Receiver Public Key are required.' });

        const encryptedMessage = encryptMessage(message, receiverPublicKey);
        res.json({ encryptedMessage, senderPublicKey });
    } catch (error) {
        console.error('Error encrypting message:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Define a route for decrypting messages
router.post('/decrypt', (req: Request, res: Response) => {
    try {
        const { encryptedMessage, receiverPrivateKey } = req.body;

        if (!encryptedMessage || !receiverPrivateKey) {
            return res.status(400).json({ error: 'Encrypted message and Receiver Private Key are required.' });
        }

        const decryptedMessage = decryptMessage(encryptedMessage, receiverPrivateKey);

        res.json({ decryptedMessage });
    } catch (error) {
        console.error('Error decrypting message:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
 