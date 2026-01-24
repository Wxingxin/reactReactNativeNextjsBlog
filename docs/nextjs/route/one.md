# 1）声明式导航：`<Link />`（首选）

## 1.1 基础跳转

```tsx
import Link from "next/link";

<Link href="/dashboard">去控制台</Link>;
```

## 1.2 动态路由

```tsx
<Link href={`/posts/${post.id}`}>{post.title}</Link>
```

## 1.3 带查询参数

```tsx
<Link href={{ pathname: "/search", query: { q: "next", page: "1" } }}>
  搜索 next
</Link>
```

## 1.4 控制滚动：`scroll={false}`

默认跳转会滚到顶部。想保留滚动位置（比如列表→弹窗/筛选）：

```tsx
<Link href="/photos/1" scroll={false}>
  打开
</Link>
```

## 1.5 预取（prefetch）

- Next 会对可见的 Link 自动预取（有条件）
- 你也可以手动：

```tsx
<Link href="/pricing" prefetch>
  Pricing
</Link>
```

> 实战建议：重要入口页可开启；大量列表项不建议强制 prefetch（可能浪费带宽）。

---

# 2）编程式导航：`useRouter()`（Client Component）

> 需要交互时用，比如按钮点击、提交成功后跳转。

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function Actions() {
  const router = useRouter();

  return (
    <>
      <button onClick={() => router.push("/dashboard")}>push</button>
      <button onClick={() => router.replace("/login")}>replace</button>
      <button onClick={() => router.back()}>back</button>
      <button onClick={() => router.forward()}>forward</button>
      <button onClick={() => router.refresh()}>refresh</button>
    </>
  );
}
```

## 2.1 `push` vs `replace` 怎么选？

- `push()`：保留历史记录（正常跳转）
- `replace()`：不保留历史（登录页跳首页、表单向导纠错页）

---

# 3）服务端导航：`redirect()`（Server Component / Route Handler / Server Action）

> 在服务端直接“终止渲染并重定向”，做鉴权最爽。

```tsx
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const isLogin = false;
  if (!isLogin) redirect("/login?from=/dashboard");

  return <div>Dashboard</div>;
}
```

✅ 适合：权限控制、根据数据状态跳转
⚠️ 注意：`redirect()` 会直接抛出一个内部跳转，不会继续往下执行代码。

---

# 4）404 导航：`notFound()`（Server）

```tsx
import { notFound } from "next/navigation";

export default async function Post({ params }: { params: { id: string } }) {
  const post = null; // 假设没查到
  if (!post) notFound();

  return <div>{params.id}</div>;
}
```

配合：

- `app/not-found.tsx`（全局 404）
- 或 `app/posts/not-found.tsx`（局部 404）

---

# 5）读取当前路由信息（用于高亮、面包屑、条件渲染）

这些都在 `next/navigation`，且通常需要 **Client Component**。

## 5.1 获取 pathname：`usePathname()`

```tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav>
      <Link
        href="/dashboard"
        aria-current={isActive("/dashboard") ? "page" : undefined}
      >
        Dashboard
      </Link>
    </nav>
  );
}
```

## 5.2 获取查询参数：`useSearchParams()`

```tsx
"use client";
import { useSearchParams } from "next/navigation";

export function Filters() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";

  return <div>当前关键词：{q}</div>;
}
```

> 注意：`useSearchParams()` 返回的是只读对象；想改参数要用 `router.push()` 拼 URL。

## 5.3 获取动态参数：`useParams()`

```tsx
"use client";
import { useParams } from "next/navigation";

export default function ClientPost() {
  const params = useParams<{ id: string }>();
  return <div>ID: {params.id}</div>;
}
```

---

# 6）改 URL 的查询参数（筛选/分页/排序的标配写法）

```tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function Pager() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setPage = (page: number) => {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(page));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return <button onClick={() => setPage(2)}>去第2页</button>;
}
```

✅ 这是最通用、最不容易踩坑的写法。

---

# 7）刷新与重新拉数据：`router.refresh()`

当你做了：

- Server Action 更新数据
- 或客户端发请求改了数据

你想让当前页面的 Server Components 重新拉取：

```tsx
router.refresh();
```

> 这跟 `window.location.reload()` 不同，它是 Next 的“软刷新”，更适合 App Router。

---

# 8）“登录后回到原页面”的导航范式（经典）

### 8.1 进入受保护页面（服务端）

```tsx
import { redirect } from "next/navigation";

export default async function Protected() {
  const isLogin = false;
  if (!isLogin) redirect("/login?from=/dashboard/settings");
  return <div>Settings</div>;
}
```

### 8.2 登录成功后（客户端）跳回

```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") ?? "/";

  const onSuccess = () => router.replace(from);

  return <button onClick={onSuccess}>登录成功</button>;
}
```

---

# 9）常见坑（你很可能会遇到）

1. **App Router 不用 `next/router`**，要用 `next/navigation`
2. `useRouter/usePathname/useSearchParams` 必须在 **Client Component**（文件顶部写 `"use client"`）
3. `redirect/notFound` 只能在 **Server 侧**（Server Component / Route Handler / Server Action）
4. `useSearchParams()` 只读；修改查询参数要 `router.push()`
5. `pathname.startsWith("/xxx")` 做 active 时注意 `/x` 和 `/xx` 的误判，最好用 `href + "/"` 逻辑（上面我给你了）

---

如果你告诉我你现在项目的导航形态（比如：**侧边栏 + 顶部 tabs + 面包屑 + 列表筛选分页** 还是 **移动端底部 tab**），我可以按你的 UI 结构直接给你一套“可复制”的导航组件（带 active 高亮、权限菜单、面包屑自动生成）。
