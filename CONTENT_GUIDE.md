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

