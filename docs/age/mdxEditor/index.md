下面以 **`@mdxeditor/editor`（通常简称 MDXEditor）** 为准，系统性说明它在 **React 项目中的使用方式、核心 API、常见配置与实战模式**。内容偏向“工程可落地”，而不是简单 Demo。

---

## 一、MDXEditor 是什么（先给你一个定位）

**MDXEditor** 是一个 **面向 MDX 的富文本编辑器**，核心特点：

* 输入 / 输出：**Markdown / MDX**
* 技术栈：React + ProseMirror
* 插件化架构（toolbar、list、image、code block、table 等）
* 非“所见即所得 HTML 编辑器”，而是 **结构化 Markdown 编辑器**

适合场景：

* 博客系统（Markdown / MDX）
* 文档系统
* 内容管理后台（Notion / GitBook 风格）

---

## 二、安装

```bash
npm install @mdxeditor/editor
```

或

```bash
pnpm add @mdxeditor/editor
```

---

## 三、最小可运行示例（你必须先跑起来）

### 1️⃣ 基础用法

```jsx
import { MDXEditor } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export default function Editor() {
  return (
    <MDXEditor
      markdown="# Hello MDXEditor"
      onChange={(value) => {
        console.log(value) // 输出 Markdown / MDX 字符串
      }}
    />
  )
}
```

📌 说明：

| 属性         | 作用             |
| ---------- | -------------- |
| `markdown` | 初始 Markdown 内容 |
| `onChange` | 内容变化时回调（字符串）   |

⚠️ **这是受控初始化，不是完全受控组件**

---

## 四、插件体系（这是 MDXEditor 的核心）

MDXEditor **几乎所有能力都来自插件**。

### 1️⃣ 常用插件一览

```js
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  codeBlockPlugin,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  BlockTypeSelect,
} from '@mdxeditor/editor'
```

---

### 2️⃣ 带 Toolbar 的标准编辑器（推荐模板）

```jsx
<MDXEditor
  markdown={content}
  onChange={setContent}
  plugins={[
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
    linkPlugin(),
    imagePlugin(),
    tablePlugin(),
    codeBlockPlugin(),
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BoldItalicUnderlineToggles />
          <CodeToggle />
          <BlockTypeSelect />
        </>
      )
    })
  ]}
/>
```

📌 你可以把这段当成 **企业项目默认配置**

---

## 五、受控 / 非受控模式（重点）

### ❌ 错误认知

> “MDXEditor 是完全受控组件”

❌ 不是。

### ✅ 正确认知

* `markdown`：**仅用于初始化**
* `onChange`：用于拿最新内容
* 如果你想“外部更新内容”，需要用 `key`

### 正确做法（切换文档）

```jsx
<MDXEditor
  key={docId}       // 强制重建编辑器
  markdown={value}
  onChange={setValue}
/>
```

📌 **这点非常重要，很多人会踩坑**

---

## 六、图片上传（真实项目必问）

### 1️⃣ 基础 imagePlugin

```js
imagePlugin({
  imageUploadHandler: async (file) => {
    // 上传到 OSS / S3 / Cloudflare
    const url = await upload(file)
    return url
  }
})
```

```jsx
plugins={[
  imagePlugin({
    imageUploadHandler: async (file) => {
      return 'https://example.com/image.png'
    }
  })
]}
```

📌 返回值：**图片 URL**

---

## 七、Code Block（技术博客必备）

```js
codeBlockPlugin({
  defaultCodeBlockLanguage: 'ts'
})
```

支持：

* ```js / ts / json / bash
  ```
* 输出标准 Markdown fenced code block

---

## 八、MDX 能力（而不仅是 Markdown）

MDXEditor **支持 MDX 语法**：

```mdx
<MyComponent title="Hello" />

export const foo = 1
```

但要注意：

* 编辑器**不负责渲染 React 组件**
* 它只负责编辑 & 输出 MDX 文本
* 渲染在你自己的 MDX runtime（next-mdx-remote / @mdx-js/react）

---

## 九、样式与布局控制

### 1️⃣ 必须引入样式

```js
import '@mdxeditor/editor/style.css'
```

### 2️⃣ 外层容器控制高度

```jsx
<div style={{ height: 500 }}>
  <MDXEditor className="h-full" />
</div>
```

📌 编辑器内部使用 flex，需要父容器高度

---

## 十、典型项目结构（建议）

```txt
components/
 └─ mdx/
    ├─ Editor.tsx
    ├─ editorPlugins.ts
    └─ uploadImage.ts
```

```ts
// editorPlugins.ts
export const defaultPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  markdownShortcutPlugin(),
]
```

---

## 十一、它适不适合你？（给你的判断）

你是 **前端工程师 + React / RN / Next.js 路线**，MDXEditor：

✅ 非常适合：

* 博客系统
* 文档系统
* 管理后台富文本

⚠️ 不适合：

* 表单型富文本（Word 风格）
* 高度自定义排版（营销页）

---

## 十二、和其他方案对比（快速）

| 编辑器       | 特点                         |
| --------- | -------------------------- |
| MDXEditor | **Markdown / MDX 优先，工程化强** |
| Slate     | 超自由，成本高                    |
| Quill     | HTML 为主，定制弱                |
| TipTap    | ProseMirror + HTML，强但复杂    |

---

## 十三、下一步你可以让我做的

如果你愿意，我可以直接帮你：

1. **封装一个企业级 `<MarkdownEditor />`**
2. **接入 Next.js + MDX 渲染**
3. **图片上传接 Cloudflare R2 / OSS**
4. **做一个博客编辑页完整 Demo**
5. **分析 MDXEditor vs TipTap 的架构差异**

你可以直接说：
👉「按博客系统给我一个完整方案」
