# 🧭 哲学罗盘 Philo-Compass

测测你的思想属于哪位哲学家。60 道思想题 × 15 道环境题，像 MBTI 一样看清你的思想成分。

- **思想溯源**：100 位哲学家 / 50+ 流派 / 政治光谱，条形图 + 饼图 + 雷达 + 光谱散点
- **守正 · 推陈出新 · 扬弃**：自动生成三段式解读（继承 / 偏离生长 / 保留与扬弃）
- **命名主义**：成分混杂者获得以自己名字命名的主义 + 宣言（如"李氏辩证生态存在主义"）
- **环境契合度**：独立 15 题环境量表，测你的哲学与当下环境的契合 / 张力 / 疏离
- **全本地计算**：无后端，结果存浏览器 localStorage，可生成分享链接 `?r=` 与报告图片
- **哲学家画廊**：可搜索 / 按地域筛选的思想家数据库

在线访问：`https://<你的GitHub用户名>.github.io/philo-compass/`

## 本地运行

```bash
npm install
npm run dev      # 开发
npm run build    # 构建，产物在 dist/
```

## 数据与算法

- `src/data/`：`dimensions.ts`（12 维坐标空间）、`schools.ts`（52 流派向量）、
  `philosophers.ts`（100 位思想家：流派 + 微调 + 代表作 + 金句）、`questions.ts`（60 + 15 题）
- `src/lib/engine.ts`：加权计分 → 12 维用户向量 → 余弦相似度排名 →
  规则命名（大头直接溯源 / 混合综合命名）→ 环境契合度（向量距离）
- 政治光谱坐标由"平等—效率""自由—权威"两维推导，对接 8values / PoliticalCompass 式解读

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）。
首次需在仓库 Settings → Pages → Source 选择 **GitHub Actions**。

## 声明

娱乐启发向测试，非学术诊断；政治人物条目仅作思想史定位的中性描述。
