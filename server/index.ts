import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { setupPanelRoutes } from './routes/panels';
import { setupOperationRoutes } from './routes/operations';

export async function startServer(): Promise<void> {
  const app = express();
  const PORT = 8000;

  app.use(cors());
  app.use(express.json());

  // 정적 파일 서빙 최우선 (public 폴더)
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  // .glb 파일 요청에 대해 HTML로 리다이렉트되지 않도록 명시적 처리
  app.get('/*.glb', (req, res) => {
    const purePath = req.path.split('?')[0];
    const fileName = purePath.startsWith('/') ? purePath.substring(1) : purePath;
    const filePath = path.join(publicPath, fileName);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      console.error(`[ERROR] GLB Not Found: ${filePath} (Original path: ${req.path})`);
      res.status(404).send('Model not found');
    }
  });

  setupPanelRoutes(app);
  setupOperationRoutes(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
