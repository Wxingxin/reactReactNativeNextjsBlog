
下面我给你一份**系统级、可落地的 Next.js Server / Client 使用用途大全**。
不是只讲“区别”，而是回答 **“在真实项目中，什么时候用 Server？什么时候必须用 Client？”**，并且**每一类用途都配经典代码**。

> 基于 **Next.js App Router（13+）**，默认你有 React 基础。

---

# 一、先给你一个“工程结论版”

在真实项目中，你可以记住一句话：

> **能用 Server 就用 Server，只有“必须交互”的地方才用 Client**

---

# 二、Server Component（服务端组件）使用用途大全

## 1️⃣ 页面级渲染（最常见、最重要）

### 使用场景

* 首页
* 列表页
* 详情页
* SEO 页面

### 为什么用 Server

* 首屏快
* SEO 友好
* 不进 JS bundle

### 经典代码

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  return (
    <ul>
      {posts.map(p => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

✔️ 不用 `useEffect`
✔️ 不用 loading state
✔️ 数据直接“渲染完成再下发”

---

## 2️⃣ 数据获取（数据库 / 后端直连）

### 使用场景

* 读数据库
* 调用内部服务
* 读取私有 API

### 为什么用 Server

* **数据库密码不会暴露**
* 延迟更低
* 架构更干净

### 经典代码

```tsx
// app/users/page.tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();

  return (
    <div>
      {users.map(u => (
        <p key={u.id}>{u.name}</p>
      ))}
    </div>
  );
}
```

⚠️ **Client 组件绝对不能做这件事**

---

## 3️⃣ SEO / Metadata 生成

### 使用场景

* 博客
* 商品页
* 动态 title / description

### 经典代码

```tsx
// app/blog/[id]/page.tsx
export async function generateMetadata({ params }) {
  const post = await fetchPost(params.id);

  return {
    title: post.title,
    description: post.summary,
  };
}
```

✔️ 只能在 Server
✔️ 搜索引擎直接读取

---

## 4️⃣ 页面结构与布局（Layout / Shell）

### 使用场景

* Header
* Footer
* Sidebar
* 页面骨架

### 经典代码

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

✔️ 不需要交互
✔️ 永远不重新卸载
✔️ 非常适合 Server

---

## 5️⃣ 权限判断 / 重定向（服务端安全）

### 使用场景

* 未登录不能访问
* 管理员页面

### 经典代码

```tsx
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return <div>Admin</div>;
}
```

✔️ 更安全
✔️ 用户根本拿不到页面代码

---

# 三、Client Component（客户端组件）使用用途大全

## 1️⃣ 交互逻辑（100% 必须 Client）

### 使用场景

* 点击
* 表单
* 弹窗
* 切换状态

### 经典代码

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

⚠️ 只要用：

* `useState`
* `useEffect`
* `onClick`

👉 **必须 Client**

---

## 2️⃣ 表单处理（登录 / 搜索 / 提交）

### 使用场景

* 登录注册
* 搜索框
* 评论输入

### 经典代码

```tsx
"use client";

export default function LoginForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/login", { method: "POST" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input />
      <button>Login</button>
    </form>
  );
}
```

---

## 3️⃣ 弹窗 / 抽屉 / Toast

### 使用场景

* Modal
* Drawer
* 提示反馈

```tsx
"use client";

export default function Modal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div>Modal Content</div>}
    </>
  );
}
```

---

## 4️⃣ 客户端状态管理

### 使用场景

* Zustand
* Redux
* Context

```tsx
"use client";

import { useStore } from "@/store/useStore";

export default function Cart() {
  const items = useStore(state => state.items);
  return <div>{items.length}</div>;
}
```

---

## 5️⃣ 浏览器 API

### 使用场景

* `window`
* `localStorage`
* `navigator`

```tsx
"use client";

useEffect(() => {
  const theme = localStorage.getItem("theme");
}, []);
```

⚠️ Server **完全不能访问**

---

# 四、Server + Client 混合使用（真实项目最常见）

## 推荐模式：**Server 包 Client**

### 示例：文章页 + 点赞按钮

```tsx
// Server Component
export default async function PostPage() {
  const post = await fetchPost();

  return (
    <>
      <h1>{post.title}</h1>
      <LikeButton />
    </>
  );
}
```

```tsx
// Client Component
"use client";

export function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "❤️" : "🤍"}
    </button>
  );
}
```

✔️ 页面仍然是 Server
✔️ 只有按钮进 JS

---

# 五、强制你记住的使用准则（面试 & 实战）

### 判断规则

> **这个组件需不需要交互？**

* ❌ 不需要 → Server
* ✅ 需要 → Client

### 工程级建议

* 页面：Server
* 布局：Server
* 表单：Client
* Button / Modal：Client
* 数据获取：Server
* 状态管理：Client

---

# 六、一张对照表（收藏级）

| 场景        | Server | Client |
| --------- | ------ | ------ |
| 页面渲染      | ✅      | ❌      |
| SEO       | ✅      | ❌      |
| 数据库       | ✅      | ❌      |
| useState  | ❌      | ✅      |
| useEffect | ❌      | ✅      |
| 点击事件      | ❌      | ✅      |
| 表单        | ❌      | ✅      |
| 布局        | ✅      | ❌      |
| 权限        | ✅      | ❌      |

---

## 下一步我可以继续帮你做的事

你现在非常适合继续这三步之一：

1️⃣ **给你一个完整 Next.js 项目结构图（Server / Client 如何拆）**
2️⃣ **用一个真实项目（博客 / 管理系统）把 Server / Client 全走一遍**
3️⃣ **面试向：Server / Client 常见陷阱 & 高频问题**

你选一个，我直接往下讲，不重复、不水。
