/**
 * 서버·클라이언트 공유 타입 정의
 * 이 파일 하나를 양쪽이 import — 타입 드리프트 원천 차단
 */

export interface ActivePanel {
  id: number;
  status: string;
  description: string;
}

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

// API 응답 공통 래퍼
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

export interface OperationsResponse {
  operations: Operation[];
}

export interface PanelsResponse {
  panels: ActivePanel[];
}
