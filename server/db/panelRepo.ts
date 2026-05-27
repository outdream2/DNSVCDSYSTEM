/**
 * ActivePanel 저장소
 * 현재: JSON 파일 기반 (서버 재시작 후 상태 복원)
 * DB_ENABLED=true + MSSQL 설치 시 하단 DB 구현체로 교체
 */

import path from 'path';
import fs from 'fs';
// import { getPool } from './connection';

export interface ActivePanel {
  id: number;
  status: string;
  description: string;
}

const STATE_FILE = path.join(process.cwd(), 'panels-state.json');

function loadFromFile(): ActivePanel[] {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveToFile(panels: ActivePanel[]): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(panels), 'utf-8');
  } catch {}
}

let cache: ActivePanel[] = loadFromFile();

// ─── 공개 API ─────────────────────────────────────────────────────

export async function getAll(): Promise<ActivePanel[]> {
  // DB 사용 시: const pool = await getPool(); const r = await pool.request().query('SELECT * FROM VCD_ActivePanels'); return r.recordset;
  return cache;
}

export async function setAll(panels: ActivePanel[]): Promise<void> {
  // DB 사용 시: 기존 레코드 삭제 후 INSERT
  cache = panels;
  saveToFile(panels);
}

export async function clear(): Promise<void> {
  // DB 사용 시: await pool.request().query('DELETE FROM VCD_ActivePanels');
  cache = [];
  saveToFile([]);
}

// ─── MSSQL 구현체 (주석 해제 후 위 함수들과 교체) ─────────────────
// -- 테이블 스키마
// CREATE TABLE VCD_ActivePanels (
//   Id          INT NOT NULL PRIMARY KEY,
//   Status      NVARCHAR(20) NOT NULL,
//   Description NVARCHAR(200) NOT NULL,
//   UpdatedAt   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
// );
