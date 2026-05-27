/**
 * Typed HTTP client for the VCD 3D monitoring system backend.
 *
 * All requests are issued against the same origin (base URL is intentionally
 * empty), and responses are parsed into the domain types declared in
 * ./types. Each function throws if the network request fails or the server
 * returns a non-OK status code.
 */

import type { ActivePanel, Operation } from './types';

const BASE_URL = '';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

async function ensureOk(response: Response, action: string): Promise<Response> {
  if (!response.ok) {
    throw new Error(`Failed to ${action}: ${response.status} ${response.statusText}`);
  }
  return response;
}

/** Returns the currently-active panels reported by the backend. */
export async function getActivePanels(): Promise<ActivePanel[]> {
  const response = await fetch(`${BASE_URL}/api/active-panels`);
  await ensureOk(response, 'fetch active panels');
  const data = (await response.json()) as { panels?: ActivePanel[] };
  return Array.isArray(data.panels) ? data.panels : [];
}

/** Replaces the active panel list on the backend with the given panels. */
export async function setActivePanels(
  panels: ActivePanel[],
): Promise<{ status: string; panels: ActivePanel[] }> {
  const response = await fetch(`${BASE_URL}/api/active-panels`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(panels),
  });
  await ensureOk(response, 'set active panels');
  return (await response.json()) as { status: string; panels: ActivePanel[] };
}

/** Clears all active panels on the backend. */
export async function deleteActivePanels(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/active-panels`, {
    method: 'DELETE',
  });
  await ensureOk(response, 'delete active panels');
}

/** Filters accepted by the operations endpoint. */
export interface OperationFilters {
  panelId?: number;
  status?: string;
  from?: string;
  to?: string;
}

/** Returns the operation log, optionally filtered. */
export async function getOperations(filters?: OperationFilters): Promise<Operation[]> {
  const params = new URLSearchParams();
  if (filters?.panelId !== undefined) params.set('panelId', String(filters.panelId));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);

  const query = params.toString();
  const url = `${BASE_URL}/api/operations${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  await ensureOk(response, 'fetch operations');
  const data = (await response.json()) as { operations?: Operation[] };
  return Array.isArray(data.operations) ? data.operations : [];
}

/** Payload accepted by createOperation. */
export interface CreateOperationInput {
  panelId: number;
  unitId: string;
  panelName: string;
  opType: string;
  operator: string;
  department: string;
  purpose: string;
  notes: string;
}

/** Creates a new operation entry on the backend and returns the persisted row. */
export async function createOperation(data: CreateOperationInput): Promise<Operation> {
  const response = await fetch(`${BASE_URL}/api/operations`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  await ensureOk(response, 'create operation');
  return (await response.json()) as Operation;
}

/** Marks the given operation ids as completed. */
export async function completeOperations(ids: number[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/operations/complete`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ ids }),
  });
  await ensureOk(response, 'complete operations');
}
