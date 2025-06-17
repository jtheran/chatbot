import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import passportJWT from './middlewares/passport.js';
import authRoutes from './routes/auth.route.js';
import maintenaceRoutes from './routes/maintenance.route.js';
import emailRoutes from './routes/email.routes.js';
import wspRoutes from './routes/wsp.routes.js';
import iaRoutes from './routes/ia.routes.js';

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('morgan'));
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(csurf({ cookie: true }));
app.use(passport.initialize());
passport.use(passportJWT);


//Routes

app.use('/api', maintenaceRoutes);
app.use('/api', authRoutes);
app.use('/api', emailRoutes);
app.use('/api', wspRoutes);
app.use('/api', iaRoutes);
app.get('/api/qr', (req, res) => {
    const qrPath = path.join(__dirname, 'public', 'qr.png');
    res.status(200).sendFile(qrPath);
});



export default server;