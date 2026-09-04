import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { EChartsOption } from 'echarts';
import { DIMS } from './data/dimensions';
import { PHILOSOPHERS } from './data/philosophers';
import { ENV_QUESTIONS, THOUGHT_QUESTIONS } from './data/questions';
import {
  compass,
  decodeShare,
  encodeShare,
  nameIsm,
  rankAll,
  schoolShares,
  scoreFit,
  scoreThought,
} from './lib/engine';
import { EChart } from './components/Charts';

const LIKERT = [
  { label: '非常同意', value: 2 },
  { label: '同意', value: 1 },
  { label: '中立', value: 0 },
  { label: '反对', value: -1 },
  { label: '非常反对', value: -2 },
];

type Step = 'home' | 'quiz' | 'env' | 'result' | 'gallery';

/** null = 未作答(界面上五个选项全空白)，作答后才高亮 */
export type Ans = (number | null)[];

const LS_KEY = 'philo-compass-v2';
const BLANK_THOUGHT: Ans = Array(60).fill(null);
const BLANK_ENV: Ans = Array(15).fill(null);

/** 长度归一化(兼容旧存档与分享链接) */
function norm(a: unknown, n: number): Ans {
  const arr = Array.isArray(a) ? [...a] : [];
  while (arr.length < n) arr.push(null);
  return arr.slice(0, n).map((v) => (typeof v === 'number' ? v : null));
}

function loadLS(): { name: string; thought: Ans; env: Ans } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    return { name: o.name ?? '', thought: norm(o.thought, 60), env: norm(o.env, 15) };
  } catch {
    return null;
  }
}

export default function App() {
  const [step, setStep] = useState<Step>('home');
  const [name, setName] = useState('');
  const [thought, setThought] = useState<Ans>(() => loadLS()?.thought ?? [...BLANK_THOUGHT]);
  const [envAns, setEnvAns] = useState<Ans>(() => loadLS()?.env ?? [...BLANK_ENV]);
  const [qi, setQi] = useState(0);
  const [ei, setEi] = useState(0);
  const [galleryQ, setGalleryQ] = useState('');
  const [galleryR, setGalleryR] = useState('全部');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadLS();
    if (saved?.name) setName(saved.name);
    const m = new URLSearchParams(window.location.search).get('r');
    if (m) {
      const p = decodeShare(m);
      if (p) {
        setName(p.n);
        setThought(norm(p.t, 60));
        setEnvAns(norm(p.e, 15));
        setStep('result');
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ name, thought, env: envAns }));
    } catch {
      /* ignore */
    }
  }, [name, thought, envAns]);

  const result = useMemo(() => {
    if (step !== 'result') return null;
    const user = scoreThought(thought);
    const { phils, schools } = rankAll(user);
    const shares = schoolShares(schools);
    const cp = compass(user);
    const naming = nameIsm(name, user, schools, phils);
    const fit = scoreFit(
      user,
      envAns,
      ENV_QUESTIONS.map((q) => q.dim),
      ENV_QUESTIONS.map((q) => q.dir),
    );
    return { user, phils, schools, shares, cp, naming, fit };
  }, [step, thought, envAns, name]);

  const answerThought = (v: number) => {
    const next = [...thought];
    next[qi] = v;
    setThought(next);
    if (qi < THOUGHT_QUESTIONS.length - 1) setQi(qi + 1);
    else setStep('env');
  };

  const answerEnv = (v: number) => {
    const next = [...envAns];
    next[ei] = v;
    setEnvAns(next);
    if (ei < ENV_QUESTIONS.length - 1) setEi(ei + 1);
    else {
      window.scrollTo(0, 0);
      setStep('result');
    }
  };

  const shareUrl = useMemo(() => {
    if (step !== 'result' || !result) return '';
    const code = encodeShare({ n: name, u: result.user, e: envAns, t: thought });
    return `${window.location.origin}${window.location.pathname}?r=${code}`;
  }, [step, result, name, envAns, thought]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** 从首页进入：有未答题则断点续答，都答完则直达报告 */
  const startOrResume = () => {
    const tq = thought.findIndex((v) => v === null);
    if (tq !== -1) {
      setQi(tq);
      setStep('quiz');
    } else {
      const eq = envAns.findIndex((v) => v === null);
      if (eq !== -1) {
        setEi(eq);
        setStep('env');
      } else {
        setStep('result');
      }
    }
    window.scrollTo(0, 0);
  };

  const resetAll = () => {
    setThought([...BLANK_THOUGHT]);
    setEnvAns([...BLANK_ENV]);
    setQi(0);
    setEi(0);
    setStep('quiz');
    window.scrollTo(0, 0);
  };

  /** 导出固定 720px 宽的分享卡(高清)，不再截超长整页 */
  const downloadCard = async () => {
    if (!cardRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#faf8f2', scale: 3 });
    const a = document.createElement('a');
    a.download = `${name || '无名'}氏主义分享卡.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo" onClick={() => setStep('home')}>🧭 哲学罗盘</span>
        <nav>
          <button className="link" onClick={() => setStep('home')}>首页</button>
          <button className="link" onClick={() => setStep('gallery')}>哲学家画廊</button>
        </nav>
      </header>

      {step === 'home' && (
        <main className="wrap hero">
          <h1>测测你的思想，属于哪位哲学家？</h1>
          <p className="sub">
            60 道思想题 × 15 道环境题，覆盖中西印伊 100 位哲学家与 50+
            流派(含政治光谱)。像 MBTI 一样看清你的思想成分，溯源守正、
            推陈出新、扬弃综合——成分混杂者，还将获得以你名字命名的主义。
          </p>
          <div className="card namecard">
            <label>你的姓氏或昵称（用于命名主义，如“李”）</label>
            <input
              value={name}
              maxLength={8}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：李 / 阿哲"
            />
          </div>
          <div className="row">
            <button className="primary" onClick={startOrResume}>
              {thought.some((v) => v !== null) || envAns.some((v) => v !== null)
                ? '继续测试 / 查看报告'
                : '开始思想测试（约8分钟）'}
            </button>
            <button className="ghost" onClick={() => setStep('gallery')}>先逛哲学家画廊</button>
          </div>
          <p className="tip">全本地计算，结果只存你的浏览器，可一键生成分享链接与图片。娱乐启发向，非学术诊断。</p>
        </main>
      )}

      {step === 'quiz' && (
        <main className="wrap">
          <QuizProgress cur={qi} total={THOUGHT_QUESTIONS.length} label="思想卷" done={thought.filter((v) => v !== null).length} />
          <QuestionCard
            mod={THOUGHT_QUESTIONS[qi].mod}
            text={`${qi + 1}. ${THOUGHT_QUESTIONS[qi].text}`}
            value={thought[qi]}
            onPick={answerThought}
            onBack={qi > 0 ? () => setQi(qi - 1) : undefined}
          />
        </main>
      )}

      {step === 'env' && (
        <main className="wrap">
          {ei === 0 && (
            <div className="card notice">
              <b>思想卷完成 ✓</b>
              <p>下面是独立的<b>环境量表</b>：描述你当下的生活环境（学校/单位/城市），用于测算你的哲学与环境的契合度。</p>
            </div>
          )}
          <QuizProgress cur={ei} total={ENV_QUESTIONS.length} label="环境卷" done={envAns.filter((v) => v !== null).length} />
          <QuestionCard
            mod="生活环境"
            text={`${ei + 1}. ${ENV_QUESTIONS[ei].text}`}
            value={envAns[ei]}
            onPick={answerEnv}
            onBack={ei > 0 ? () => setEi(ei - 1) : undefined}
          />
        </main>
      )}

      {step === 'result' && result && (
        <main className="wrap">
          <div className="report">
            <h2>{name || '无名'}氏哲学报告</h2>
            <div className="card ism">
              <div className="badge">{result.naming.traced ? '守正溯源型' : '综合命名型'}</div>
              <h3>{result.naming.ism}</h3>
              <p className="en">{result.naming.ismEn}</p>
              <p>{result.naming.manifesto}</p>
            </div>

            <h3>一、十二维思想坐标</h3>
            <div className="card">
              <EChart height={340} option={dimBarOption(result.user)} />
            </div>

            <h3>二、流派成分（饼图）</h3>
            <div className="card">
              <EChart height={320} option={pieOption(result.shares)} />
              <table className="tbl">
                <tbody>
                  {result.shares.map((s) => (
                    <tr key={s.name}><td>{s.name}</td><td>{s.value}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>三、哲学家溯源 Top 5</h3>
            {result.phils.slice(0, 5).map((r, i) => (
              <div className="card phil" key={r.p.id}>
                <b>{i + 1}. {r.p.name}</b>
                <span className="sim">{Math.round(r.sim * 100)}%</span>
                <p className="meta">{r.p.years} · {r.p.region} · 《{r.p.work}》</p>
                <p>「{r.p.quote}」</p>
                <p className="bio">{r.p.bio}</p>
              </div>
            ))}

            <h3>四、政治光谱定位</h3>
            <div className="card">
              <EChart height={340} option={compassOption(result.cp, result.schools.slice(0, 12).map((r) => ({ ...compass(r.s.vec), name: r.s.name })))} />
              <p className="meta">经济：{result.cp.x < 0 ? `左 ${result.cp.x}` : `右 +${result.cp.x}`}　权威—自由：{result.cp.y > 0 ? `威权 +${result.cp.y}` : `自由 ${result.cp.y}`}</p>
            </div>

            <h3>五、你 vs {result.phils[0].p.name}（雷达）</h3>
            <div className="card">
              <EChart height={360} option={radarOption(result.user, result.phils[0].p.name, result.phils[0].vec)} />
            </div>

            <h3>六、守正 · 创新 · 扬弃</h3>
            <div className="card"><b>守正（继承）</b><p>{result.naming.shouzheng}</p></div>
            <div className="card"><b>推陈出新（偏离与生长）</b><p>{result.naming.chuangxin}</p></div>
            <div className="card"><b>扬弃（保留什么、丢掉什么）</b><p>{result.naming.yangqi}</p></div>

            <h3>七、与当下环境的契合度：{result.fit.total} 分 · {result.fit.level}</h3>
            <div className="card">
              <p className="howto">
                怎么读这张表：「<b>环境奖赏</b>」是你感受到的环境压力方向（由 15 道环境题算出，正数偏向每行的前一个词，负数偏向后一个词）；
                「<b>你的立场</b>」是思想卷测出的你自己；「<b>契合</b>」是两者距离换算成的百分制。
                重点看<b>红色条</b>和「拧巴」行——那就是你和环境最较劲的地方。
              </p>
              <EChart height={300} option={fitOption(result.fit.axes.map((a) => ({ name: a.label, value: a.fit })))} />
              <p>{result.fit.advice}</p>
              <table className="tbl">
                <thead><tr><th>维度</th><th>环境奖赏</th><th>你的立场</th><th>契合</th><th>解读</th></tr></thead>
                <tbody>
                  {result.fit.axes.map((a) => (
                    <tr key={a.label}>
                      <td>{a.label}</td>
                      <td>{sideWord(a.dim, a.demand)}<span className="meta"> {fmtV(a.demand)}</span></td>
                      <td>{sideWord(a.dim, a.mine)}<span className="meta"> {fmtV(a.mine)}</span></td>
                      <td>{a.fit}%</td>
                      <td>{fitReading(a.dim, a.demand, a.mine)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>八、分享卡（保存图片即得高清图）</h3>
            <div className="cardwrap">
              <ShareCard
                cardRef={cardRef}
                name={name || '无名'}
                naming={result.naming}
                phils={result.phils.slice(0, 3).map((r) => ({ name: r.p.name, sim: Math.round(r.sim * 100), quote: r.p.quote }))}
                cp={result.cp}
                fitTotal={result.fit.total}
                fitLevel={result.fit.level}
              />
            </div>
          </div>

          <div className="row share">
            <button className="primary" onClick={copyLink}>{copied ? '已复制 ✓' : '复制分享链接'}</button>
            <button className="ghost" onClick={downloadCard}>保存分享卡图片</button>
            <button className="ghost" onClick={resetAll}>清空重测</button>
          </div>
        </main>
      )}

      {step === 'gallery' && (
        <main className="wrap">
          <h2>哲学家画廊 · {PHILOSOPHERS.length} 位</h2>
          <div className="row filters">
            <input value={galleryQ} onChange={(e) => setGalleryQ(e.target.value)} placeholder="搜索名字 / 著作 / 关键词" />
            <select value={galleryR} onChange={(e) => setGalleryR(e.target.value)}>
              {['全部', ...Array.from(new Set(PHILOSOPHERS.map((p) => p.region)))].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="grid">
            {PHILOSOPHERS.filter(
              (p) =>
                (galleryR === '全部' || p.region === galleryR) &&
                (galleryQ === '' || (p.name + p.work + p.bio + p.quote).includes(galleryQ)),
            ).map((p) => (
              <div className="card phil" key={p.id}>
                <b>{p.name}</b> <span className="meta">{p.years} · {p.region}</span>
                <p className="meta">《{p.work}》</p>
                <p>「{p.quote}」</p>
                <p className="bio">{p.bio}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      <footer className="foot">哲学罗盘 Philo-Compass · 本地测试 · 数据 {PHILOSOPHERS.length} 哲学家 / 开源共享</footer>
    </div>
  );
}

function QuizProgress({ cur, total, label, done }: { cur: number; total: number; label: string; done: number }) {
  return (
    <div className="progress">
      <span>{label} {cur + 1}/{total}　已答 {done}/{total}</span>
      <div className="bar"><i style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
    </div>
  );
}

/** 维度数值 → 白话站位词 */
function sideWord(dim: number, v: number): string {
  const d = DIMS[dim];
  if (v > 0.5) return d.pos;
  if (v < -0.5) return d.neg;
  return '居中';
}

function fmtV(v: number): string {
  return `${v > 0 ? '+' : ''}${v}`;
}

/** 单维度契合的一句话解读 */
function fitReading(dim: number, demand: number, mine: number): string {
  const d = DIMS[dim];
  const s = (v: number) => (v > 0.5 ? 'pos' : v < -0.5 ? 'neg' : 'mid');
  const w = (k: string) => (k === 'pos' ? d.pos : k === 'neg' ? d.neg : '中间');
  const es = s(demand);
  const ms = s(mine);
  if (es === ms) return `同频：环境与你都偏「${w(ms)}」`;
  if (es === 'mid') return `相安无事：环境无要求，你偏「${w(ms)}」`;
  if (ms === 'mid') return `可进可退：环境要「${w(es)}」，你居中`;
  return `拧巴：环境要「${w(es)}」，你却向「${w(ms)}」`;
}

/** 固定 720px 宽的竖版分享卡：所见即导出所得，保证高清 */
function ShareCard({ cardRef, name, naming, phils, cp, fitTotal, fitLevel }: {
  cardRef: RefObject<HTMLDivElement | null>;
  name: string;
  naming: { traced: boolean; ism: string; ismEn: string; manifesto: string };
  phils: { name: string; sim: number; quote: string }[];
  cp: { x: number; y: number };
  fitTotal: number;
  fitLevel: string;
}) {
  const econ = cp.x < 0 ? `经济左 ${cp.x}` : `经济右 +${cp.x}`;
  const auth = cp.y > 0 ? `威权 +${cp.y}` : `自由 ${cp.y}`;
  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        ref={cardRef}
        style={{
          width: 720, background: '#fffdf8', color: '#2b2620',
          border: '1px solid #e8e0d2', borderRadius: 16, padding: '40px 44px',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800 }}>🧭 哲学罗盘</div>
        <div style={{ fontSize: 15, color: '#8a8175', marginTop: 4 }}>{name}氏哲学报告 · 本地测试</div>
        <div
          style={{
            display: 'inline-block', fontSize: 14, background: '#b98a2f', color: '#fff',
            borderRadius: 20, padding: '2px 14px', marginTop: 18,
          }}
        >
          {naming.traced ? '守正溯源型' : '综合命名型'}
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.35, margin: '10px 0 4px' }}>{naming.ism}</div>
        <div style={{ fontSize: 15, color: '#8a8175' }}>{naming.ismEn}</div>
        <div style={{ fontSize: 17, lineHeight: 1.8, marginTop: 14 }}>{naming.manifesto}</div>
        <div style={{ borderTop: '1px solid #e8e0d2', marginTop: 20, paddingTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>思想血缘 Top 3</div>
          {phils.map((p, i) => (
            <div key={p.name} style={{ fontSize: 16, lineHeight: 1.7 }}>
              {i + 1}. {p.name} <span style={{ color: '#2f6f4e', fontWeight: 800 }}>{p.sim}%</span>
              <span style={{ color: '#8a8175' }}>　「{p.quote}」</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #e8e0d2', marginTop: 16, paddingTop: 16, fontSize: 16, lineHeight: 2 }}>
          <div>政治光谱：{econ} · {auth}</div>
          <div>环境契合：<span style={{ fontWeight: 800 }}>{fitTotal} 分 · {fitLevel}</span></div>
        </div>
        <div style={{ marginTop: 20, fontSize: 13, color: '#8a8175' }}>
          Philo-Compass · 哲学罗盘 · 凭分享链接查看完整互动报告 · 仅供娱乐
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ mod, text, value, onPick, onBack }: {
  mod: string; text: string; value: number | null;
  onPick: (v: number) => void; onBack?: () => void;
}) {
  return (
    <div className="card q">
      <span className="mod">{mod}</span>
      <h2>{text}</h2>
      <div className="likert">
        {LIKERT.map((o) => (
          <button key={o.value} className={value === o.value ? 'sel' : ''} onClick={() => onPick(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {onBack && <button className="link back" onClick={onBack}>← 上一题</button>}
    </div>
  );
}

function dimBarOption(user: number[]): EChartsOption {
  return {
    tooltip: {},
    xAxis: { type: 'value', min: -2, max: 2 },
    yAxis: { type: 'category', data: DIMS.map((d) => d.short), axisLabel: { fontSize: 11 } },
    grid: { left: 90, right: 20, top: 10, bottom: 20 },
    series: [{
      type: 'bar',
      data: user.map((v) => ({
        value: Math.round(v * 100) / 100,
        itemStyle: { color: v >= 0 ? '#2f6f4e' : '#8a5a2b' },
      })),
    }],
  };
}

function pieOption(shares: { name: string; value: number }[]): EChartsOption {
  return {
    tooltip: { formatter: '{b}：{c}%' },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: shares.map((s) => ({ name: s.name, value: s.value })) }],
  };
}

function radarOption(user: number[], pname: string, pvec: number[]): EChartsOption {
  return {
    legend: { data: ['你', pname], bottom: 0 },
    radar: {
      indicator: DIMS.map((d) => ({ name: d.short, max: 4 })),
    },
    series: [{
      type: 'radar',
      data: [
        { name: '你', value: user.map((v) => Math.round((v + 2) * 100) / 100) },
        { name: pname, value: pvec.map((v) => Math.round((v + 2) * 100) / 100) },
      ],
    }],
  };
}

function compassOption(cp: { x: number; y: number }, dots: { name: string; x: number; y: number }[]): EChartsOption {
  return {
    tooltip: { formatter: (p: unknown) => {
      const d = (p as { data: [number, number, string] }).data;
      return `${d[2]}（${d[0]}, ${d[1]}）`;
    } },
    xAxis: { min: -10, max: 10, name: '←左 ｜ 右→' },
    yAxis: { min: -10, max: 10, name: '威权↑ 自由↓' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    series: [
      {
        type: 'scatter',
        symbolSize: 8,
        data: dots.map((d) => ({ value: [d.x, d.y, d.name] as unknown as number, name: d.name })),
      },
      {
        type: 'scatter',
        symbolSize: 18,
        data: [{ value: [cp.x, cp.y, '你'] as unknown as number, name: '你' }],
      },
    ],
  };
}

function fitOption(axes: { name: string; value: number }[]): EChartsOption {
  return {
    tooltip: {},
    xAxis: { type: 'value', min: 0, max: 100 },
    yAxis: { type: 'category', data: axes.map((a) => a.name), axisLabel: { fontSize: 11 } },
    grid: { left: 90, right: 20, top: 10, bottom: 20 },
    series: [{
      type: 'bar',
      data: axes.map((a) => ({
        value: a.value,
        itemStyle: { color: a.value >= 70 ? '#2f6f4e' : a.value >= 45 ? '#b98a2f' : '#a33b3b' },
      })),
    }],
  };
}
