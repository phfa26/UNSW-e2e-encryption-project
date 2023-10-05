import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import forge from 'node-forge';

interface Message {
    sender: string;
    destinatary: string;
    content: string;
    timestamp: string;
}

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [destinatary, setDestinatary] = useState<string>('');
    const [privateKey, setPrivateKey] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);

    const downloadRef = useRef<HTMLAnchorElement>(null); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getPublicKeyFromPrivateKey = (privateKeyPem: any) => {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
        return forge.pki.publicKeyToPem(publicKey);
    };

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
  
          reader.onload = (e: ProgressEvent<FileReader>) => {
              const content = e.target?.result;
              if (typeof content === 'string') {
                  const pubKey = getPublicKeyFromPrivateKey(content);
                  // Only update state if values have changed
                  if (privateKey !== content) setPrivateKey(content);
                  if (currentUser !== pubKey) setCurrentUser(pubKey);
              }
          };
  
          reader.readAsText(file);
          
          // Reset the file input value after processing
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      }
    }, [privateKey, currentUser]);
  

    const encryptMessage = (message: string, publicKeyPem: string) => {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encrypted = publicKey.encrypt(message);
        return forge.util.encode64(encrypted);
    };

    const decryptMessage = (encryptedMessage: string, privateKeyPem: string) => {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const decrypted = privateKey.decrypt(forge.util.decode64(encryptedMessage));
        return decrypted;
    };

    const generateAndDownloadKeys = () => {
        const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
        const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
        const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

        setPrivateKey(privateKeyPem);
        setCurrentUser(publicKeyPem);

        const blob = new Blob([privateKeyPem], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        if (downloadRef.current) {
          downloadRef.current.href = url;
          downloadRef.current.download = 'private_key.pem';
          downloadRef.current.click();
      }

        window.URL.revokeObjectURL(url);
    };

    const sendMessage = async () => {

      // Check for empty or whitespace-only messages
      if (!input.trim()) {
        setError("Cannot send an empty message.");
        return;
      }

      if (!privateKey) {
          setError("Load a valid key pair before sending messages.");
      return;
      }

    try {
        const encryptedContent = encryptMessage(input, destinatary);
        let response = await fetch('http://localhost:3000/message', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: currentUser,
                destinatary: destinatary,
                content: encryptedContent,
                timestamp: new Date().toISOString()
            })
        });
        
        let data = await response.json();
        if (data.success) {
            setInput(''); 
            setMessages(prevMessages => [...prevMessages, {
                sender: currentUser,
                destinatary: destinatary,
                content: input,
                timestamp: new Date().toISOString()
            }]);
        }
    } catch (error) {
        setError("Error sending message.");
        console.error("Error sending message:", error);
    }
  };

  const fetchReceivedMessages = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:3000/messages/${encodeURIComponent(currentUser)}`);
        let data = await response.json();
  
        if (data && data.length > 0) {
          const decryptedMessages = data.map((msg: Message) => ({
            ...msg,
            content: decryptMessage(msg.content, privateKey)
        }));
        
        decryptedMessages.sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setMessages(decryptedMessages);
      } else {
          console.log("No messages found for the current user.");
      }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
    setLoading(false);
  }, [currentUser, privateKey]); // Dependencies for useCallback
  
  useEffect(() => {
    if (!currentUser) return;  // Make sure there's a user
    fetchReceivedMessages();
  }, [currentUser, fetchReceivedMessages, privateKey]);


    return (
        <div className="App">
            {error && <div className="error">{error}</div>}
            <div className="messages">
                {loading && <div>Loading...</div>}
                {messages.map((message: any, index) => (
                    <div key={index} className={`message ${message.sender === currentUser ? 'sent' : 'received'}`}>
                        <div className="sender">{message.sender}</div>
                        {message.content}
                        {message.sender !== currentUser && (
                            <button className="respond-button" onClick={() => setDestinatary(message.sender)}>
                                Respond
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <label>
                    Load Private Key:
                    <input type="file" onChange={handleFileChange} accept=".pem" ref={fileInputRef} />
                </label>
                <button onClick={() => setShowPrivateKey(!showPrivateKey)}>Toggle Private Key</button>
                {showPrivateKey && <textarea value={privateKey} readOnly placeholder="Your Private Key" rows={4} />}
                <button onClick={generateAndDownloadKeys}>Create Keys</button>
                <a ref={downloadRef} style={{ display: 'none' }} href="/#">Download</a>
                <input value={destinatary} onChange={(e) => setDestinatary(e.target.value)} placeholder="Destinatary Public Key" />
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
                <button onClick={sendMessage} disabled={!input.trim()}>Send</button>
            </div>
            <div className="public-key-display">
                <h3>Your Public Key:</h3>
                <textarea value={currentUser} readOnly rows={4} />
            </div>
        </div>
    );
}

export default App;
