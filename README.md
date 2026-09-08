# 邮你前行 · 地戏新生

北京邮电大学学生社会实践成果展示网站，记录团队在贵州长顺、安顺开展的地戏田野调查，包括实践纪行、人物访谈、面具图鉴和影像档案。

网站使用 Astro 和 TypeScript，构建为静态页面。当前收录 7 位田野人物、38 张已命名面具和 13 段视频，共 54 个页面。

## 本地开发

需要 Node.js 22.12 或更高版本。

```sh
npm ci
npm run astro -- dev --background
```

管理开发服务：

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## 检查与构建

```sh
npm run check
npm test
npm run build
npm run preview
```

构建结果位于 `dist/`。源码已包含网页所需的图片和视频，正常开发、构建无需原始素材或 FFmpeg。

## 目录

```text
public/                 站点图标与视频
src/assets/media/       图片与视频海报
src/components/         公共组件
src/content/            人物、实践、成果、面具与影像数据
src/data/mask-roles.json 面具编号与角色名称
src/layouts/            页面布局
src/pages/              页面路由
src/scripts/            素材处理脚本
src/styles/             全局样式
src/utils/              工具函数
tests/                 回归测试
```

## 内容维护

- 人物、实践纪行与成果记录使用 Markdown；面具和影像清单使用 JSON。
- 面具名称及收录范围以 `src/data/mask-roles.json` 为准，同步维护 `src/content/masks/masks.json`。未命名面具不收录。
- 内容必须填写 `visibility` 和 `consentLevel`，仅 `public / confirmed` 条目进入页面与详情路由。
- 更改授权范围后须重新构建，完整替换部署产物。手写正文与独立照片引用需要一并检查。
- `.notes/` 为本地内部资料，已排除版本管理。完整转写、原始访谈和内部授权材料不公开。

如需重新处理原始素材，先安装 FFmpeg 和 FFprobe，并将环境变量 `MEDIA_SOURCE_DIR` 设置为素材根目录。根目录应包含“精选照片”“面具记录”和“视频分类”。

```sh
npm run media:prepare
```

已有派生素材默认跳过；`npm run media:prepare:force` 会重新生成项目内的派生副本。脚本只读取原始素材。

## 部署

构建前将 `astro.config.mjs` 的 `site` 设置为实际部署地址，确保 canonical 和 sitemap 地址正确。当前页面保留 `noindex, nofollow`，用于学院展示阶段。

将 `dist/` 部署到静态托管服务。上传源码到 GitHub 不会自动发布网站，部署方式需在托管平台单独配置。
