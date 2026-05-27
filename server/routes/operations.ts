import { Application } from 'express';
import { Operation } from '../store/state';
import * as operationRepo from '../db/operationRepo';

export function setupOperationRoutes(app: Application): void {
  app.get('/api/operations', async (req, res) => {
    const { panelId, status, from, to } = req.query as Record<string, string>;
    const result = await operationRepo.findAll({
      panelId: panelId ? Number(panelId) : undefined,
      status,
      from,
      to,
    });
    res.json({ operations: result });
  });

  app.post('/api/operations', async (req, res) => {
    const b = req.body;
    if (!b.panelId || !b.unitId || !b.opType || !b.operator) {
      res.status(400).json({ error: '필수 항목 누락' });
      return;
    }
    const data: Omit<Operation, 'id'> = {
      panelId:    Number(b.panelId),
      unitId:     String(b.unitId),
      panelName:  String(b.panelName ?? ''),
      opType:     b.opType,
      operator:   String(b.operator),
      department: String(b.department ?? ''),
      purpose:    String(b.purpose ?? ''),
      status:     '진행중',
      notes:      String(b.notes ?? ''),
      operatedAt: new Date().toISOString().slice(0, 19),
    };
    const op = await operationRepo.insert(data);
    console.log('New operation:', op);
    res.json({ status: 'success', operation: op });
  });

  app.patch('/api/operations/complete', async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      res.status(400).json({ error: 'ids 배열 필요' });
      return;
    }
    const count = await operationRepo.complete(ids);
    res.json({ status: 'success', completed: count });
  });
}
