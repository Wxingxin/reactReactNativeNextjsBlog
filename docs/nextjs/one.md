下面这份 **Next.js 学习路线** 是基于你**已经具备 React 基础**来设计的，目标是：
**从“会用 React” → “能独立开发、部署 Next.js 全栈项目”**。
路线偏 **实战 + 原理**，避免只停留在“会写页面”。

---

# 一、学习前认知（非常重要）

在开始之前，你需要**先建立对 Next.js 的正确认知**：

### Next.js 本质解决了什么？

| React SPA 痛点 | Next.js 解决方案   |
| ------------ | -------------- |
| 首屏慢          | SSR / RSC      |
| SEO 差        | 服务端渲染          |
| 路由要自己配       | 文件路由           |
| API 要单独写后端   | 内置 API Route   |
| 部署复杂         | 官方一键部署（Vercel） |

> Next.js = **React + 路由 + 服务端能力 + 构建优化 + 部署方案**

---

# 二、阶段 0：必备前置知识（你大部分已经会）

如果你以下内容**都没问题，可以直接跳过**：

* React Hooks：`useState / useEffect / useContext / useRef`
* 组件通信：props / children
* 异步：`fetch / async await`
* ES Module：`import / export`
* 基本 TypeScript（强烈建议）

⚠️ Next.js **强烈建议使用 TS**，哪怕一开始写得慢。

---

# 三、阶段 1：Next.js 核心入门（App Router）

> 从 **Next.js 13+ App Router** 开始，不要学 Pages Router

### 1️⃣ 项目创建

```bash
npx create-next-app@latest
```

重点理解生成的结构：

```
app/
 ├─ layout.tsx        // 全局布局
 ├─ page.tsx          // 首页
 ├─ globals.css
 └─ api/              // 服务端 API
```

### 2️⃣ 文件路由系统（非常重要）

你要**彻底掌握**：

| 路由形式                          | 含义            |
| ----------------------------- | ------------- |
| `app/page.tsx`                | `/`           |
| `app/blog/page.tsx`           | `/blog`       |
| `app/blog/[id]/page.tsx`      | `/blog/123`   |
| `app/blog/[...slug]/page.tsx` | `/blog/a/b/c` |

⚠️ Next 路由 = **文件系统即路由**

---

### 3️⃣ Layout & Template

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

你要理解：

* layout **不会重新卸载**
* 用于：导航栏 / footer / 登录态

---

# 四、阶段 2：服务端组件（Next.js 的灵魂）

这是 **Next.js 和 React SPA 最大的区别**。

## 1️⃣ Server Component vs Client Component

### 默认是 Server Component

```tsx
export default function Page() {
  return <div>Server Component</div>;
}
```

### 使用客户端能力必须声明

```tsx
"use client";

export default function Counter() {
  const [count, setCount] = useState(0);
}
```

### 使用规则（必须背下来）

| 能力        | Server | Client |
| --------- | ------ | ------ |
| useState  | ❌      | ✅      |
| useEffect | ❌      | ✅      |
| fetch 数据  | ✅      | ⚠️     |
| 访问数据库     | ✅      | ❌      |
| 访问 window | ❌      | ✅      |

---

## 2️⃣ 数据获取（Next.js 的精华）

### 服务端获取数据

```ts
const res = await fetch("https://api.xxx.com/posts");
const data = await res.json();
```

### 缓存策略（必学）

```ts
fetch(url, { cache: "no-store" })      // 每次请求
fetch(url, { next: { revalidate: 60 } }) // ISR
```

你要理解：

* SSG
* SSR
* ISR

---

# 五、阶段 3：路由进阶能力

### 1️⃣ Link 与导航

```tsx
import Link from "next/link";

<Link href="/blog/1">详情</Link>
```

### 2️⃣ useRouter / usePathname

```ts
import { useRouter } from "next/navigation";
```

用途：

* 跳转
* 返回
* 获取参数

---

### 3️⃣ loading / error / not-found

```tsx
// app/blog/loading.tsx
export default function Loading() {}
```

```tsx
// app/blog/error.tsx
export default function Error() {}
```

这是 **Next 的路由级状态管理**，非常重要。

---

# 六、阶段 4：API Routes（轻量后端）

Next.js **可以直接当后端用**。

```ts
// app/api/posts/route.ts
export async function GET() {
  return Response.json({ data: [] });
}
```

支持：

* GET / POST / PUT / DELETE
* 可直接连接数据库
* 可作为 BFF（前端专用后端）

---

# 七、阶段 5：认证 & 中间件

### 1️⃣ Middleware

```ts
// middleware.ts
export function middleware(request) {
  // 登录校验
}
```

常见用途：

* 鉴权
* 重定向
* 国际化

---

### 2️⃣ 登录方案（推荐）

* NextAuth / Auth.js
* JWT
* Cookie / Session

---

# 八、阶段 6：样式方案

Next.js 常见样式组合：

| 方案                | 推荐指数  |
| ----------------- | ----- |
| CSS Module        | ⭐⭐⭐⭐⭐ |
| Tailwind          | ⭐⭐⭐⭐⭐ |
| styled-components | ⭐⭐⭐   |
| Ant Design        | ⭐⭐⭐   |

你作为前端，**强烈建议 Tailwind + CSS Module**

---

# 九、阶段 7：性能与 SEO

必须掌握：

* `<Metadata />`
* `generateMetadata`
* `next/image`
* `next/font`
* `Suspense + streaming`

```tsx
export const metadata = {
  title: "Blog",
};
```

---

# 十、阶段 8：部署（非常关键）

### 推荐部署方式

| 平台           | 说明     |
| ------------ | ------ |
| Vercel       | 官方、最省事 |
| Docker + VPS | 企业级    |
| Nginx + PM2  | 自建     |

你之前在学 **Docker + Nginx**，这一点会直接用上。

---

# 十一、实战项目路线（非常重要）

### 项目 1（入门）

* 博客系统
* 列表 / 详情 / SEO

### 项目 2（进阶）

* 登录注册
* RBAC 权限
* 后台管理系统

### 项目 3（偏全栈）

* 类 X 平台
* 发帖 / 评论 / 点赞
* 实时更新（可配 WebSocket）

---

# 十二、官方学习资源（强烈推荐）

* Next.js 官方文档（App Router）
* 官方 Learn 教程（一步步做）
* Vercel Blog（最佳实践）

---

## 总结一句话

> **React 是“前端 UI 思维”，Next.js 是“全栈 Web 架构思维”**

如果你愿意，下一步我可以帮你：

* 给你 **7 天 / 14 天 / 30 天学习计划**
* 从 **0 带你做一个完整 Next.js 项目**
* 或者帮你 **对比 Next.js vs SPA 项目架构**

你选一个，我直接继续。
