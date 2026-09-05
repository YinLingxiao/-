# 邮你前行-地戏新生

北京邮电大学学生社会实践项目静态成果网站。项目记录实践团于 2026 年暑期在贵州省长顺县广顺镇、马路乡及安顺天龙古镇开展的地戏数字化保护田野实践，以长篇叙事、人物口述、面具图鉴、影像短片和成果档案服务学院成果展示与结项答辩。

> 内容与产品边界见 [`PRODUCT.md`](./PRODUCT.md)，视觉与交互规范见 [`DESIGN.md`](./DESIGN.md)。

## 当前交付状态

- Astro 静态构建成功：63 个页面；
- 7 个人物详情页与 47 个面具详情页已静态生成；
- `sitemap-index.xml` 已生成；
- 63/63 个 HTML 页面均含 `noindex, nofollow`；
- `astro check` 0 errors / 0 warnings / 0 hints；
- Impeccable 检测器全站 0 条命中；
- Lighthouse（生产构建）：首页 Performance 98 / Accessibility 100 / Best Practices 100，面具档案页三项均 100；SEO 仅因有意的防收录指令未满分；
- 17 条代表性主路由已通过 HTTP 200 冒烟测试；
- Chrome 实机渲染已检查桌面与移动首屏、人物详情、面具档案；
- 移动导航展开、面具筛选（47→9）、原生灯箱均验证通过；
- 最近一次构建产物：1547 个文件，约 389.44 MiB，其中 13 段视频约 139.57 MiB。

## 技术栈

- [Astro 7](https://docs.astro.build/)；
- TypeScript strict；
- Astro Content Collections / Content Layer；
- 原生 TypeScript 与 CSS；
- Astro `Picture` / `getImage` 构建期图片优化；
- FFmpeg / FFprobe 素材处理；
- `@astrojs/sitemap`；
- 无前端框架、Tailwind、后端、数据库、登录、API 或 CMS。

## 页面结构

```text
/
├── /fieldwork
├── /people
│   └── /people/[slug]                  # 7 个静态人物详情
├── /results
├── /archive
│   ├── /archive/masks
│   │   └── /archive/masks/[slug]       # 47 个静态面具详情
│   ├── /archive/media
│   └── /archive/context
└── /about
```

首页由八个连续叙事章节组成：主视觉、项目缘起、五项工作、田野路线、人物速览、成果概览、精选面具、团队与致谢。

## 目录结构

```text
.
├── public/
│   └── media/video/                    # 13 段处理后 H.264 短片
├── src/
│   ├── assets/media/                   # Web 图片母版与视频海报
│   ├── components/                     # 页眉、页脚、图像、视频、引语、灯箱
│   ├── content/
│   │   ├── fieldwork/                  # 三日田野纪行
│   │   ├── masks/masks.json            # 47 条面具数据
│   │   ├── media/media.json            # 13 条影像数据
│   │   ├── outcomes/                   # 7 类成果
│   │   └── people/                     # 7 位人物口述
│   ├── layouts/Base.astro
│   ├── pages/                          # 文件路由
│   ├── scripts/prepare-media.mjs       # 只读源素材处理流水线
│   ├── styles/global.css               # 全局 tokens 与基础样式
│   ├── utils/images.ts                 # 图片注册与解析
│   └── content.config.ts               # 内容集合 schema
├── .notes/                             # 内部转写工作副本；已忽略，绝不发布
├── astro.config.mjs
├── DESIGN.md
├── PRODUCT.md
└── README.md
```

## 本地开发

### 环境要求

- Node.js `>=22.12.0`；
- npm；
- 仅在重新处理素材时需要 FFmpeg 与 FFprobe。

### 安装依赖

```sh
npm install
```

### 启动开发服务器

项目规则要求使用 Astro 后台模式：

```sh
npm run astro -- dev --background
```

管理后台服务器：

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

### 构建与预览

```sh
npm run build
npm run preview
```

静态产物输出到 `dist/`。部署前应把 `astro.config.mjs` 中的学院占位域名 `https://example.edu.cn` 替换为最终公开域名，再重新构建，以生成正确的 canonical 与 sitemap URL。

## 素材处理

### 只读源原则

素材脚本的源目录固定为：

```text
E:\素材\一次分类(1)\一次分类
```

该目录只读。`src/scripts/prepare-media.mjs` 只执行读取并向项目目录写入派生副本，绝不移动、重命名、删除或覆盖源文件。

### 执行命令

幂等执行，已有派生文件会跳过，但数据清单仍会重建：

```sh
npm run media:prepare
```

强制重新生成所有派生图片、视频与海报：

```sh
npm run media:prepare:force
```

`--force` 仅覆盖项目内派生文件，不会写入 E 盘源目录。

### 处理结果

- 34 张精选照片生成最长边 2400px 的 JPEG Web 母版；
- 47 张面具记录生成 Web 母版；
- 13 段原始视频各截取 20–60 秒代表片段，编码为最高 1080p H.264 + AAC，并启用 faststart；
- 13 张视频海报生成到 `src/assets/media/video/`；
- 自动重建 `masks.json` 与 `media.json`；
- 面具角色只从照片中清晰可辨的实体标签录入，其余统一为“待考证”。当前确认标签：呼天宝、呼天庆、赵公明、小军、薛应龙。

## 数据口径

两组数字必须始终分开：

### 项目田野采集总量（以最终素材总账为准）

- 9 位受访者；
- 约 809 张照片；
- 44 段视频。

### 本站入选内容

- 34 张精选照片；
- 47 张面具照片（38 张演武堂墙面陈列、9 张燕世忠工坊实物近景）；
- 13 段处理后视频；
- 13 份转写稿作为内部内容来源。

## 内容集合

`src/content.config.ts` 定义五个集合：

| 集合 | Loader | 内容 |
| --- | --- | --- |
| `people` | `glob` | 人物身份、关系、肖像、引语、关联影像与正文故事 |
| `masks` | `file` | 47 条面具图像、来源、地点、角色、关联人物 |
| `fieldwork` | `glob` | 日期、地点、摘要、照片与正文记录 |
| `outcomes` | `glob` | 报告、视频、照片、采访、图鉴、网站、归档七类成果 |
| `media` | `file` | 13 条短片、海报、时长、类别、摘要与关联人物 |

所有集合都保留以下治理字段：

```ts
visibility: 'public' | 'internal' | 'hidden'
consentLevel: 'confirmed' | 'pending' | 'restricted'
```

当前页面只应展示符合公开条件的项目内容。若后续收紧授权，先修改集合数据，再确认页面查询显式过滤相应字段。

## 内容安全边界

- 公开事实、姓名、地名、数字、身份、引语与成果只来自真实素材或人工校对的转写内容；
- 无法确认的信息使用“待考证”或“待补充”，不补写角色与背景；
- 完整转写稿、完整原始采访视频、敏感个人资料与内部许可材料不进入发布目录；
- `.notes/` 与 `.qa/` 均已加入 `.gitignore`；
- 联系方式使用公共项目邮箱 `2025211655@bupt.cn`；
- 涉及未成年人的叙述保持尊重与克制；
- 视频使用 `preload="none"`，不自动播放、不自动出声；
- 页面统一包含 `<meta name="robots" content="noindex, nofollow">`。

## 可访问性与交互

- 跳至正文链接与语义化导航；
- 当前导航使用 `aria-current`；移动菜单维护 `aria-expanded`；
- 筛选按钮维护 `aria-pressed`；
- 原生 `<dialog>` 灯箱支持 Esc、方向键、前后切换与焦点恢复；
- 清晰的 `:focus-visible` 状态；
- 关键控制最小 44px；
- 支持 `prefers-reduced-motion`；
- 图片均配置替代文本，视频均提供海报与原生控件；
- 手机、平板、桌面采用响应式排版，不依赖 SPA hydration。

## Impeccable 工作流记录

Impeccable 4.1.1 已安装到 `.claude/`（项目级），并按原始要求完成 `init → critique → audit → polish → 最终复核`。环境无 Git 仓库与 Worktree hooks，两个独立评估 subagent 采用远程隔离运行，未降级为单上下文。

- **init**：将 `PRODUCT.md` 迁移到当前 product schema（加入 `<!-- impeccable:product-schema 1 -->` 标记、`Platform`、`Positioning`、`Operating Context`、`Evidence on Hand`、`Product Principles` 等小节），未改动任何事实或范围。
- **critique（首页）**：双评估。设计评审（Assessment A，独立 subagent）与检测器证据（Assessment B，独立 subagent）均完成；确定性检测器对首页返回 0 条命中。综合得分 **21/28**。发现 2 个 P1（首屏缺三条入口、内部转写被误列为公开收录）、2 个 P2（占位邮箱与下载文案冲突、人物列表 DOM/视觉顺序不一致）、1 个 P3（面具筛选缺结果反馈）。快照已写入 `.impeccable/critique/`。
- **audit（全站）**：检测器命中 5 条（灯箱空 `src` 为真实问题；4 条边线强调为编辑式引语/统计栏的有意设计，polish 时降为 1px 消除噪声）。手工审计确认视频暂无同步字幕（需后续人工打轴）与人物列表顺序问题。技术健康度 17/20。
- **polish**：应用全部 P1/P2/P3 修复——首页 hero 增加编辑式快速入口、内部转写来源措辞改为“内部转写来源（仅公开校对引语）”、移除页脚下载暗示、灯箱清理空 src 与冗余键盘分支、人物列表改为 DOM 顺序与视觉一致、面具筛选增加 `aria-live="polite"` 结果反馈、边线强调统一为 1px。
- **最终复核**：`astro check` 0 errors / 0 warnings / 0 hints；检测器全站 0 条命中；构建 63 页无错误；Lighthouse 实测通过（见下）。

`typeset / layout / colorize` 未单独运行：critique 与 audit 未发现需要这三个增强命令介入的排版、布局或配色缺陷，既有 DESIGN tokens 与排版层级已符合规范。

## 已执行 QA

### 类型与静态扫描

```text
astro check: 0 errors · 0 warnings · 0 hints
impeccable detect.mjs src: []  (0 findings)
```

### Lighthouse（生产构建，headless Chrome）

| 页面 | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 98 | 100 | 100 | 66* |
| `/archive/masks` | 100 | 100 | 100 | 66* |

\* SEO 唯一未通过项为 `is-crawlable`（页面因 `<meta name="robots" content="noindex, nofollow">` 被禁止收录），这是原始要求的学院展示阶段防收录设置，属有意行为；其余 SEO 审计（title、meta description、canonical、lang、链接描述）全部通过。

### 构建

```text
Astro 7.2.9
output: static
63 pages built
sitemap-index.xml created
build complete
```

### 浏览器检查

使用本机 Chrome headless 真实渲染：

- 桌面：主页、面具图鉴；
- 移动：主页、金云祥人物详情；
- 390px 视口：文档宽度与视口一致，无横向溢出；
- 移动导航：按钮为 `44 × 44px`，点击后 `aria-expanded=true`，六项导航显示；
- 面具筛选：总计 47 条，切换“燕世忠工坊实物”后显示 9 条，按钮 `aria-pressed=true`；
- 面具灯箱：可打开、关闭，原生 dialog 状态正确。

### 内容扫描

已扫描公开源码中的禁用栏目用语、锁定姓名误写和敏感个人资料关键词；当前无匹配。已确认 `.notes/` 不进入 `dist/`。

## 发布前清单

- [ ] 替换最终站点域名并重建；
- [ ] 由项目团队复核所有事实、引语、角色标签和授权范围；
- [x] 公共项目邮箱已设为 `2025211655@bupt.cn`；
- [ ] 为 13 段视频补齐人工校对字幕（当前无同步字幕轨）；
- [ ] 在至少一台真实手机上复核导航、灯箱、视频与长页面滚动；
- [ ] 最终确认 `dist/` 中不含内部资料后再发布。
