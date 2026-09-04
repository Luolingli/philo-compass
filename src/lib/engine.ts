import { DIM_COUNT } from '../data/dimensions';
import { PHILOSOPHERS, type Philosopher } from '../data/philosophers';
import { SCHOOLS, type School } from '../data/schools';
import { THOUGHT_QUESTIONS, type ThoughtQ } from '../data/questions';

export type Vec = number[];

export const clamp = (v: number, lo = -2, hi = 2) => Math.min(hi, Math.max(lo, v));

/** 流派完整向量(即 base) */
export const schoolVec = (s: School): Vec => [...s.vec];

/** 哲学家完整向量 = 流派向量 + 微调 */
export function philosopherVec(p: Philosopher): Vec {
  const base = SCHOOLS.find((s) => s.id === p.school)!.vec;
  const v = [...base];
  for (const [i, d] of p.tweak ?? []) v[i] = clamp(v[i] + d);
  return v;
}

function cosine(a: Vec, b: Vec): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** 思想卷作答(-2..2,null=未作答按0计) → 用户向量 [-2,2]，题量可变(标准60/深度120) */
export function scoreThought(answers: (number | null)[], qs: ThoughtQ[] = THOUGHT_QUESTIONS): Vec {
  const total = new Array(DIM_COUNT).fill(0);
  const max = new Array(DIM_COUNT).fill(0);
  qs.forEach((q, i) => {
    const a = answers[i] ?? 0;
    const parts = [q.a, ...(q.b ? [q.b] : [])];
    for (const [d, w] of parts) {
      total[d] += a * w;
      max[d] += Math.abs(w) * 2;
    }
  });
  return total.map((t, d) => (max[d] === 0 ? 0 : clamp((t / max[d]) * 2)));
}

export interface RankedP { p: Philosopher; sim: number; vec: Vec }
export interface RankedS { s: School; sim: number }

/** 与全体哲学家 / 流派的相似度排名 */
export function rankAll(user: Vec): { phils: RankedP[]; schools: RankedS[] } {
  const phils = PHILOSOPHERS.map((p) => {
    const vec = philosopherVec(p);
    return { p, sim: cosine(user, vec), vec };
  }).sort((x, y) => y.sim - x.sim);
  const schools = SCHOOLS.map((s) => ({ s, sim: cosine(user, schoolVec(s)) })).sort(
    (x, y) => y.sim - x.sim,
  );
  return { phils, schools };
}

/** 流派成分占比(取前 8 正相似度归一化) */
export function schoolShares(schools: RankedS[], top = 8): { name: string; value: number }[] {
  const slice = schools.slice(0, top);
  const pos = slice.map((r) => Math.max(0.05, r.sim + 1));
  const sum = pos.reduce((a, b) => a + b, 0);
  return slice.map((r, i) => ({ name: r.s.name, value: Math.round((pos[i] / sum) * 1000) / 10 }));
}

/** 政治光谱坐标: x 经济左(-)/右(+), y 威权(+)/自由(-)，各 ±10 */
export function compass(user: Vec): { x: number; y: number } {
  const eq = user[4]; // 平等+
  const lib = user[3]; // 自由+
  const x = clamp(-eq * 2.5 + (user[2] * 0.5 - 0), -10, 10);
  const y = clamp(-lib * 2.5, -10, 10);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export interface Naming {
  /** 是否直接溯源(有明显大头) */
  traced: boolean;
  /** 主义名，如"李氏辩证生态存在主义"或溯源描述 */
  ism: string;
  ismEn: string;
  manifesto: string;
  /** 守正 / 创新 / 扬弃三段 */
  shouzheng: string;
  chuangxin: string;
  yangqi: string;
}

const pick = (arr: string[], n: number, seed: number): string[] => {
  const out: string[] = [];
  let s = seed;
  const pool = [...arr];
  while (out.length < n && pool.length > 0) {
    s = (s * 9301 + 49297) % 233280;
    out.push(pool.splice(s % pool.length, 1)[0]);
  }
  return out;
};

/** 命名主义:大头直接溯源，掺杂多则综合命名 */
export function nameIsm(
  surname: string,
  user: Vec,
  schools: RankedS[],
  phils: RankedP[],
): Naming {
  const shares = schoolShares(schools, 8);
  const topShare = shares[0]?.value ?? 0;
  const topSim = phils[0]?.sim ?? 0;
  const sur = surname?.trim() || '无名';
  const p1 = phils[0].p;
  const p2 = phils[1].p;
  const p3 = phils[2]?.p;

  const shouzheng =
    `你的思想与「${phils[0].p.name}」(《${phils[0].p.work}》)、` +
    `「${p2.name}」(《${p2.work}》)最为接近，相似度分别为` +
    `${Math.round(phils[0].sim * 100)}%与${Math.round(phils[1].sim * 100)}%。` +
    `主要继承了「${schools[0].s.name}」(${schools[0].s.keywords.join('、')})` +
    `与「${schools[1].s.name}」(${schools[1].s.keywords.join('、')})的血脉。` +
    `金句可作座右铭——${p1.name}：「${p1.quote}」`;

  // 明显大头 → 直接溯源，不硬造词
  if (topShare >= 30 || topSim >= 0.72) {
    const ism = `${p1.name}—${schools[0].s.name}的当代传人`;
    return {
      traced: true,
      ism: `${sur}近于${ism}`,
      ismEn: `Heir of ${p1.name}`,
      manifesto: `守${p1.name}之正，行当代之事：以「${p1.quote}」为立身之本，在变动世界中持守${schools[0].s.keywords[0]}。`,
      shouzheng,
      chuangxin:
        `与原典相比，你在「${dimDiffHint(user, phils[0].vec)}」上走得更远——` +
        `这既是时代烙印，也是你推陈出新的起点：${p2.name}的「${p2.quote}」恰好补上了这一笔。`,
      yangqi:
        `建议保留${p1.name}的${schools[0].s.keywords[0]}之核，扬弃其时代局限` +
        `(如${p1.name}所处${p1.years}的历史束缚)，` +
        `吸收${p3 ? `${p3.name}「${p3.quote}」` : '当代经验'}，形成你自己的分寸感。`,
    };
  }

  // 掺杂多 → 综合命名
  const kwPool = schools.slice(0, 5).flatMap((r) => r.s.keywords);
  const seed = Math.abs(
    user.reduce((a, v, i) => a + Math.round((v + 2) * 10) * (i + 3), 7),
  );
  const kws = pick(kwPool, 2, seed);
  const tailPool = ['存在主义', '实践主义', '调和论', '新论', '心法', '共生论'];
  const tail = tailPool[seed % tailPool.length];
  const ism = `${sur}氏${kws.join('')}${tail}`;
  return {
    traced: false,
    ism,
    ismEn: `${sur}-ism · ${kws.join('-')}`,
    manifesto:
      `我持${kws[0]}之眼观世界，以${kws[1]}之手介入现实：` +
      `既不全信古人，也不盲从今人；守正而不守旧，出新而不忘本。` +
      `此即${ism}——一个以你名字命名的、仍在生长的思想。`,
    shouzheng,
    chuangxin:
      `你的独特性在于把「${schools[0].s.name}」与「${schools[1].s.name}」熔于一炉，` +
      `又掺入「${schools[2].s.name}」的${schools[2].s.keywords[0]}——` +
      `这种配比在思想史上没有现成名字，所以它配得上你的姓氏。`,
    yangqi:
      `扬「${schools[0].s.keywords[0]}」之长，弃各家之偏执：` +
      `弃${schools[0].s.name}可能携带的时代包袱，弃${schools[1].s.name}的极端化倾向，` +
      `留其方法与关怀，合于你的生活去验证——能活出来的才是你的主义。`,
  };
}

function dimDiffHint(user: Vec, ref: Vec): string {
  const names = ['唯物—唯心', '理性—体验', '个人—集体', '自由—权威', '平等—效率', '进步—传统', '入世—出世', '变革—渐进', '生态—人本', '普世—本土', '意义—荒诞', '实践—沉思'];
  let bi = 0, bv = -1;
  user.forEach((v, i) => {
    const d = Math.abs(v - ref[i]);
    if (d > bv) { bv = d; bi = i; }
  });
  return names[bi];
}

// ---------- 环境契合度 ----------

export interface FitAxis { label: string; dim: number; demand: number; mine: number; fit: number }
export interface FitResult { total: number; level: string; advice: string; axes: FitAxis[] }

const ENV_LABEL = ['平等/效率', '自由/权威', '变革/渐进', '个人/集体', '进步/传统', '入世/出世', '意义/荒诞', '实践/沉思', '唯物/唯心', '理性/体验', '普世/本土', '生态/人本'];

/** 环境作答(-2..2,长15) + 用户向量 → 契合度 */
export function scoreFit(
  user: Vec,
  envAnswers: (number | null)[],
  dims: number[],
  dirs: number[],
): FitResult {
  const byDim = new Map<number, number[]>();
  envAnswers.forEach((a, i) => {
    const demand = (a ?? 0) * dirs[i]; // 环境在这维上奖赏的位置(null=未作答，按无压力计)
    if (!byDim.has(dims[i])) byDim.set(dims[i], []);
    byDim.get(dims[i])!.push(demand);
  });
  const axes: FitAxis[] = [];
  byDim.forEach((ds, d) => {
    const demand = ds.reduce((x, y) => x + y, 0) / ds.length;
    const gap = Math.abs(user[d] - demand);
    axes.push({ label: ENV_LABEL[d], dim: d, demand: Math.round(demand * 10) / 10, mine: Math.round(user[d] * 10) / 10, fit: Math.round((1 - gap / 4) * 100) });
  });
  const total = Math.round(axes.reduce((a, x) => a + x.fit, 0) / Math.max(1, axes.length));
  const level = total >= 75 ? '高度契合' : total >= 55 ? '基本相容' : total >= 35 ? '明显张力' : '疏离逆流';
  const advice =
    total >= 75
      ? '你的哲学与环境同频：适合顺势而为，把信念直接变成行动，注意别被环境磨平棱角。'
      : total >= 55
        ? '大体相容、局部摩擦：找到你的生态位(社群、职业、城市)，用扬弃的智慧调适，不必硬碰。'
        : total >= 35
          ? '张力显著：要么寻找更契合的小环境(换圈子/城市/职业)，要么修炼“内圣外王”——内心持守、行为策略。'
          : '你是一条逆流的鱼：要么做变革者(付出代价)，要么做隐士(保存火种)。先保护好自己，再谈改变世界。';
  return { total, level, advice, axes: axes.sort((a, b) => a.fit - b.fit) };
}

// ---------- 分享编码 ----------

export interface SharePayload { n: string; u: Vec; e: (number | null)[]; t: (number | null)[]; v?: 'standard' | 'deep' }

export function encodeShare(p: SharePayload): string {
  const s = JSON.stringify({ n: p.n, u: p.u.map((v) => Math.round(v * 100) / 100), e: p.e, t: p.t, v: p.v ?? 'standard' });
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShare(code: string): SharePayload | null {
  try {
    let b = code.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4 !== 0) b += '='; // 补回编码时去掉的 padding
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  } catch {
    return null;
  }
}
