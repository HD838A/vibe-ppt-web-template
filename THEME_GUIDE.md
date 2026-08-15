# 主题与布局设计规范

主题不是配色皮肤，而是一套完整的演示设计系统。每套主题同时控制字体、颜色、留白、标题比例、图片框架、卡片结构、内容密度、对齐方式和动效节奏。`deck.theme` 决定整套设计系统；`slide.theme` 的 `dark/paper/split` 只表示单页明暗表面。

## 共同可读性要求

- 普通文字与背景对比度至少 4.5:1，大标题至少 3:1。
- 一页只保留一个主结论和一个主视觉焦点。
- 图片必须声明用途明确的比例、裁切和焦点；不能用随机尺寸填满剩余空间。
- 背景图上的文字必须保持可读，禁止把文字直接压在高噪声区域。
- 移动端优先保留标题与结论；装饰图可隐藏，但关键信息不能依赖图片。

## `default`：编辑纸张

- 目标：通用、清晰、快速起稿。
- 字体：Syne 标题、Inter/PingFang SC 正文、IBM Plex Mono 标签。
- 构图：72px 边距；规则网格；直角图片；卡片以细边框分隔。
- 图片：默认 `contain` 或 4:3；适合截图、流程图和项目画面。
- 动效：220ms，平滑减速。
- 禁止：过量圆角、装饰性渐变、没有信息作用的卡片。

## `apple`：Keynote 产品叙事

- 目标：用极少元素突出产品、观点或单一数字。
- 字体：SF Pro Display/Text/Mono fallback，中文使用 PingFang SC。
- 构图：84px 大留白；标题比例更大；正文行宽更窄；图片优先占据 55%–65% 画面。
- 图片：28px 圆角、轻阴影、低噪声背景；产品图优先 `contain`，摄影图优先 `cover`。
- 卡片：减少边框，使用安静的浅灰表面和层级留白。
- 章节与数字页：允许纯黑全屏，内容保持单一中心焦点。
- 动效：克制的 220ms 平滑减速。
- 禁止：贴纸感、粗重描边、密集网格、同时出现多个高饱和色。

## `dopamine`：高能创意提案

- 目标：鲜明、快乐、有记忆点，适合活动、社交内容和创意提案。
- 字体：Arial Rounded/Avenir Next fallback，粗重圆润标题。
- 构图：64px 边距；非对称图文；允许 2°–3° 轻微旋转；圆形和药丸形元素形成节奏。
- 图片：32px 圆角、4px 深色描边、贴纸式硬阴影。
- 卡片：粗描边、硬阴影；黄、粉、绿作为有限的交替表面。
- 动效：弹性 easing，但持续时间仍控制在 220ms。
- 禁止：单页超过三种高饱和主色、在小字号正文上使用低对比色、每个元素都旋转。

## `cyberpunk`：终端与信号

- 目标：技术、未来、夜间舞台感。
- 字体：Space Grotesk 标题、IBM Plex Mono 标签与数据。
- 构图：58px 边距；32px 技术网格；信息密度略高；标题左对齐；边框承担结构作用。
- 图片：直角、荧光细框、轻微增饱和与对比度；背景图适合 `full-bleed`。
- 卡片：深色表面、青色左侧信号线、洋红作为次强调。
- 动效：140ms 线性或短促切换。
- 禁止：大面积模糊发光、正文使用霓虹色、扫描线遮挡文字。

## Markdown 布局字段

| 字段 | 可选值 | 作用 |
| --- | --- | --- |
| `layout` | `auto`、`media-left`、`media-right`、`media-top`、`media-bottom`、`full-bleed`、`center` | 控制页面主要构图 |
| `image` | `/placeholder.svg` 或 `/assets/...` | 页面主图 |
| `imageRatio` | `auto`、`1:1`、`4:3`、`3:4`、`16:9`、`9:16` | 图片框比例 |
| `imageFit` | `cover`、`contain` | 裁切或完整展示 |
| `imagePosition` | `center`、`top`、`bottom`、`left`、`right` 及四个角 | 图片焦点位置 |
| `backgroundImage` | `/placeholder-background.svg` 或 `/assets/...` | 全页背景图 |
| `backgroundPosition` | 与 `imagePosition` 相同 | 背景图焦点位置 |

画廊条目格式：

```md
## items
- 标题 | 描述 | /assets/project.jpg | 16:9 | top | cover
```

## 新增主题流程

1. 先在本文档定义字体、颜色、留白、构图、图片、卡片、动效和禁止事项。
2. 在 `src/themes.js` 补齐颜色 token 与布局 token。
3. 在 `src/deck.css` 添加 `[data-theme="主题 ID"]` 下的结构规则，不能只覆盖颜色。
4. 添加包含图片字段的 Markdown 示例。
5. 分别检查封面、图文页、卡片页、章节页和移动端，再运行 `npm run validate` 与 `npm run build`。
