import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes'; // Import your router

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Check if the app is running in the production environment
const isProduction = process.env.NODE_ENV === 'production';

// Conditionally apply CORS middleware
if (isProduction) {
    //TODO: fix allowed origins to include frontend server once it's up
    const allowedOrigins = ['domain.com'];

    const corsOptions = {
        origin: (origin: string | undefined, callback: (error: Error | null, allow: boolean) => void) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true); // Allow the request
            } else {
                callback(new Error('Not allowed by CORS'), false); // Deny the request
            }
        },
        methods: 'GET,POST',
        credentials: true,
        optionsSuccessStatus: 204,
    };
    
    // Handle preflight requests
    app.options('*', cors(corsOptions));

    app.use(cors(corsOptions));
}
else app.use(cors());

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

