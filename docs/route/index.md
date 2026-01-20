

> 新版主推：`createBrowserRouter` + `RouterProvider`，并支持 **loader/actions/fetchers** 等 Data APIs。([React Router][1])

---

## 0) 安装与版本

```bash
npm i react-router-dom
```

（Data Router API 都在 `react-router-dom` 里）([React Router][1])

---

## 1) 新版最标准的入口写法（必背）

### 1.1 路由表 + RouterProvider

```tsx
// main.tsx / index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./routes/root-layout";
import Home from "./routes/home";
import User, { loader as userLoader } from "./routes/user";
import RootError from "./routes/root-error";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout, // 或 element: <RootLayout />
    ErrorBoundary: RootError, // 或 errorElement: <RootError />
    children: [
      { index: true, Component: Home },
      {
        path: "users/:id",
        Component: User,
        loader: userLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

要点：

- `createBrowserRouter` 是官方推荐的 Web Router，并启用 v6.4+ 数据能力（loaders/actions/fetchers 等）。([React Router][1])
- `ErrorBoundary/errorElement` 能捕获 **loader/action/组件渲染** 抛出的错误。([React Router][2])

---

## 2) 路由配置知识点大全（Route Object）

### 2.1 嵌套路由 + `<Outlet />`（v6 核心）

父路由做布局，子路由渲染在 `<Outlet />`：

```tsx
import { Outlet, NavLink } from "react-router-dom";

export default function RootLayout() {
  return (
    <div>
      <nav>
        <NavLink to="/">Home</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
```

### 2.2 `index: true`（默认子路由）

```js
children: [
  { index: true, Component: Home },
  { path: "about", Component: About },
];
```

### 2.3 动态参数 `:id`

- 路径：`users/:id`
- 组件里：`useParams()`

```tsx
import { useParams } from "react-router-dom";
const { id } = useParams(); // string | undefined
```

### 2.4 路由级懒加载（推荐）

新版支持路由对象上的 `lazy`（更贴合路由级代码分割）。在“Data APIs 只在 Data Router 可用”的列表中包含 `route.lazy`。([React Router][3])

---

## 3) Data Router 王牌：loader / action / Form（重点）

### 3.1 loader：在进入路由前取数

```tsx
// routes/user.tsx
import { useLoaderData } from "react-router-dom";

export async function loader({ params }: any) {
  const res = await fetch(`/api/users/${params.id}`);
  if (!res.ok) throw new Response("Not Found", { status: 404 });
  return res.json();
}

export default function User() {
  const user = useLoaderData() as any;
  return <div>{user.name}</div>;
}
```

loader 的概念与使用方式是 Data Router 的基础能力之一。([React Router][3])

### 3.2 action：处理表单提交（写操作）

用 `<Form method="post">` 自动走 action（不需要你手动 `preventDefault`）：

```tsx
// routes/user-edit.tsx
import { Form, redirect } from "react-router-dom";

export async function action({ request, params }: any) {
  const fd = await request.formData();
  await fetch(`/api/users/${params.id}`, {
    method: "PUT",
    body: fd,
  });
  return redirect(`/users/${params.id}`);
}

export default function UserEdit() {
  return (
    <Form method="post">
      <input name="name" />
      <button type="submit">Save</button>
    </Form>
  );
}
```

（上面 `redirect` 属于 Data Router 常见流程：写完后服务端/动作返回跳转）

---

## 4) `useFetcher`：不跳转也能提交/加载（局部交互神器）

适合：点赞、收藏、行内编辑、弹窗提交——**不改变 URL、不中断当前页面导航**。这是 Data APIs 的核心之一。([React Router][1])

```tsx
import { useFetcher } from "react-router-dom";

function LikeButton({ id }: { id: string }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action={`/posts/${id}/like`}>
      <button type="submit" disabled={fetcher.state !== "idle"}>
        {fetcher.state === "submitting" ? "Liking..." : "Like"}
      </button>
    </fetcher.Form>
  );
}
```

---

## 5) 错误处理（新版必须会）：errorElement / ErrorBoundary + useRouteError

当 loader/action/渲染抛错，会走路由的错误分支，并可用 `useRouteError()` 获取错误。([React Router][4])

```tsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function RootError() {
  const err = useRouteError();

  if (isRouteErrorResponse(err)) {
    return (
      <div>
        {err.status} - {err.statusText}
      </div>
    );
  }
  if (err instanceof Error) {
    return <div>{err.message}</div>;
  }
  return <div>Unknown error</div>;
}
```

---

## 6) 导航与链接（新版常用 API）

### 6.1 Link / NavLink

- `NavLink` 可根据 active 状态自动加 class（做导航高亮）

### 6.2 useNavigate（命令式跳转）

组件里需要“点按钮跳转”时用 `useNavigate()`。

> Data Router 风格里：很多跳转更推荐在 action/loader 里用 `redirect`（更一致的数据流）。

---

## 7) 加载中与过渡态（让体验更丝滑）

### 7.1 useNavigation：全局导航状态

做顶栏进度条、按钮禁用、骨架屏等。

### 7.2 延迟数据：`defer` + `<Await>`（配合 Suspense）

用于“关键内容先渲染，慢数据后到”：

- 官方有专门的 Deferred Data 指南。([React Router][5])

---

## 8) 滚动恢复（返回上一页不跳顶）

用 `<ScrollRestoration />` 做滚动位置恢复（特别适合列表页 -> 详情页 -> 返回列表）。这是 Data Router 常见配套能力（官方在如何实现上有对应指引/能力说明）。([React Router][6])

---

## 9) 鉴权/守卫（常用方案）

**推荐思路：在 loader 里做鉴权**（没权限就 `redirect("/login")`），这样用户进页面前就被拦下，更一致也更安全（不会先闪一下页面）。

```tsx
import { redirect } from "react-router-dom";

export async function loader() {
  const authed = await isLoggedIn();
  if (!authed) throw redirect("/login");
  return null;
}
```

---

## 10) 新版常见坑（超高频）

1. **用 Data API 但却用的是 `<BrowserRouter>` 模式**
   `loader/action/fetcher` 这类是 v6.4+ Data Router 专属，要用 `createBrowserRouter`。([React Router][3])

2. **loader 里抛错不知道怎么显示**
   配 `errorElement/ErrorBoundary`，错误页里用 `useRouteError()`。([React Router][4])

3. **写操作后刷新数据/回到列表**
   通常 action 里 `return redirect(...)`，并让目标路由的 loader 负责取最新数据（数据流更顺）。

4. **想“局部请求不跳转”却用了 navigate**
   该用 `useFetcher`（不改 URL、不触发导航）。([React Router][1])

---

如果你愿意，我可以按你项目直接给你一套“可运行模板”（Vite + TS），包含：

- 路由骨架（布局/404/错误边界）
- loader/action + fetcher 示例（CRUD）
- 鉴权守卫（loader redirect）
- 懒加载与分包
  你告诉我用 **Vite 还是 CRA**、是否 **需要 HashRouter（部署到静态站）** 就行。
