import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || {{port}};
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());

// Compression for responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Logging with Pino (high-performance logger)
app.use(pinoHttp({
  level: isProduction ? 'info' : 'debug',
  transport: !isProduction ? { target: 'pino-pretty' } : undefined,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    service: '{{serviceName}}',
    domain: '{{domain}}',
    status: 'healthy',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`{{ServiceName}} service listening on port ${PORT}`);
});