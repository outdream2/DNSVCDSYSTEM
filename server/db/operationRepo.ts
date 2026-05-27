/**
 * Operation 저장소
 * DB_ENABLED=true + MSSQL 설치 시 하단 DB 구현체로 교체
 */

import { Operation } from '../store/state';
// import { getPool } from './connection';

// ─── 인메모리 데이터 (개발/오프라인용) ────────────────────────────
let operations: Operation[] = [
  { id:1,  panelId:3,  unitId:'UNIT-02A', panelName:'PC TR UNIT-B',            opType:'KEY CLOSED', operator:'김철수', department:'전기팀',   purpose:'정기 점검 후 복전', status:'완료',   notes:'',             operatedAt:'2026-05-15T09:10:00' },
  { id:2,  panelId:12, unitId:'UNIT-06B', panelName:'VERTICAL MILL D',         opType:'KEY OPEN',   operator:'이영희', department:'운전팀',   purpose:'모터 교체 작업',   status:'완료',   notes:'작업완료 확인', operatedAt:'2026-05-15T11:30:00' },
  { id:3,  panelId:24, unitId:'UNIT-10F', panelName:'PAF-D',                   opType:'KEY ALERT',  operator:'박민준', department:'전기팀',   purpose:'절연 시험',        status:'완료',   notes:'합격',          operatedAt:'2026-05-16T08:00:00' },
  { id:4,  panelId:43, unitId:'COM-18B',  panelName:'FGD',                     opType:'KEY CLOSED', operator:'최지수', department:'환경팀',   purpose:'설비 재가동',       status:'완료',   notes:'',             operatedAt:'2026-05-16T13:45:00' },
  { id:5,  panelId:7,  unitId:'UNIT-04A', panelName:'BFP-A',                   opType:'KEY OPEN',   operator:'정현우', department:'운전팀',   purpose:'배관 보수',         status:'완료',   notes:'밸브 교체 포함', operatedAt:'2026-05-17T07:20:00' },
  { id:6,  panelId:15, unitId:'UNIT-08A', panelName:'COP-A',                   opType:'KEY ALERT',  operator:'김철수', department:'전기팀',   purpose:'예방 정비',         status:'완료',   notes:'',             operatedAt:'2026-05-17T10:00:00' },
  { id:7,  panelId:29, unitId:'UNIT-11B', panelName:'HGRF',                    opType:'KEY CLOSED', operator:'윤서연', department:'전기팀',   purpose:'복전 조작',         status:'완료',   notes:'',             operatedAt:'2026-05-18T08:30:00' },
  { id:8,  panelId:35, unitId:'COM-14B',  panelName:'ASP-B',                   opType:'KEY OPEN',   operator:'이영희', department:'운전팀',   purpose:'필터 청소',         status:'완료',   notes:'',             operatedAt:'2026-05-18T14:00:00' },
  { id:9,  panelId:9,  unitId:'UNIT-05A', panelName:'VERTICAL MILL A',         opType:'KEY ALERT',  operator:'박민준', department:'전기팀',   purpose:'절연저항 측정',     status:'실패',   notes:'재시험 필요',    operatedAt:'2026-05-18T16:30:00' },
  { id:10, panelId:21, unitId:'UNIT-10C', panelName:'PAF-A',                   opType:'KEY CLOSED', operator:'최지수', department:'환경팀',   purpose:'정기 복전',         status:'완료',   notes:'',             operatedAt:'2026-05-19T08:00:00' },
  { id:11, panelId:5,  unitId:'UNIT-03A', panelName:'IDF-B',                   opType:'KEY OPEN',   operator:'정현우', department:'운전팀',   purpose:'임펠러 교체',        status:'진행중', notes:'작업 중',       operatedAt:'2026-05-19T09:30:00' },
  { id:12, panelId:39, unitId:'COM-16B',  panelName:'PC TR COM-A',             opType:'KEY ALERT',  operator:'김철수', department:'전기팀',   purpose:'TR 부하 시험',       status:'완료',   notes:'정상',          operatedAt:'2026-05-19T10:15:00' },
  { id:13, panelId:14, unitId:'UNIT-07B', panelName:'STAGE 2 HAMMER MILL',     opType:'KEY CLOSED', operator:'윤서연', department:'전기팀',   purpose:'수리 후 복전',       status:'완료',   notes:'',             operatedAt:'2026-05-19T11:00:00' },
  { id:14, panelId:47, unitId:'COM-20B',  panelName:'START-UP TR INCOMING',    opType:'KEY OPEN',   operator:'이영희', department:'운전팀',   purpose:'TR 점검',           status:'진행중', notes:'',             operatedAt:'2026-05-19T13:00:00' },
  { id:15, panelId:31, unitId:'UNIT-12B', panelName:'ASP-A',                   opType:'KEY ALERT',  operator:'박민준', department:'전기팀',   purpose:'절연 시험',         status:'진행중', notes:'',             operatedAt:'2026-05-19T14:30:00' },
];
let nextId = 16;

// ─── 공개 API (라우터에서 호출) ────────────────────────────────────

export async function findAll(filter: { panelId?: number; status?: string; from?: string; to?: string } = {}): Promise<Operation[]> {
  // DB 사용 시: return queryDB(filter);
  let list = [...operations];
  if (filter.panelId) list = list.filter(o => o.panelId === filter.panelId);
  if (filter.status)  list = list.filter(o => o.status === filter.status);
  if (filter.from)    list = list.filter(o => o.operatedAt >= filter.from!);
  if (filter.to)      list = list.filter(o => o.operatedAt <= filter.to! + 'T23:59:59');
  return list.sort((a, b) => b.operatedAt.localeCompare(a.operatedAt));
}

export async function insert(data: Omit<Operation, 'id'>): Promise<Operation> {
  // DB 사용 시: const result = await pool.request().input(...).query('INSERT INTO VCD_Operations ...'); return findById(result.recordset[0].Id);
  const op: Operation = { id: nextId++, ...data };
  operations.push(op);
  return op;
}

export async function complete(ids: number[]): Promise<number> {
  // DB 사용 시: await pool.request().query(`UPDATE VCD_Operations SET Status='완료' WHERE Id IN (${ids.join(',')})`);
  let count = 0;
  for (const id of ids) {
    const op = operations.find(o => o.id === id);
    if (op) { op.status = '완료'; count++; }
  }
  return count;
}

// ─── MSSQL 구현체 (주석 해제 후 위 함수들과 교체) ─────────────────
// async function queryDB(filter: ...) {
//   const pool = await getPool();
//   let q = 'SELECT * FROM VCD_Operations WHERE 1=1';
//   const req = pool.request();
//   if (filter.panelId) { q += ' AND PanelId=@pid'; req.input('pid', filter.panelId); }
//   if (filter.status)  { q += ' AND Status=@st';   req.input('st',  filter.status);  }
//   if (filter.from)    { q += ' AND OperatedAt>=@fr'; req.input('fr', filter.from);  }
//   if (filter.to)      { q += ' AND OperatedAt<=@to'; req.input('to', filter.to + 'T23:59:59'); }
//   q += ' ORDER BY OperatedAt DESC';
//   const r = await req.query(q);
//   return r.recordset.map(mapRow);
// }
//
// function mapRow(row: any): Operation {
//   return {
//     id: row.Id, panelId: row.PanelId, unitId: row.UnitId, panelName: row.PanelName,
//     opType: row.OpType, operator: row.Operator, department: row.Department,
//     purpose: row.Purpose ?? '', status: row.Status, notes: row.Notes ?? '',
//     operatedAt: row.OperatedAt.toISOString().slice(0, 19),
//   };
// }
