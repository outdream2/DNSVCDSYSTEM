/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
