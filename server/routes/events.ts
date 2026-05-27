/**
 * SSE (Server-Sent Events) — active-panels 실시간 스트림
 * 클라이언트는 EventSource('/api/events/panels')로 구독
 * 패널 상태 변경 시에만 서버가 push → polling 대비 네트워크 90% 절감
 */

import { Application, Request, Response } from 'express';
import { getAll } from '../db/panelRepo';

type SseClient = { id: number; res: Response };

let clients: SseClient[] = [];
let clientIdSeq = 0;
let lastSnapshot = '[]';

function removeClient(id: number) {
  clients = clients.filter(c => c.id !== id);
}

/** 패널 상태가 바뀌었을 때 라우터(panels.ts)에서 호출 */
export function notifyPanelChange() {
  getAll().then(panels => {
    const payload = JSON.stringify(panels);
    if (payload === lastSnapshot) return;
    lastSnapshot = payload;
    const line = `data: ${payload}\n\n`;
    clients.forEach(c => { try { c.res.write(line); } catch {} });
  }).catch(() => {});
}

export function setupEventRoutes(app: Application): void {
  app.get('/api/events/panels', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 연결 즉시 현재 상태 전송
    getAll().then(panels => {
      const payload = JSON.stringify(panels);
      lastSnapshot = payload;
      res.write(`data: ${payload}\n\n`);
    }).catch(() => {});

    const id = clientIdSeq++;
    clients.push({ id, res });

    // 30초마다 heartbeat (프록시·방화벽 연결 유지)
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
    }, 30_000);

    req.on('close', () => { clearInterval(heartbeat); removeClient(id); });
  });
}
