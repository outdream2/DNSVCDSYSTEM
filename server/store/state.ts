// ─── 공유 타입 정의 ────────────────────────────────────────────────
// 실제 데이터 접근은 server/db/ 레포지토리를 사용하세요.

export interface Operation {
  id: number;
  panelId: number;
  unitId: string;
  panelName: string;
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT';
  operator: string;
  department: string;
  purpose: string;
  status: '완료' | '진행중' | '실패';
  notes: string;
  operatedAt: string;
}

// ─── MSSQL 테이블 스키마 (VCD_Operations) ─────────────────────────
// CREATE TABLE VCD_Operations (
//   Id         INT IDENTITY(1,1) PRIMARY KEY,
//   PanelId    INT NOT NULL,
//   UnitId     NVARCHAR(20) NOT NULL,
//   PanelName  NVARCHAR(100) NOT NULL,
//   OpType     NVARCHAR(20) NOT NULL,   -- KEY CLOSED / KEY OPEN / KEY ALERT
//   Operator   NVARCHAR(50) NOT NULL,
//   Department NVARCHAR(50) NOT NULL,
//   Purpose    NVARCHAR(200),
//   Status     NVARCHAR(20) NOT NULL,   -- 완료 / 진행중 / 실패
//   Notes      NVARCHAR(500),
//   OperatedAt DATETIME2 NOT NULL,
//   CreatedAt  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
// );
