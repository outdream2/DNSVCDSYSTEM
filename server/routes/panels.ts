import { Application } from 'express';
import { ActivePanel, getAll, setAll, clear } from '../db/panelRepo';

export function setupPanelRoutes(app: Application): void {
  app.get('/api/active-panels', async (req, res) => {
    res.json({ panels: await getAll() });
  });

  app.post('/api/active-panels', async (req, res) => {
    const body = req.body;
    const toPanel = (item: any): ActivePanel | null => {
      const id = Number(item.id);
      if (isNaN(id) || id < 1 || id > 48) return null;
      return { id, status: String(item.status ?? ''), description: String(item.description ?? '') };
    };

    let newPanels: ActivePanel[];
    if (Array.isArray(body)) {
      newPanels = body.map(toPanel).filter((p): p is ActivePanel => p !== null);
    } else if (body && typeof body === 'object') {
      const panel = toPanel(body);
      newPanels = panel ? [panel] : [];
    } else {
      res.status(400).json({ status: 'error', message: 'Body must be { id, description } or array of those.' });
      return;
    }

    await setAll(newPanels);
    console.log('Updated active panels:', newPanels);
    res.json({ status: 'success', panels: await getAll() });
  });

  app.delete('/api/active-panels', async (req, res) => {
    await clear();
    res.json({ status: 'success', panels: [] });
  });
}
