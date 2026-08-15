# Vibe PPT Web Template

一个用于制作“演讲式 PPT 网页”的通用前端框架。它提供固定比例幻灯片、长页浏览、演讲模式、键盘翻页、移动端缩放和可配置版式。

仓库默认不含任何真实人物、公司、产品、账号、二维码、头像或个人照片；所有内容都是通用占位文本和占位图片。

## 快速开始

```bash
npm install
npm run validate
npm run dev
```

也可以用 Markdown 生成内容文件：

```bash
npm run import:markdown -- examples/sample-apple.md
```

主题规范见 [`THEME_GUIDE.md`](THEME_GUIDE.md)。内置主题 ID 为 `default`、`apple`、`dopamine`、`cyberpunk`；Markdown frontmatter 未写 `theme` 时自动使用 `default`。

每套主题拥有独立的标题比例、页面边距、图文构图、图片框架和卡片结构。Markdown 可用 `layout`、`imageRatio`、`imageFit`、`imagePosition`、`backgroundImage` 和 `backgroundPosition` 控制单页图片表达，完整字段见 [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md)。

然后打开终端显示的本地地址。生产构建：

```bash
npm run build
```

## 你应该从哪里开始

- 内容入口：[`src/content.js`](src/content.js)
- 人类与 AI 的填充规则：[`CONTENT_GUIDE.md`](CONTENT_GUIDE.md)
- 可直接复制的 AI 提示词：[`AI_PROMPT_TEMPLATE.md`](AI_PROMPT_TEMPLATE.md)
- 本地素材说明：[`public/assets/README.md`](public/assets/README.md)
- 结构校验：[`scripts/validate-content.mjs`](scripts/validate-content.mjs)
- Markdown 导入：[`scripts/markdown-to-content.mjs`](scripts/markdown-to-content.mjs)

## 已有交互

- 滚动模式：按顺序浏览所有幻灯片。
- 演讲模式：隐藏其他幻灯片，使用 `←`、`→`、`PageUp`、`PageDown`、空格、`Home`、`End` 翻页。
- `Escape`：退出演讲模式。
- 项目画廊：点击左侧项目卡片切换右侧占位图。

## 版式类型

`cover`、`profile`、`gallery`、`chapter`、`pipeline`、`stat`、`flow`、`roadmap`、`reviews`、`skills`、`closing`、`outro`。

每页使用一个 `type`，由 `src/App.jsx` 选择对应渲染器。填充内容时优先复用已有类型；只有多个页面都需要同一新结构时，才扩展渲染器和样式。

## 隐私与素材边界

- 不要提交 `.env`、凭据、Cookie、密钥、真实二维码或未经授权的用户反馈。
- 不要把个人照片、原始聊天记录或私有客户数据复制进模板仓库。
- 素材必须保存为实际文件，放在 `public/assets/`，不要使用远程热链或 Base64。
- 这是一个前端模板，不包含后端、数据库或账号系统。
