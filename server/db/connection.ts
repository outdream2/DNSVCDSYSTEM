/**
 * MSSQL 연결 설정
 * 실제 DB 사용 시: npm install mssql @types/mssql 설치 후 주석 해제
 */

// import sql from 'mssql';

export const DB_CONFIG = {
  server:   process.env.DB_SERVER   ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME     ?? 'VCDSystem',
  user:     process.env.DB_USER     ?? 'sa',
  password: process.env.DB_PASSWORD ?? '',
  options: {
    encrypt:              false,
    trustServerCertificate: true,
  },
};

export const DB_ENABLED = Boolean(process.env.DB_ENABLED);

// let pool: sql.ConnectionPool | null = null;

// export async function getPool(): Promise<sql.ConnectionPool> {
//   if (!pool) {
//     pool = await new sql.ConnectionPool(DB_CONFIG).connect();
//     console.log('[DB] MSSQL 연결 성공');
//   }
//   return pool;
// }
