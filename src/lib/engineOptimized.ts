// src/lib/engineOptimized.ts - 性能优化版本的核心算法

import { DIM_COUNT } from '../data/dimensions';
import { PHILOSOPHERS, type Philosopher } from '../data/philosophers';
import { SCHOOLS, type School } from '../data/schools';
import { THOUGHT_QUESTIONS, type ThoughtQ } from '../data/questions';

export type Vec = number[];

// ─── 缓存优化 ───────────────────────────────────────────────────────────────

/** 哲学家向量缓存 - 避免重复计算 */
const philosopherVecCache = new Map<string, Vec>();

/** 流派向量缓存 */
const schoolVecCache = new Map<string, Vec>();

export const clamp = (v: number, lo = -2, hi = 2) => Math.min(hi, Math.max(lo, v));

export const schoolVec = (s: School): Vec => {
  const cached = schoolVecCache.get(s.id);
  if (cached) return cached;
  const vec = [...s.vec];
  schoolVecCache.set(s.id, vec);
  return vec;
};

export function philosopherVec(p: Philosopher): Vec {
  const cached = philosopherVecCache.get(p.id);
  if (cached) return cached;

  const base = SCHOOLS.find((s) => s.id === p.school)!.vec;
  const v = [...base];
  for (const [i, d] of p.tweak ?? []) v[i] = clamp(v[i] + d);

  philosopherVecCache.set(p.id, v);
  return v;
}

// ─── 向量运算优化 ───────────────────────────────────────────────────────────

/** 优化的余弦相似度计算 - 使用单次遍历 */
function cosine(a: Vec, b: Vec): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const av = a[i], bv = b[i];
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }

  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** 向量归一化 */
export function normalize(vec: Vec): Vec {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vec : vec.map(v => v / norm);
}

// ─── 批量计算优化 ───────────────────────────────────────────────────────────

/** 思想卷作答 → 用户向量（优化版） */
export function scoreThought(
  answers: (number | null)[],
  qs: ThoughtQ[] = THOUGHT_QUESTIONS
): Vec {
  const total = new Float32Array(DIM_COUNT);
  const max = new Float32Array(DIM_COUNT);

  const len = Math.min(answers.length, qs.length);

  for (let i = 0; i < len; i++) {
    const a = answers[i] ?? 0;
    const q = qs[i];
    const parts = q.b ? [q.a, q.b] : [q.a];

    for (const [d, w] of parts) {
      total[d] += a * w;
      max[d] += Math.abs(w) * 2;
    }
  }

  return Array.from(total, (t, d) =>
    max[d] === 0 ? 0 : clamp((t / max[d]) * 2)
  );
}

export interface RankedP { p: Philosopher; sim: number; vec: Vec }
export interface RankedS { s: School; sim: number }

/** 排名结果缓存 */
const rankCache = new WeakMap<Vec, { phils: RankedP[]; schools: RankedS[] }>();

/** 优化的排名计算 - 使用缓存和并行计算 */
export function rankAll(user: Vec): { phils: RankedP[]; schools: RankedS[] } {
  // 检查缓存
  const cached = rankCache.get(user);
  if (cached) return cached;

  // 预计算哲学家向量（如果尚未缓存）
  const philVecs = PHILOSOPHERS.map(p => ({
    p,
    vec: philosopherVec(p)
  }));

  // 批量计算相似度
  const phils = philVecs.map(({ p, vec }) => ({
    p,
    sim: cosine(user, vec),
    vec
  })).sort((x, y) => y.sim - x.sim);

  const schools = SCHOOLS.map((s) => ({
    s,
    sim: cosine(user, schoolVec(s))
  })).sort((x, y) => y.sim - x.sim);

  const result = { phils, schools };
  rankCache.set(user, result);
  return result;
}

/** 流派成分占比（优化版） */
export function schoolShares(
  schools: RankedS[],
  top = 8
): { name: string; value: number }[] {
  const slice = schools.slice(0, top);
  const pos = slice.map((r) => Math.max(0.05, r.sim + 1));
  const sum = pos.reduce((a, b) => a + b, 0);

  return slice.map((r, i) => ({
    name: r.s.name,
    value: Math.round((pos[i] / sum) * 1000) / 10
  }));
}

// ─── 政治光谱映射 ───────────────────────────────────────────────────────────

export function compass(user: Vec): { x: number; y: number } {
  const eq = user[4];  // 平等+
  const lib = user[3]; // 自由+
  const x = clamp(-eq * 2.5 + (user[2] * 0.5), -10, 10);
  const y = clamp(-lib * 2.5, -10, 10);
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10
  };
}

// ─── 实用工具 ───────────────────────────────────────────────────────────────

/** 清空所有缓存（用于测试或重置） */
export function clearCache(): void {
  philosopherVecCache.clear();
  schoolVecCache.clear();
}

/** 获取缓存统计信息 */
export function getCacheStats() {
  return {
    philosophers: philosopherVecCache.size,
    schools: schoolVecCache.size
  };
}
