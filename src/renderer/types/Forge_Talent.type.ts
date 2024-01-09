export interface ForgeTalent {
  talentTabId: number;
  columnIndex: number;
  rowIndex: number;
  rankCost: number;
  minLevel: number;
  talentType: number;
  numberRanks: number;
  preReqType: number;
  tabPointReq: number;
  nodeType: number;
  nodeindex: number;
  spellid: number;
  trueNodeIndex?: number;
}

export const nodeTypes = [
  { value: '', label: 'Select Node Type' },
  { value: 0, label: 'Passive' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'Choice Node' },
];
