// 서버·클라이언트 공유 타입 — shared/types.ts가 단일 정의 소스
export type { ActivePanel, Operation, ApiResponse, OperationsResponse, PanelsResponse } from '../../shared/types';

// 프론트엔드 전용 타입
export interface PanelInfo {
  glbKey: string;
  unitId: string;
  name: string;
  type: string;
  systemCode: string;
  systemName: string;
  groupCode: string;
  groupMcs: string;
}

export interface Placement {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  panelId: number;
  desc: string;
  unitId: string;
  doubleHeight?: boolean;
}
