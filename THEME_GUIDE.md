# 主题设计规范

主题是整套演示文稿的视觉设计系统，内容数据与版式结构保持独立。每个主题必须定义：字体族（标题、正文、等宽）、页面/纸张/深色背景、表面色、前景色、次级文字、标题色、链接色、主/次强调色、边框、阴影、圆角、动效 easing 与 duration。

## 内置主题

| ID | 名称 | 关键词 | 适用场景 |
| --- | --- | --- | --- |
| `default` | 默认 | 纸张、深色、蓝色强调 | 通用分享与快速起稿 |
| `apple` | 苹果风 | 留白、低饱和、系统蓝 | 产品发布、设计评审 |
| `dopamine` | 多巴胺 | 高饱和、圆角、贴纸感 | 社交内容、创意提案 |
| `cyberpunk` | 赛博朋克 | 黑底、荧光、网格、等宽字 | 技术演示、未来主题 |

## 设计约束

- 正文与背景保持 WCAG AA 对比度（普通文字至少 4.5:1，大标题至少 3:1）。
- 高饱和色用于标题、链接、关键数字或 CTA；同一画面最多同时使用三种高饱和色。
- 深色 slide 仍由 `slide.theme` 的 `dark/paper/split` 控制，整体主题只替换 token。
- 新主题先在本文档补齐规范，再在 `src/themes.js` 添加同名 token；解析器无需修改。
- 不把个人姓名、头像、品牌、二维码或真实照片写进主题。

## 新增主题清单

1. 选择稳定的英文 ID，并写明目标、场景和禁止事项。
2. 补齐所有 token：`page-bg`、`bg`、`surface`、`ink`、`muted`、`faint`、`border`、`border-strong`、`title`、`link`、`accent`、`accent-2`、`dark`、字体、`radius`、`shadow`、`ease`、`duration`。
3. 在 `src/themes.js` 导出主题，并用 `resolveThemeId` 保持未知 ID 回退 `default`。
4. 添加一个 Markdown 示例并运行 `npm run import:markdown -- <file>`、`npm run validate`、`npm run build`。
