import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db, setupDatabase } from '../database';

const app = express();
const PORT = 3000;

setupDatabase();

app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json());

app.post('/message', (req: Request, res: Response) => {
  const { sender, destinatary, content, timestamp } = req.body;
  
  const stmt = db.prepare("INSERT INTO messages (sender, destinatary, content, timestamp) VALUES (?, ?, ?, ?)");
  stmt.run([sender, destinatary, content, timestamp], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Updated the endpoint to filter messages for a specific destinatary
app.get('/messages/:publicKey', (req: Request, res: Response) => {
    const destinatary = req.params.publicKey;
    console.log(destinatary)

    db.all(`SELECT * FROM messages WHERE destinatary = '${destinatary}'`, [], (err, rows) => {

        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('ROWS', rows);
        res.json(rows);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
