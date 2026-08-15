# AI 生成与填充提示词

把以下提示词复制给其他 AI，并附上你的素材与内容资料：

```text
你正在填充一个 Vibe PPT Web Template。

目标：根据我提供的主题、听众、事实和本地素材，生成一份演讲式 PPT 网页内容。

必须遵守：
1. 只修改 src/content.js 和 public/assets/。
2. 不修改既有 slide type，不新增路由，不改框架样式。
3. 如果使用 Markdown 输入，先在 frontmatter 写 `theme: default|apple|dopamine|cyberpunk`；未指定时使用 `default`，再运行 `npm run import:markdown -- <文件>`。
4. 没有真实素材时，继续使用 /placeholder.svg、/placeholder-avatar.svg 或 /placeholder-qr.svg。
5. 不写入未授权的个人信息、真实联系方式、账号密码、API Key、Cookie、Base64 图片或远程图片 URL。
6. 所有数据、数字和引用都必须来自我提供的资料；不确定的内容使用“待补充”而不是编造。
7. 保持 10–14 页的叙事节奏：封面 → 背景 → 案例 → 章节转场 → 方法 → 证据 → 例子 → 路线图 → 反馈 → 能力 → 结论 → 行动邀请。

输出：
- 直接修改 src/content.js。
- 为需要的图片列出文件名，并把它们放入 public/assets/。
- 完成后运行 npm run validate 和 npm run build。
- 最后用中文列出改了哪些字段、哪些内容仍是占位符。

我的资料：
- 主题：
- 听众：
- 希望听众记住的一句话：
- 背景事实：
- 案例与结果：
- 可公开的反馈：
- 下一步行动：
```
