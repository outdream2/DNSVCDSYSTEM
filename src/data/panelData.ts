/**
 * Static panel catalog and GLB-related constants for the VCD 3D monitoring
 * system. Extracted from src/App.tsx.
 *
 * PANEL_DATA holds metadata for all 47 panels (right cabinet: 1-24,
 * left cabinet: 25-47). Helper functions provide safe lookups with sensible
 * fallbacks when a panel id is unknown.
 */

import type { PanelInfo } from './types';

export const GLB_SCALE = 0.02;
export const GLB_SCALE_Y = GLB_SCALE * 1.65; // 높이 기존 1.5배에서 10% 추가 증가
export const GLB_VERSION = 'v1.1';

export const PANEL_DATA: Record<number, PanelInfo> = {
  //오른쪽 캐비겟 앞에서 KOEN글씨쪽으로 증가 (1->24)
  1: { glbKey: 'A', unitId: 'UNIT-10E', name: 'PAF-C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  2: { glbKey: 'A', unitId: 'UNIT-10F', name: 'PAF-D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  3: { glbKey: 'A', unitId: 'UNIT-10C', name: 'PAF-A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  4: { glbKey: 'A', unitId: 'UNIT-10D', name: 'PAF-B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  5: { glbKey: 'F', unitId: 'UNIT-10A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  6: { glbKey: 'A', unitId: 'UNIT-10B', name: 'FDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  7: { glbKey: 'B', unitId: 'UNIT-09A', name: 'PC TR UNIT-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  8: { glbKey: 'B', unitId: 'UNIT-09B', name: 'IDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  9: { glbKey: 'A', unitId: 'UNIT-08A', name: 'COP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  10: { glbKey: 'A', unitId: 'UNIT-08B', name: 'COP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  11: { glbKey: 'A', unitId: 'UNIT-07A', name: 'MTR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  12: { glbKey: 'A', unitId: 'UNIT-07B', name: 'STAGE 2 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  13: { glbKey: 'A', unitId: 'UNIT-06A', name: 'VERTICAL MILL C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  14: { glbKey: 'A', unitId: 'UNIT-06B', name: 'VERTICAL MILL D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  15: { glbKey: 'A', unitId: 'UNIT-05A', name: 'VERTICAL MILL A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  16: { glbKey: 'A', unitId: 'UNIT-05B', name: 'VERTICAL MILL B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  17: { glbKey: 'A', unitId: 'UNIT-04A', name: 'BFP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  18: { glbKey: 'A', unitId: 'UNIT-04B', name: 'BFP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  19: { glbKey: 'A', unitId: 'UNIT-03A', name: 'IDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  20: { glbKey: 'A', unitId: 'UNIT-03B', name: 'FDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  21: { glbKey: 'B', unitId: 'UNIT-02A', name: 'PC TR UNIT-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  22: { glbKey: 'B', unitId: 'UNIT-02B', name: '#2 BIOMASS STORAGE BACK-UP TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  23: { glbKey: 'E', unitId: 'UNIT-01A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  24: { glbKey: 'D', unitId: 'UNIT-01B', name: 'AUX TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },

  //왼쪽캐비겟 KOEN글씨쪽에서  앞으로 증가(25->47)
  25: { glbKey: 'C', unitId: 'COM-20A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  26: { glbKey: 'D', unitId: 'COM-20B', name: 'START-UP TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  27: { glbKey: 'A', unitId: 'COM-19A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  28: { glbKey: 'B', unitId: 'COM-19B', name: 'INTAKE FEEDER', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  29: { glbKey: 'B', unitId: 'COM-18A', name: 'PC TR COM-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  30: { glbKey: 'B', unitId: 'COM-18B', name: 'FGD', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  31: { glbKey: 'B', unitId: 'COM-17A', name: 'NO.2 2D BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  32: { glbKey: 'B', unitId: 'COM-17B', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  33: { glbKey: 'B', unitId: 'COM-16A', name: 'NO.2 2C BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  34: { glbKey: 'B', unitId: 'COM-16B', name: 'PC TR COM-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  35: { glbKey: 'A', unitId: 'COM-15A', name: '#1신사옥 TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  36: { glbKey: 'A', unitId: 'COM-15B', name: 'BFP-C', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  37: { glbKey: 'B', unitId: 'COM-14A', name: 'FLY ASH SYSTEM', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  38: { glbKey: 'A', unitId: 'COM-14B', name: 'ASP-B', type: '차단기', systemCode: '533140', systemName: '#1,2 회처리계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  39: { glbKey: 'B', unitId: 'COM-13A', name: '#3 BIOMASS STORAGE TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  40: { glbKey: 'B', unitId: 'COM-13B', name: 'UNIT-COM BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  41: { glbKey: 'A', unitId: 'UNIT-12A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  42: { glbKey: 'A', unitId: 'UNIT-12B', name: 'ASP-A', type: '차단기', systemCode: '531160', systemName: '#1 회처리계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  43: { glbKey: 'F', unitId: 'UNIT-11A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  44: { glbKey: 'A', unitId: 'UNIT-11B', name: 'HGRF', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  45: { glbKey: 'A', unitId: 'UNIT-10G', name: 'STAGE 1 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  46: { glbKey: 'B', unitId: 'UNIT-10H', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  47: { glbKey: 'G', unitId: 'UNIT-10I', name: 'STAGE 1 HAMMER MILL VC', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
};

/** Returns the display name for a panel id, or a fallback `PANEL <id>`. */
export function getDesc(panelId: number): string {
  return PANEL_DATA[panelId]?.name ?? `PANEL ${panelId}`;
}

/** Returns the unit id for a panel, or a zero-padded fallback. */
export function getUnitId(panelId: number): string {
  return PANEL_DATA[panelId]?.unitId ?? String(panelId).padStart(2, '0');
}

/** Returns the GLB asset key for a panel, defaulting to 'A'. */
export function getGlbKey(panelId: number): string {
  return PANEL_DATA[panelId]?.glbKey ?? 'A';
}
