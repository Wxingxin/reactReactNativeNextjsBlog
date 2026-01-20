下面给你一份「React 中 Suspense 的常见使用大全」，按你做项目最常遇到的场景来组织；每个场景都配**经典代码 + 关键注释 + 必踩坑**。示例以 React 18 为主。

---

## 0）Suspense 到底“挂起”什么

Suspense 的核心是：**当子树里有东西“还没准备好”时，先显示 fallback，等准备好再切回来**。

在 React 18 里，最稳定/常用的 Suspense 触发源主要是：

1. **代码分割（`React.lazy`）**：组件 JS 还没加载完会挂起
2. **支持 Suspense 的数据读取方式**：例如 Relay / React Router（data APIs）/ 自己的 resource 封装（注意：原生 `fetch` 直接用不会自动挂起）

---

## 1）最经典：`React.lazy + Suspense`（路由/页面级代码分割）

### 1.1 单个懒加载组件

```jsx
import React, { Suspense } from "react";

const SettingsPage = React.lazy(() => import("./SettingsPage"));

export default function App() {
  return (
    <div>
      <h1>App</h1>

      {/* 当 SettingsPage 的 JS chunk 还没下载好时，会显示 fallback */}
      <Suspense fallback={<div>Loading Settings...</div>}>
        <SettingsPage />
      </Suspense>
    </div>
  );
}
```

**要点**

* `fallback` 必须是一个 ReactNode（例如 Skeleton/Spinner/占位布局）。
* `React.lazy` 只能用于 **默认导出**（`export default`）。如果你是命名导出，看 1.2。

### 1.2 懒加载“命名导出”组件（常见坑）

```jsx
import React, { Suspense } from "react";

const UserCard = React.lazy(() =>
  import("./UserCard").then((m) => ({ default: m.UserCard }))
);

export default function App() {
  return (
    <Suspense fallback={<div>Loading UserCard...</div>}>
      <UserCard />
    </Suspense>
  );
}
```

---

## 2）路由级：Suspense 包裹 Routes（React Router 常见写法）

### 2.1 每个路由懒加载 + 路由层 fallback

```jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = React.lazy(() => import("./pages/Home"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      {/* 路由切换时，如果目标页 chunk 未加载，会显示这里的 fallback */}
      <Suspense fallback={<div style={{ padding: 16 }}>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**建议**

* 页面级 fallback 建议做成**“不抖动布局”的骨架屏**，避免跳动。

### 2.2 细粒度：不同路由不同 fallback（更贴近真实产品）

```jsx
<Route
  path="/profile"
  element={
    <Suspense fallback={<div>Loading Profile...</div>}>
      <Profile />
    </Suspense>
  }
/>
```

---

## 3）组件级：局部 Suspense（避免“全屏 Loading”）

当只有页面的一小块是懒加载/慢数据，推荐用**局部 Suspense**，保证页面其它部分正常渲染。

```jsx
import React, { Suspense } from "react";

const RightPanel = React.lazy(() => import("./RightPanel"));

export default function Dashboard() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
      <main>
        <h2>Dashboard</h2>
        <p>主内容可以先展示。</p>
      </main>

      <aside>
        {/* 右侧面板慢，就只让右侧显示 loading，不影响主内容 */}
        <Suspense fallback={<div>Loading panel...</div>}>
          <RightPanel />
        </Suspense>
      </aside>
    </div>
  );
}
```

---

## 4）多个懒加载：一个 Suspense 包多个 vs 分开包

### 4.1 一个包多个（一起加载，统一 fallback）

```jsx
<Suspense fallback={<div>Loading widgets...</div>}>
  <WidgetA />
  <WidgetB />
  <WidgetC />
</Suspense>
```

适合：三个都必须到齐才有意义，或 UX 允许统一 Loading。

### 4.2 分开包（谁先好谁先显示）

```jsx
<div style={{ display: "grid", gap: 8 }}>
  <Suspense fallback={<div>Loading A...</div>}>
    <WidgetA />
  </Suspense>

  <Suspense fallback={<div>Loading B...</div>}>
    <WidgetB />
  </Suspense>

  <Suspense fallback={<div>Loading C...</div>}>
    <WidgetC />
  </Suspense>
</div>
```

适合：组件独立、希望更快“渐进展示”。

---

## 5）`SuspenseList`（逐个/一起 reveal）——兼容性注意

`SuspenseList` 曾在实验阶段使用较多；在你的项目里如果 React 版本/生态支持，可以用于控制多个 Suspense 的展示顺序。若你发现类型/导入不可用，说明当前版本不建议依赖它。

示意（仅供理解）：

```jsx
// 伪示例：并非所有环境都建议使用
// <SuspenseList revealOrder="forwards">
//   <Suspense fallback="Loading A..."><A /></Suspense>
//   <Suspense fallback="Loading B..."><B /></Suspense>
// </SuspenseList>
```

---

## 6）数据请求 + Suspense：经典 “Resource” 封装（理解原理）

> 说明：**普通 `useEffect + fetch` 不会触发 Suspense**。Suspense 需要在 render 期间“抛出一个 Promise”。

下面给你一个教学用的 resource 封装（项目里建议用成熟方案：React Router data APIs / Relay / TanStack Query 的相关模式等）。

### 6.1 封装 `wrapPromise`

```jsx
function wrapPromise(promise) {
  let status = "pending";
  let result;

  const suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );

  return {
    read() {
      // 在 render 期间，如果还没好就抛 Promise -> Suspense 捕获并显示 fallback
      if (status === "pending") throw suspender;
      // 如果失败，抛错误 -> 需要 ErrorBoundary 来接
      if (status === "error") throw result;
      return result;
    },
  };
}
```

### 6.2 使用 resource + Suspense

```jsx
import React, { Suspense } from "react";

function fetchUser(id) {
  return fetch(`/api/users/${id}`).then((r) => {
    if (!r.ok) throw new Error("Failed to load user");
    return r.json();
  });
}

const userResource = wrapPromise(fetchUser(1));

function UserProfile() {
  // 这里会在 render 阶段 read()
  const user = userResource.read();
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

**关键点**

* 失败需要配合 Error Boundary（下一节）。
* 这套写法更像“理解 Suspense 数据流”用的，真实生产更建议用生态方案。

---

## 7）Suspense + ErrorBoundary（必须掌握）

Suspense 只管“等待”，不管“报错”。数据加载失败时要用 ErrorBoundary 接住。

### 7.1 最小 ErrorBoundary（类组件）

```jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 12, color: "crimson" }}>
          <p>Something went wrong.</p>
          <pre>{String(this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 7.2 组合使用

```jsx
import React, { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        {/* 这里的子组件可能会 throw Promise 或 throw Error */}
        <SomeAsyncThing />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 8）`startTransition` 配合 Suspense（减少“切换时闪白/卡顿”）

当你因输入/切换导致加载新页面或新模块时，用 transition 可以让 React 以更平滑的方式更新 UI。

```jsx
import React, { Suspense, useState, startTransition } from "react";

const SearchResult = React.lazy(() => import("./SearchResult"));

export default function SearchPage() {
  const [q, setQ] = useState("");

  function onChange(e) {
    const next = e.target.value;

    // 将可能触发加载/挂起的更新放入 transition
    startTransition(() => {
      setQ(next);
    });
  }

  return (
    <div>
      <input value={q} onChange={onChange} placeholder="Search..." />

      <Suspense fallback={<div>Loading results...</div>}>
        <SearchResult query={q} />
      </Suspense>
    </div>
  );
}
```

---

## 9）常见坑与最佳实践清单

1. **不要指望 `useEffect(fetch)` 触发 Suspense**：它发生在 commit 后，不会让 render “挂起”。
2. **Suspense 不是“请求管理库”**：更适合用于“可挂起”的数据层（Router/Relay/自定义 resource）。
3. **fallback 需要考虑布局稳定**：优先 skeleton，占位高度固定，避免 CLS。
4. **错误处理一定要有 ErrorBoundary**：否则会直接红屏或冒泡到更上层。
5. **边界放哪里很重要**：

   * 页面级：路由切换统一 loading
   * 局部：不影响其它区域的可用性
6. **预加载优化（可选）**：对高频页面可以在 hover/进入视口时提前 `import()`，减少实际挂起时间（需要你自己实现）。

---

如果你告诉我你现在项目属于哪一类：

* React Web（Vite / CRA / Next.js App Router）
* React Router（版本）
* 是否有数据层（React Query / SWR / 自己 fetch）

我可以把上面的示例改成你项目的“可直接落地版本”，并给一套推荐的 Suspense 边界拆分结构（页面级、布局级、组件级各放哪里最合适）。
