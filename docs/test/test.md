

# 四、Layout（App Router 的灵魂）

## 1️⃣ 全局 Layout

```txt
app/layout.tsx
```

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <header>Header</header>
        {children}
      </body>
    </html>
  )
}
```

---

## 2️⃣ 局部 Layout（路由嵌套）

```txt
app/dashboard/
  layout.tsx
  page.tsx
  settings/
    page.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside>侧边栏</aside>
      <main>{children}</main>
    </div>
  )
}
```

访问：

* `/dashboard`
* `/dashboard/settings`
  👉 **都会共享这个 Layout**

---

# 五、页面跳转（导航）

## 1️⃣ 声明式跳转 `<Link />`

```tsx
import Link from "next/link";

<Link href="/blog/123">去文章</Link>
```

---

## 2️⃣ 编程式跳转 `useRouter`（Client Component）

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function LoginBtn() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/login")}>
      登录
    </button>
  );
}
```

| 方法          | 作用   |
| ----------- | ---- |
| `push()`    | 跳转   |
| `replace()` | 不留历史 |
| `back()`    | 返回   |

---

# 六、获取 URL 参数 & 查询参数

## 1️⃣ 路径参数（Server Component）

```tsx
export default function Page({ params }) {
  console.log(params.id);
}
```

---

## 2️⃣ 查询参数 `?page=1`

### Server Component

```tsx
export default function Page({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  return <div>第 {searchParams.page} 页</div>;
}
```

### Client Component

```tsx
"use client";
import { useSearchParams } from "next/navigation";

const page = useSearchParams().get("page");
```

---


# 八、重定向 & 受保护路由

## 1️⃣ redirect（Server）

```tsx
import { redirect } from "next/navigation";

redirect("/login");
```

---

## 2️⃣ 经典：登录鉴权

```tsx
export default async function Dashboard() {
  const isLogin = false;

  if (!isLogin) {
    redirect("/login?from=/dashboard");
  }

  return <div>控制台</div>;
}
```

---

# 九、Route Handlers（API 路由）

```txt
app/api/posts/route.ts
```

```ts
export async function GET() {
  return Response.json({ list: [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json(body);
}
```

访问：

```
/api/posts
```

---

# 十、经典完整案例（强烈建议你消化）

## 📌 案例：博客系统路由设计

### 1️⃣ 路由结构

```txt
app/
  layout.tsx
  page.tsx                → 首页
  blog/
    page.tsx              → 文章列表
    [slug]/
      page.tsx            → 文章详情
      loading.tsx
  login/
    page.tsx
  dashboard/
    layout.tsx
    page.tsx              → 需登录
```

---

### 2️⃣ 博客列表 → 详情

```tsx
// app/blog/page.tsx
import Link from "next/link";

export default function BlogList() {
  const posts = [
    { slug: "next-router", title: "Next Router" },
  ];

  return posts.map(p => (
    <Link key={p.slug} href={`/blog/${p.slug}`}>
      {p.title}
    </Link>
  ));
}
```

```tsx
// app/blog/[slug]/page.tsx
export default function BlogDetail({ params }) {
  return <h1>{params.slug}</h1>;
}
```

---

### 3️⃣ 登录拦截

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";

export default function Dashboard() {
  const isLogin = false;
  if (!isLogin) redirect("/login");
  return <div>后台</div>;
}
```

