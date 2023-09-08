import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes'; // Import your router

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Middleware to validate route path
const validateRoute = (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== '/encrypt' && req.path !== '/decrypt' && req.path !== '/key-gen') {
        return res.status(404).json({ error: 'Route not found.' });
    }
    next();
};

app.use(validateRoute); // Apply the validation middleware

// Use the router for specific routes
app.use('/', router); // Replace '/' with your desired base URL path

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err); // Log the error to the console
    res.status(500).json({ error: 'Internal server error.' });
});

