下面以 **Next.js 13+（App Router）** 为背景，系统性说明 **服务器组件（Server Components）** 与 **客户端组件（Client Components）** 的**区别、工作机制与典型使用方式**。这是理解 Next.js 现代架构的核心。

---

## 一、核心结论先行（你先记住这几条）

1. **默认是服务器组件**
2. **是否能用浏览器能力，是区分标准**
3. **服务器组件 = 数据获取 + 组合 UI**
4. **客户端组件 = 交互 + 状态 + 副作用**
5. **服务器组件可以包客户端组件，反之不行**

---

## 二、服务器组件（Server Component）

### 1️⃣ 什么是服务器组件

服务器组件 **只在服务器上执行**，**不会被打包进浏览器 JS**。

```tsx
// app/page.tsx
export default async function Page() {
  const data = await fetch("https://api.xxx.com/posts").then(res => res.json());

  return <div>{data.title}</div>;
}
```

**特点：**

* 不发送 JS 到浏览器
* 不能访问 `window / document`
* 不能用 `useState / useEffect`
* 可以直接访问数据库、私有 API

---

### 2️⃣ 服务器组件的工作方式（非常重要）

**请求流程：**

```
浏览器请求页面
   ↓
Next.js 服务器执行 Server Component
   ↓
直接获取数据（DB / API）
   ↓
生成 HTML + RSC Payload
   ↓
发送给浏览器
```

浏览器拿到的是：

* HTML（用于首屏展示）
* RSC（React Server Component 描述，不是 JS 逻辑）

✅ **更快的首屏**
✅ **更小的 JS 体积**
✅ **更安全（密钥不出服务器）**

---

### 3️⃣ 服务器组件能做什么

| 能力         | 是否支持 |
| ---------- | ---- |
| 直接访问数据库    | ✅    |
| 使用 `fetch` | ✅    |
| 访问环境变量     | ✅    |
| SEO        | ✅    |
| 使用 Hooks   | ❌    |
| 监听事件       | ❌    |

---

### 4️⃣ 服务器组件的典型使用场景

* 页面级组件（`page.tsx` / `layout.tsx`）
* 数据聚合层
* SEO 页面
* 后台管理页面首屏
* 内容型页面（博客 / 商品详情）

---

## 三、客户端组件（Client Component）

### 1️⃣ 什么是客户端组件

客户端组件 **会被打包成 JS 发送到浏览器执行**。

必须显式声明：

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

### 2️⃣ 客户端组件的工作方式

```
服务器返回 HTML（静态）
   ↓
浏览器加载 JS Bundle
   ↓
React Hydration
   ↓
事件绑定 / 状态生效
```

**关键点：**

* HTML 先展示
* JS 后加载
* Hydration 后才可交互

---

### 3️⃣ 客户端组件能做什么

| 能力                   | 是否支持 |
| -------------------- | ---- |
| useState / useEffect | ✅    |
| onClick / onChange   | ✅    |
| window / document    | ✅    |
| localStorage         | ✅    |
| 直接访问数据库              | ❌    |
| 私有环境变量               | ❌    |

---

### 4️⃣ 客户端组件的典型使用场景

* 表单
* 弹窗 / Drawer
* 下拉菜单
* 搜索输入
* 图表 / 动画
* React Hook Form / Zustand / Redux

---

## 四、`"use client"` 的真实含义（重点）

```tsx
"use client";
```

**不是“在客户端运行”这么简单**，而是：

> **该文件及其所有子组件都会被视为客户端组件**

这意味着：

```tsx
"use client";

import ServerComponent from "./ServerComponent"; ❌ 不允许
```

但反过来是允许的：

```tsx
// Server Component
import ClientComponent from "./ClientComponent"; ✅
```

---

## 五、服务器组件 vs 客户端组件 对比表

| 维度    | 服务器组件   | 客户端组件  |
| ----- | ------- | ------ |
| 执行环境  | Node.js | 浏览器    |
| 默认行为  | ✅ 默认    | ❌ 需声明  |
| JS 体积 | ❌ 不发送   | ✅ 发送   |
| 数据获取  | ✅ 直接    | ⚠️ 间接  |
| 状态管理  | ❌       | ✅      |
| 事件处理  | ❌       | ✅      |
| SEO   | 极强      | 依赖 SSR |
| 安全性   | 高       | 低      |

---

## 六、两者如何配合（真实项目模式）

### 1️⃣ 正确的分层模式（推荐）

```tsx
// Server Component
export default async function Page() {
  const posts = await getPosts();

  return (
    <>
      <PostList posts={posts} />
      <CreatePostForm /> {/* 客户端 */}
    </>
  );
}
```

```tsx
// CreatePostForm.tsx
"use client";

export default function CreatePostForm() {
  return <form>...</form>;
}
```

**思想：**

* **Server：数据 & 结构**
* **Client：交互 & 状态**

---

### 2️⃣ 与 React Query / Redux 的关系

| 技术              | 使用位置  |
| --------------- | ----- |
| React Query     | 客户端组件 |
| Redux / Zustand | 客户端组件 |
| Prisma          | 服务器组件 |
| Server Actions  | 服务器组件 |

---

## 七、Server Actions（补充：现代交互方式）

```tsx
// Server
export async function createPost(formData: FormData) {
  "use server";
  // 写数据库
}
```

```tsx
// Client
<form action={createPost}>
```

**意义：**

* 客户端无需 API
* 自动序列化
* 安全
* 替代 70% CRUD API

---

## 八、你在学习路线中的理解建议（给你一点“学习策略”）

> **不要纠结“我这是 server 还是 client”**

记住一句话就够：

> **只要需要交互，就下沉到客户端**
> **其余全部放服务器**

---

如果你愿意，我可以下一步直接帮你画一份：

* **Next.js App Router 组件分层图**
* **一个完整的「列表 + 表单」最佳实践示例**
* **和 React 传统 CSR/SSR 的本质对比**

你想从哪一个继续？
