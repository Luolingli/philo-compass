// 问卷题库。思想卷 60 题(6 模块) + 环境卷 15 题(单独施测)。
// a/b: [维度下标, 权重]，作答 -2..2(非常反对..非常同意)，贡献 = 作答 × 权重。
// 维度: 0唯物 1理性 2个人 3自由 4平等 5进步 6入世 7变革 8生态 9普世 10意义 11实践

export interface ThoughtQ {
  id: number;
  mod: string;
  text: string;
  a: [number, number];
  b?: [number, number];
}

export interface EnvQ {
  id: number;
  text: string;
  dim: number;
  /** +1 表示环境奖赏该维度正端，-1 表示奖赏负端 */
  dir: 1 | -1;
}

const O = '本体世界观';
const E = '认识方法论';
const L = '伦理价值观';
const P = '政治社会观';
const F = '人生美学观';
const A = '行动实践观';

export const THOUGHT_QUESTIONS: ThoughtQ[] = [
  { id: 1, mod: O, text: '世界归根结底由物质构成，精神是大脑活动的产物。', a: [0, 2] },
  { id: 2, mod: O, text: '存在某种超越经验的终极实在(如理念、道、天理)。', a: [0, -2] },
  { id: 3, mod: O, text: '万事万物相互联系，没有完全孤立自存的东西。', a: [0, -1], b: [8, 1] },
  { id: 4, mod: O, text: '人死如灯灭，不存在灵魂不朽。', a: [0, 2] },
  { id: 5, mod: O, text: '宇宙有其目的和方向，而非盲目偶然的堆积。', a: [0, -1], b: [10, 1] },
  { id: 6, mod: O, text: '命运早已注定，人力难以改变根本格局。', a: [3, -1], b: [1, -1] },
  { id: 7, mod: O, text: '世界本质上是荒谬偶然的，不必寻找终极意义。', a: [10, -2] },
  { id: 8, mod: O, text: '人生是有意义的，值得认真对待。', a: [10, 2] },
  { id: 9, mod: O, text: '自然有其内在价值，而不只是人类的资源库。', a: [8, 2] },
  { id: 10, mod: O, text: '为了发展经济，可以适度牺牲环境。', a: [8, -2] },
  { id: 11, mod: E, text: '凡事要讲逻辑和证据，感觉靠不住。', a: [1, 2] },
  { id: 12, mod: E, text: '直觉和体悟往往比推理更接近真相。', a: [1, -2] },
  { id: 13, mod: E, text: '真理是相对的，不存在放之四海皆准的标准。', a: [1, -1], b: [9, -1] },
  { id: 14, mod: E, text: '科学方法是目前最可靠的求知方式。', a: [1, 2], b: [0, 1] },
  { id: 15, mod: E, text: '有些真理只能靠亲身实践来验证，书上读不来。', a: [1, -1], b: [11, 1] },
  { id: 16, mod: E, text: '对一切权威说法都应保持怀疑。', a: [1, 1], b: [3, 1] },
  { id: 17, mod: E, text: '经典和圣贤的话天然值得信服。', a: [1, -1], b: [5, -1] },
  { id: 18, mod: E, text: '复杂问题总能用理性分析讲清楚。', a: [1, 2] },
  { id: 19, mod: E, text: '人的认识能力有限，很多事注定不可知。', a: [1, -1], b: [10, -1] },
  { id: 20, mod: E, text: '做决策时我更相信数据，而非感觉。', a: [1, 2] },
  { id: 21, mod: L, text: '个人幸福是道德的根本出发点。', a: [2, 2] },
  { id: 22, mod: L, text: '为了集体利益，个人应当做出牺牲。', a: [2, -2] },
  { id: 23, mod: L, text: '人人都应机会均等，哪怕结果有差异。', a: [4, 1] },
  { id: 24, mod: L, text: '结果公平比机会公平更重要，必要时可劫富济贫。', a: [4, 2] },
  { id: 25, mod: L, text: '市场竞争、优胜劣汰总体上是好事。', a: [4, -2] },
  { id: 26, mod: L, text: '强者对弱者负有照顾责任。', a: [4, 1], b: [2, -1] },
  { id: 27, mod: L, text: '道德规则应当普遍一致，不能因人而异。', a: [1, 1], b: [9, 1] },
  { id: 28, mod: L, text: '特殊关系(家人朋友)理应优先于陌生人。', a: [9, -1], b: [2, -1] },
  { id: 29, mod: L, text: '评判行为主要看它带来多少幸福，而非动机是否高尚。', a: [1, 1], b: [4, 1] },
  { id: 30, mod: L, text: '人应当先修身正己，再谈改造社会。', a: [10, 1], b: [2, 1] },
  { id: 31, mod: P, text: '政府权力应当受到严格限制。', a: [3, 2] },
  { id: 32, mod: P, text: '非常时期可以牺牲部分自由换取安全。', a: [3, -2] },
  { id: 33, mod: P, text: '国家应当为全民提供兜底保障。', a: [4, 1], b: [3, -1] },
  { id: 34, mod: P, text: '传统习俗中蕴含智慧，不应轻易抛弃。', a: [5, -2] },
  { id: 35, mod: P, text: '社会应当不断改革，哪怕冲击既有秩序。', a: [5, 2], b: [7, 1] },
  { id: 36, mod: P, text: '渐进改良比激进革命更可靠。', a: [7, -2] },
  { id: 37, mod: P, text: '有时革命是必要的，旧制度只能打碎重来。', a: [7, 2] },
  { id: 38, mod: P, text: '人类命运共同体优先于本国利益。', a: [9, 2] },
  { id: 39, mod: P, text: '本国文化与利益应当优先维护。', a: [9, -2] },
  { id: 40, mod: P, text: '强有力的领袖对国家是好事。', a: [3, -2] },
  { id: 41, mod: P, text: '民主程序即使低效也值得坚持。', a: [3, 2], b: [5, 1] },
  { id: 42, mod: P, text: '对历史伟人应多肯定其功绩、少苛责其过错。', a: [5, -1], b: [10, 1] },
  { id: 43, mod: F, text: '人应当积极入世，在事上磨炼。', a: [6, 2], b: [11, 1] },
  { id: 44, mod: F, text: '隐退山林、保持内心自由是更高明的生活。', a: [6, -2] },
  { id: 45, mod: F, text: '艺术与审美体验是人生的最高境界之一。', a: [1, -1], b: [6, -1] },
  { id: 46, mod: F, text: '平淡安稳的小日子胜过轰轰烈烈的大事业。', a: [6, -1], b: [11, -1] },
  { id: 47, mod: F, text: '人生苦多乐少，看开就好。', a: [10, -1] },
  { id: 48, mod: F, text: '即使世界荒诞，也要像西西弗斯一样清醒反抗。', a: [10, -2], b: [11, 2] },
  { id: 49, mod: F, text: '简朴低物欲的生活更值得向往。', a: [8, 2], b: [6, -1] },
  { id: 50, mod: F, text: '科技进步总体上让人类生活更好。', a: [5, 2], b: [0, 1] },
  { id: 51, mod: A, text: '空谈误国，实干兴邦。', a: [11, 2] },
  { id: 52, mod: A, text: '先想清楚再行动，谋定而后动。', a: [11, -1], b: [1, 1] },
  { id: 53, mod: A, text: '读万卷书不如行万里路。', a: [11, 2] },
  { id: 54, mod: A, text: '面对不公，知识分子应当发声行动。', a: [6, 2], b: [7, 1] },
  { id: 55, mod: A, text: '改变自己比改变世界更实际。', a: [6, -1], b: [2, 1] },
  { id: 56, mod: A, text: '为了理想可以承担巨大风险甚至牺牲。', a: [7, 2], b: [11, 2] },
  { id: 57, mod: A, text: '根本变革离不开力量，妥协换不来新世界。', a: [7, 2], b: [3, -1] },
  { id: 58, mod: A, text: '非暴力是比暴力更高明的抗争方式。', a: [7, -1], b: [4, 1] },
  { id: 59, mod: A, text: '商业创业也是改造世界的重要方式。', a: [4, -1], b: [11, 2] },
  { id: 60, mod: A, text: '教育下一代是最深远的社会变革。', a: [6, 2], b: [7, -1] },
];

export const ENV_QUESTIONS: EnvQ[] = [
  { id: 1, text: '我所在的环境更奖赏竞争和效率，而不是平均和保障。', dim: 4, dir: -1 },
  { id: 2, text: '这里的人们更信服权威和资历，而非质疑和平等讨论。', dim: 3, dir: -1 },
  { id: 3, text: '这里节奏求稳、怕折腾，不鼓励出头和试错。', dim: 7, dir: -1 },
  { id: 4, text: '这里看重关系、人情和圈子，规则常为关系让路。', dim: 2, dir: -1 },
  { id: 5, text: '这里看重传统、面子和规矩，新想法常被泼冷水。', dim: 5, dir: -1 },
  { id: 6, text: '这里默认人应该拼事业、上岸，谈隐退会被视为失败。', dim: 6, dir: 1 },
  { id: 7, text: '这里一切向钱看，谈理想和意义会被笑天真。', dim: 10, dir: -1 },
  { id: 8, text: '这里只认实效和结果，不关心过程和情怀。', dim: 11, dir: 1 },
  { id: 9, text: '这里默认世界就是物质和利益的，谈精神会被视为矫情。', dim: 0, dir: 1 },
  { id: 10, text: '这里凡事讲门路，讲逻辑证据反而吃亏。', dim: 1, dir: -1 },
  { id: 11, text: '这里更认本地圈子，对外来者和普世话语保持警惕。', dim: 9, dir: -1 },
  { id: 12, text: '这里默认人要为家庭/集体牺牲个人选择。', dim: 2, dir: -1 },
  { id: 13, text: '这里发展优先，环保要给增长让路。', dim: 8, dir: -1 },
  { id: 14, text: '这里崇尚行动和加班，沉思和慢生活没有位置。', dim: 11, dir: 1 },
  { id: 15, text: '这里年轻人普遍感到无力，流行躺平和自嘲。', dim: 6, dir: -1 },
];

// ---------- 深度版扩展 60 题(61-120)：补足 60 题信号弱的流派 ----------
// G 信仰与神学 / H 东方修行 / I 政治实践 / J 性别与关怀 /
// K 生态与科技 / L 知识论纵深 / M 存在与意志 / N 美德与德性

export const EXT_QUESTIONS: ThoughtQ[] = [
  { id: 61, mod: '信仰与神学', text: '人应该信仰某种超越的存在。', a: [0, -2] },
  { id: 62, mod: '信仰与神学', text: '祈祷或冥想能带来真实的力量。', a: [0, -1], b: [11, -1] },
  { id: 63, mod: '信仰与神学', text: '教义与理性冲突时，应服从信仰。', a: [1, -2] },
  { id: 64, mod: '信仰与神学', text: '人性本有亏缺，需要救赎与恩典。', a: [10, 1], b: [0, -1] },
  { id: 65, mod: '信仰与神学', text: '理性可以论证终极实在的存在。', a: [1, 2], b: [0, -1] },
  { id: 66, mod: '信仰与神学', text: '宗教经典字字皆真，不可质疑。', a: [1, -2], b: [5, -1] },
  { id: 67, mod: '信仰与神学', text: '与神合一的神秘体验是可能的。', a: [0, -2], b: [1, -1] },
  { id: 68, mod: '信仰与神学', text: '苦难是神圣考验，应忍耐而非反抗。', a: [7, -1], b: [10, 1] },
  { id: 69, mod: '信仰与神学', text: '宗教应该退出公共生活，成为纯私人事务。', a: [3, 1] },
  { id: 70, mod: '信仰与神学', text: '各宗教本质相通，不必执著于一教。', a: [9, 2], b: [0, -1] },
  { id: 71, mod: '东方修行', text: '“空”不是虚无，而是破除执著的智慧。', a: [0, -1], b: [1, -1] },
  { id: 72, mod: '东方修行', text: '开悟只在一念之间，不在经年苦读。', a: [1, -2] },
  { id: 73, mod: '东方修行', text: '静坐冥想比读书思考更能接近真理。', a: [1, -2], b: [11, -1] },
  { id: 74, mod: '东方修行', text: '轮回转世是真实存在的。', a: [0, -2] },
  { id: 75, mod: '东方修行', text: '修身养性应从“心”下手，而非向外求。', a: [0, -1], b: [11, -1] },
  { id: 76, mod: '东方修行', text: '“天人合一”：人与自然本是一体。', a: [8, 2], b: [0, -1] },
  { id: 77, mod: '东方修行', text: '欲望是痛苦之源，应当节制乃至断除。', a: [10, -1], b: [6, -1] },
  { id: 78, mod: '东方修行', text: '东西方哲学会通，比单一传统更接近真理。', a: [9, 2] },
  { id: 79, mod: '政治实践', text: '无产阶级革命是历史的必然归宿。', a: [7, 2], b: [4, 2] },
  { id: 80, mod: '政治实践', text: '严密的先锋队组织是变革必需的。', a: [3, -2], b: [7, 1] },
  { id: 81, mod: '政治实践', text: '工人自治、自下而上的管理优于中央计划。', a: [3, 1], b: [4, 1] },
  { id: 82, mod: '政治实践', text: '为了解放事业，武装斗争是正当的。', a: [7, 2], b: [11, 2] },
  { id: 83, mod: '政治实践', text: '经济大萧条时政府必须大规模干预。', a: [4, 1], b: [3, -1] },
  { id: 84, mod: '政治实践', text: '“摸着石头过河”：实践标准高于一切教条。', a: [11, 2], b: [1, -1] },
  { id: 85, mod: '政治实践', text: '发展是硬道理，应当全力投入建设。', a: [5, 1], b: [6, 2] },
  { id: 86, mod: '政治实践', text: '自由市场即使有缺陷，也比政府计划更可靠。', a: [4, -2], b: [3, 1] },
  { id: 87, mod: '政治实践', text: '文化舆论阵地决定政治胜负。', a: [6, 2], b: [1, 1] },
  { id: 88, mod: '政治实践', text: '消费主义和流行文化在麻痹大众。', a: [1, 1], b: [4, 1] },
  { id: 89, mod: '政治实践', text: '传统家庭与民族认同是社会的压舱石。', a: [5, -2], b: [9, -1] },
  { id: 90, mod: '政治实践', text: '福利国家养懒汉，应该大幅收缩。', a: [4, -2] },
  { id: 91, mod: '性别与关怀', text: '性别气质主要是社会建构，而非天生。', a: [5, 1], b: [2, 1] },
  { id: 92, mod: '性别与关怀', text: '照顾老幼病弱的责任不应默认落在女性身上。', a: [4, 2], b: [2, 1] },
  { id: 93, mod: '性别与关怀', text: '评价社会进步要看最弱势者过得如何。', a: [4, 2] },
  { id: 94, mod: '性别与关怀', text: '关怀伦理与正义原则同等重要。', a: [1, -1], b: [2, -1] },
  { id: 95, mod: '性别与关怀', text: '女性参政比例应当用法规保障。', a: [4, 2] },
  { id: 96, mod: '性别与关怀', text: '人的能力（健康、教育、尊严）比GDP更能衡量发展。', a: [4, 2] },
  { id: 97, mod: '生态与科技', text: '人类应当主动缩减规模，给自然让路。', a: [8, 2] },
  { id: 98, mod: '生态与科技', text: '动物拥有与人类近似的内在权利。', a: [8, 2], b: [4, 1] },
  { id: 99, mod: '生态与科技', text: '为子孙后代，今人应牺牲当下便利。', a: [8, 2] },
  { id: 100, mod: '生态与科技', text: '人工智能若产生意识，也应被赋予权利。', a: [5, 2], b: [9, 1] },
  { id: 101, mod: '生态与科技', text: '科技终将解决气候与资源危机，无需改变生活方式。', a: [8, -2], b: [5, 2] },
  { id: 102, mod: '生态与科技', text: '独居荒野一年是值得向往的人生体验。', a: [8, 2], b: [6, -1] },
  { id: 103, mod: '知识论纵深', text: '我们连“外部世界存在”都无法确证。', a: [1, -2] },
  { id: 104, mod: '知识论纵深', text: '多数哲学争论源于语言混乱，澄清语言即解决大半。', a: [1, 2] },
  { id: 105, mod: '知识论纵深', text: '数学真理独立于人类心智而存在。', a: [0, -1], b: [1, 2] },
  { id: 106, mod: '知识论纵深', text: '“我思”是我唯一能确定的起点。', a: [1, 2], b: [2, 1] },
  { id: 107, mod: '知识论纵深', text: '描述体验本身，比解释世界更重要。', a: [1, -1], b: [11, -1] },
  { id: 108, mod: '知识论纵深', text: '科学史是范式更替史，而非直线进步。', a: [1, -1], b: [7, 1] },
  { id: 109, mod: '知识论纵深', text: '一个理论若不能被证伪就毫无价值。', a: [1, 2] },
  { id: 110, mod: '知识论纵深', text: '常识往往比精致理论更可靠。', a: [1, -1] },
  { id: 111, mod: '存在与意志', text: '人生而自由，因此无可推卸地要为自己负责。', a: [2, 2], b: [3, 1] },
  { id: 112, mod: '存在与意志', text: '痛苦使人深刻，舒适使人平庸。', a: [10, -1], b: [2, 1] },
  { id: 113, mod: '存在与意志', text: '强者创造价值，弱者才需要道德庇护。', a: [2, 2], b: [4, -2] },
  { id: 114, mod: '存在与意志', text: '独处不是孤独，而是力量的源泉。', a: [2, 2] },
  { id: 115, mod: '存在与意志', text: '愤怒焦虑时，先审视自己的判断而非指责世界。', a: [1, 2] },
  { id: 116, mod: '存在与意志', text: '好死不如赖活着，活着本身就有意义。', a: [10, 2] },
  { id: 117, mod: '美德与德性', text: '德性靠习惯养成，而非天赋或说教。', a: [11, 2], b: [1, 1] },
  { id: 118, mod: '美德与德性', text: '人不应撒谎，即使是善意的谎言。', a: [1, 2], b: [9, 1] },
  { id: 119, mod: '美德与德性', text: '孝敬父母是德性之首。', a: [5, -2], b: [2, -1] },
  { id: 120, mod: '美德与德性', text: '社区兴衰人人有责，搭便车可耻。', a: [2, -2], b: [6, 2] },
];

/** 深度版全量题 = 标准版 60 + 扩展 60 */
export const DEEP_QUESTIONS: ThoughtQ[] = [...THOUGHT_QUESTIONS, ...EXT_QUESTIONS];

/**
 * 每题"帮助区分的流派"标注(题 id → 流派 id 数组)。
 * 计分仍走 12 维向量；标注用于题目下展示"本题指向"，让溯源关系透明。
 */
export const QUESTION_TAGS: Record<number, string[]> = {
  1: ['marxism', 'legalist'], 2: ['plato', 'neoplat'],   3: ['hegel', 'madhyamaka'],
  4: ['epicurean', 'marxism'], 5: ['aristotle', 'scholastic'], 6: ['scholastic', 'conservative'],
  7: ['absurd', 'skeptic'], 8: ['kant', 'xinxue'], 9: ['deepeco', 'daoist'],
  10: ['deng', 'utilitarian'], 11: ['analytic', 'cartesian'], 12: ['zen', 'schopenhauer'],
  13: ['postmodern', 'skeptic'], 14: ['pragmatism', 'analytic'], 15: ['deng', 'pragmatism'],
  16: ['skeptic', 'liberal'], 17: ['confucian', 'lixue'], 18: ['cartesian', 'analytic'],
  19: ['skeptic', 'kant'], 20: ['utilitarian', 'pragmatism'], 21: ['epicurean', 'liberal'],
  22: ['mohist', 'confucian'], 23: ['liberal', 'newdeal'], 24: ['marxism', 'mohist'],
  25: ['austrian', 'utilitarian'], 26: ['mohist', 'liberal'], 27: ['kant', 'scholastic'],
  28: ['confucian', 'communitarian'], 29: ['utilitarian', 'mohist'], 30: ['confucian', 'xinxue'],
  31: ['liberal', 'austrian'], 32: ['conservative', 'legalist'], 33: ['keynesian', 'newdeal'],
  34: ['conservative', 'confucian'], 35: ['liberal', 'gramsci'], 36: ['conservative', 'deng'],
  37: ['leninism', 'guevara'], 38: ['nonviolence', 'kant'], 39: ['conservative', 'legalist'],
  40: ['leninism', 'legalist'], 41: ['liberal', 'kant'], 42: ['confucian', 'conservative'],
  43: ['xinxue', 'pragmatism'], 44: ['daoist', 'deepeco'], 45: ['schopenhauer', 'zen'],
  46: ['epicurean', 'daoist'], 47: ['madhyamaka', 'schopenhauer'], 48: ['absurd', 'existential'],
  49: ['deepeco', 'daoist'], 50: ['pragmatism', 'utilitarian'],   51: ['deng', 'shixue'],
  52: ['confucian', 'cartesian'], 53: ['pragmatism', 'xinxue'], 54: ['gramsci', 'frankfurt'],
  55: ['daoist', 'stoic'], 56: ['guevara', 'mohist'], 57: ['leninism', 'legalist'],
  58: ['nonviolence', 'liberal'], 59: ['austrian', 'pragmatism'], 60: ['confucian', 'gramsci'],
  61: ['augustine', 'kierkegaard'], 62: ['sufi', 'zen'], 63: ['augustine', 'kierkegaard'],
  64: ['augustine', 'kierkegaard'], 65: ['scholastic', 'averroes'], 66: ['scholastic', 'conservative'],
  67: ['sufi', 'neoplat'], 68: ['augustine', 'nonviolence'], 69: ['liberal', 'kant'],
  70: ['sufi', 'kyoto'], 71: ['madhyamaka', 'zen'], 72: ['zen'], 73: ['zen', 'kyoto'],
  74: ['madhyamaka', 'sufi'], 75: ['xinxue'], 76: ['daoist', 'deepeco'],
  77: ['madhyamaka', 'stoic'], 78: ['kyoto', 'averroes'], 79: ['marxism', 'leninism'],
  80: ['leninism'], 81: ['tito'], 82: ['guevara'], 83: ['keynesian', 'newdeal'],
  84: ['deng', 'pragmatism'], 85: ['deng'], 86: ['austrian'], 87: ['gramsci'],
  88: ['frankfurt'], 89: ['conservative'], 90: ['austrian', 'conservative'],
  91: ['feminism'], 92: ['feminism'], 93: ['liberal', 'feminism'],
  94: ['feminism', 'communitarian'], 95: ['feminism'], 96: ['liberal', 'feminism'],
  97: ['deepeco'], 98: ['deepeco'], 99: ['deepeco'], 100: ['liberal', 'kant'],
  101: ['pragmatism', 'utilitarian'], 102: ['deepeco', 'daoist'], 103: ['skeptic'],
  104: ['analytic'], 105: ['plato', 'cartesian'], 106: ['cartesian'],
  107: ['phenomenology'], 108: ['postmodern', 'skeptic'], 109: ['liberal', 'analytic'],
  110: ['empiricist', 'pragmatism'], 111: ['existential'], 112: ['nietzsche', 'schopenhauer'],
  113: ['nietzsche'], 114: ['nietzsche'], 115: ['stoic'], 116: ['stoic', 'confucian'],
  117: ['aristotle', 'xunzi'], 118: ['kant', 'socratic'], 119: ['confucian'], 120: ['communitarian', 'mohist'],
};
