import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import app from './server';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Promptora server running on http://0.0.0.0:${PORT}`);
});
