/**
 * Organizational reference data: departments, work reasons, and team rosters.
 * Extracted from src/App.tsx.
 *
 * These constants are surfaced in dropdowns inside the registration, start,
 * and completion modals.
 */

export const DEPARTMENTS = [
  '전기팀',
  '운전팀',
  '환경팀',
  '정비팀',
  '안전팀',
  '계측팀',
  '토목팀',
  '기계팀',
];

export const REASONS = [
  '정기 점검 후 복전',
  '설비 보수·교체',
  '예방 정비',
  '절연 시험',
  '부하 시험',
  '긴급 복전',
  '계획 개방',
  '기타',
];

export const TEAM_DATA: Record<string, { supervisors: string[]; workers: string[] }> = {
  '전기1팀': { supervisors: ['김철수', '이영민', '박상훈'], workers: ['최동현', '윤지호', '강민석', '조성준'] },
  '전기2팀': { supervisors: ['정수현', '한기범', '오성진'], workers: ['신재호', '임동욱', '류성민', '백준영'] },
  '운전1팀': { supervisors: ['이준호', '김민우', '박재형'], workers: ['송현철', '전성환', '남기훈', '허재원'] },
  '운전2팀': { supervisors: ['최현식', '장영훈', '서민준'], workers: ['고승훈', '윤혁준', '도준서', '문성민'] },
  '정비팀': { supervisors: ['강동원', '노성호', '임준혁'], workers: ['황민준', '권오준', '신성빈', '유재혁'] },
  '안전팀': { supervisors: ['박성민', '김도현', '이재준'], workers: ['조민혁', '한승원', '정우진', '송지훈'] },
};
