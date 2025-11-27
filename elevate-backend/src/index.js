import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config.js';
import judgeRoutes from './routes/judgeRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'elevate-backend', version: '1.0.0' });
});

app.use('/api/judge', judgeRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Not found',
  });
});

app.listen(PORT, () => {
  console.log(`Elevate backend listening on port ${PORT}`);
});


