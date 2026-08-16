# 内容填充指南

这个仓库把“演讲式 PPT 网页”拆成两层：

1. `src/App.jsx` 和 `src/deck.css` 是稳定的展示框架，不建议为了填内容而修改。
2. `src/content.js` 是唯一默认内容入口，其他人或 AI 只需要替换这里的字段和素材路径。

## 最小工作流

1. 复制仓库并安装依赖：`npm install`。
2. 打开 `src/content.js`。
3. 先改 `deck.title`、`deck.subtitle` 和 `deck.speaker`。
4. 按顺序改 `slides`，每一页保留已有 `type`，只替换文案、数字和本地图片路径。
5. 把图片放到 `public/assets/`，例如 `public/assets/hero.jpg`，内容中写 `/assets/hero.jpg`。
6. 执行 `npm run validate` 检查内容结构和远程依赖。
7. 执行 `npm run dev`，在浏览器中查看；执行 `npm run build` 做生产构建。

## Markdown 导入

使用 `npm run import:markdown -- <文件>` 将 Markdown 转换为 `src/content.js`。文件可用 YAML 风格 frontmatter 指定 `theme`、`title`、`subtitle` 和 `speaker`；缺少主题时回退为 `default`。一级标题 `# cover`、`# profile` 等表示一页，字段使用 `key: value`，列表放在 `## facts`、`## items`、`## steps`、`## loop`、`## reviews` 或 `## statements` 下，并用 `|` 分隔对象字段。

```md
---
theme: apple
title: 你的演示标题
speaker:
  name: 你的姓名
  role: 你的职位
---
# cover
eyebrow: YOUR TOPIC
title:
- 第一行标题
- 第二行标题
subtitle: 一句话副标题
```

图片只允许 `/placeholder.svg`、`/placeholder-avatar.svg`、`/placeholder-qr.svg`、`/placeholder-background.svg` 或 `/assets/...` 本地路径，远程 URL、Base64 图片会被拒绝。导入脚本会先把现有内容备份到 `/tmp`。

### 图片与构图字段

```md
# profile
layout: media-right
image: /assets/product.jpg
imageRatio: 4:3
imageFit: cover
imagePosition: top
backgroundImage: /assets/background.jpg
backgroundFit: cover
backgroundPosition: center
```

- `layout`：`auto`、`media-left`、`media-right`、`media-top`、`media-bottom`、`full-bleed`、`center`。
- `imageRatio`：`auto`、`1:1`、`4:3`、`3:4`、`16:9`、`9:16`。
- `imageFit`：摄影图通常使用 `cover`，产品图、界面截图和流程图通常使用 `contain`。
- `backgroundFit`：背景摄影图通常使用 `cover`；需要完整展示的产品图或设备图使用 `contain`。它与 `imageFit` 独立，避免普通图片设置意外改变背景裁切。
- `imagePosition` / `backgroundPosition`：`center`、`top`、`bottom`、`left`、`right`、`top left`、`top right`、`bottom left`、`bottom right`。
- 画廊项目支持 `标题 | 描述 | 图片 | 比例 | 焦点 | fit`。

主题会决定默认边距、图文比例、图片框、卡片和标题节奏；Markdown 的 `layout` 用来表达这一页的内容意图，不应为每套主题手写不同内容。

### 图片白底与裁切排查

- `contain` 只能保证图片内容完整，不会移除图片文件自身已经存在的白色像素。
- PNG/WebP 透明素材若出现矩形白底，先检查原文件是否真的带透明通道，再检查主题图片框是否设置了背景、边框或阴影。
- 设备图、界面截图和二维码默认优先 `contain`；只有允许裁掉边缘的摄影图才使用 `cover`。
- 关键按钮或顶部状态栏必须进入逐页截图验收，不能只依赖图片加载成功。
- 素材文件可能自带透明外边距、白色画布或拍摄背景；CSS 无法可靠区分“需要保留的白色内容”和“多余白边”，应先检查原图像素边界。
- 二维码、海报和截图中的日期、账号、型号等文字属于图片内容，替换素材后必须人工复核，不能只校验文件尺寸和加载状态。
- 一页需要两张或更多同级图片时，应使用支持图片数组的版式；不要把多张图临时拼进单图字段，也不要靠缩小图片掩盖版式能力不足。

## 给 AI 的约束

让 AI 填充时，把下面这段作为任务边界：

> 只修改 `src/content.js` 和 `public/assets/`。不要修改 `src/App.jsx`、`src/deck.css`、`vite.config.js` 或依赖版本，除非明确要求扩展版式。不要创建新的页面路由。不要写入个人隐私、账号密码、API Key、Cookie、Base64 图片或远程素材 URL。所有图片使用 `public/assets/` 内的本地文件路径；缺少素材时保留占位图片。

## 内容写作建议

- 封面只表达一个主题、一个动作和一句副标题。
- 每页只保留一个主要结论；长段落拆成标题、短句和卡片。
- 数字必须带单位、时间范围或统计口径。
- 案例页先写“问题”，再写“方法”，最后写“结果”。
- 反馈页只放经授权可公开的摘录；否则使用匿名占位文字。
- 结尾页写清楚听众下一步可以做什么。

## 图片替换规则

| 用途 | 默认占位 | 推荐尺寸 |
| --- | --- | --- |
| 大图 / 项目截图 | `/placeholder.svg` | 4:3 或 16:9 |
| 头像 | `/placeholder-avatar.svg` | 1:1 |
| 二维码 | `/placeholder-qr.svg` | 1:1 |

不应把截图直接粘进代码或 Markdown；请保存为实际文件，再由 `src/content.js` 引用。
