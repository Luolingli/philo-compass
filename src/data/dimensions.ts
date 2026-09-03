// 12 维哲学坐标空间。所有哲学家 / 流派 / 用户 / 环境需求都落在这同一空间里，
// 因此可以直接算余弦相似度(溯源)与距离(环境契合度)。
// 每维取值 [-2, 2]，正端为 left/labelBefore，负端为 labelAfter。

export interface DimDef {
  key: string;
  /** 正端标签 */
  pos: string;
  /** 负端标签 */
  neg: string;
  /** 短名(用于图表) */
  short: string;
}

export const DIMS: DimDef[] = [
  { key: 'material', pos: '唯物', neg: '唯心', short: '唯物/唯心' },
  { key: 'reason', pos: '理性', neg: '体验', short: '理性/体验' },
  { key: 'individual', pos: '个人', neg: '集体', short: '个人/集体' },
  { key: 'liberty', pos: '自由', neg: '权威', short: '自由/权威' },
  { key: 'equality', pos: '平等', neg: '效率', short: '平等/效率' },
  { key: 'progress', pos: '进步', neg: '传统', short: '进步/传统' },
  { key: 'engage', pos: '入世', neg: '出世', short: '入世/出世' },
  { key: 'radical', pos: '变革', neg: '渐进', short: '变革/渐进' },
  { key: 'eco', pos: '生态', neg: '人类中心', short: '生态/人本' },
  { key: 'cosm', pos: '普世', neg: '本土', short: '普世/本土' },
  { key: 'meaning', pos: '意义肯定', neg: '荒诞怀疑', short: '意义/荒诞' },
  { key: 'praxis', pos: '实践', neg: '沉思', short: '实践/沉思' },
];

export const DIM_COUNT = DIMS.length;

/** 向量类型: 12 维，每维 [-2, 2] */
export type Vec12 = number[];
