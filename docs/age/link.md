下面给你一份 **React Router（v6.4+ Data Router 风格）** 的完整示例，效果符合你描述的 Strapi 逻辑：

* 顶部 **Header + 导航栏** 始终显示
* 如果当前路由**有内容页面**（例如 `/docs`、`/plugins`、`/pricing`），则在下面显示“一大片内容区域”
* 如果是 **首页**（`/`）或 **空链接页面**（`/empty`，表示没有内容），则下面的大区域 **不显示**

我会给出可直接复制的项目结构与代码（含注释）。

---

## 1）目录结构

```
src/
  main.jsx
  router.jsx
  styles.css
  layouts/
    RootLayout.jsx
  pages/
    Home.jsx
    Docs.jsx
    Plugins.jsx
    Pricing.jsx
    Empty.jsx
    NotFound.jsx
```

---

## 2）main.jsx（入口）

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## 3）router.jsx（路由配置：关键是 handle 控制“是否显示大区域”）

```jsx
// src/router.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Plugins from "./pages/Plugins";
import Pricing from "./pages/Pricing";
import Empty from "./pages/Empty";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />, // 路由错误兜底
    children: [
      {
        index: true,
        element: <Home />,
        // 首页：不显示下方大区域
        handle: { showContentArea: false, title: "Home" },
      },
      {
        path: "docs",
        element: <Docs />,
        // 有内容页面：显示下方大区域
        handle: { showContentArea: true, title: "Docs" },
      },
      {
        path: "plugins",
        element: <Plugins />,
        handle: { showContentArea: true, title: "Plugins" },
      },
      {
        path: "pricing",
        element: <Pricing />,
        handle: { showContentArea: true, title: "Pricing" },
      },
      {
        path: "empty",
        element: <Empty />,
        // 空链接：明确不显示大区域（你说“没有链接其他内容就不显示”）
        handle: { showContentArea: false, title: "Empty" },
      },
      {
        path: "*",
        element: <NotFound />,
        handle: { showContentArea: false, title: "Not Found" },
      },
    ],
  },
]);
```

---

## 4）RootLayout.jsx（布局：Header 永远在；内容区域按路由开关显示）

关键点：用 `useMatches()` 拿到当前命中的路由链，从最后一个 match 读取 `handle.showContentArea` 决定是否渲染那块“大区域”。

```jsx
// src/layouts/RootLayout.jsx
import React from "react";
import { NavLink, Outlet, useMatches } from "react-router-dom";

export default function RootLayout() {
  const matches = useMatches();

  // 当前命中的最后一个路由（最具体的那一层）
  const current = matches[matches.length - 1];

  // 约定：在 router.jsx 里用 handle.showContentArea 控制
  const showContentArea = Boolean(current?.handle?.showContentArea);

  // 可选：用于显示标题
  const title = current?.handle?.title ?? "";

  return (
    <>
      {/* 顶部导航永远显示 */}
      <header className="header">
        <div className="headerInner">
          <NavLink to="/" className="logo" aria-label="Go Home">
            <span className="logoBadge" aria-hidden="true" />
            <span className="logoTitle">My Strapi-like</span>
          </NavLink>

          <nav className="nav">
            {/* NavLink 会自动给 active 状态，便于高亮 */}
            <NavLink to="/" end className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              首页
            </NavLink>

            <NavLink to="/docs" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Docs
            </NavLink>

            <NavLink to="/plugins" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Plugins
            </NavLink>

            {/* 这个就是你说的“没有链接其他内容就不显示” */}
            <NavLink to="/empty" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              空链接
            </NavLink>

            <NavLink to="/pricing" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Pricing
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="shell">
        {/* 上面部分：类似 Strapi 首页顶部展示区，始终显示 */}
        <section className="hero">
          <h1>React Router：导航控制下方内容区显示/隐藏</h1>
          <p>
            行为：点击导航。如果路由标记为有内容页面，则显示下方“大区域”；如果是首页或空链接，则隐藏大区域。
          </p>
        </section>

        {/* 下方“大区域”：只在 showContentArea = true 时渲染 */}
        {showContentArea ? (
          <section className="contentArea" aria-live="polite">
            <div className="contentHeader">
              <div className="contentTitle">{title}</div>
              <div className="contentMeta">Route: {current?.pathname ?? ""}</div>
            </div>

            {/* 真正的页面内容渲染在 Outlet */}
            <div className="contentBody">
              <Outlet />
            </div>
          </section>
        ) : (
          // 不显示大区域时仍要渲染 Outlet（因为 Home/Empty 页面要显示）
          // 但 Home/Empty 页面本身可以是空或只显示很少内容
          <Outlet />
        )}
      </main>
    </>
  );
}
```

---

## 5）页面组件（示例内容）

### Home.jsx（首页：不显示大区域）

```jsx
// src/pages/Home.jsx
import React from "react";

export default function Home() {
  return (
    <section className="homeHint">
      <div className="homeCard">
        <h2>首页</h2>
        <p>这里模拟 Strapi 首页：只有顶部展示与导航；下面的大内容区域不显示。</p>
        <p>点击 Docs / Plugins / Pricing 会出现下面那块“大区域”。</p>
      </div>
    </section>
  );
}
```

### Empty.jsx（空链接：不显示大区域；也可以完全返回 null）

```jsx
// src/pages/Empty.jsx
import React from "react";

export default function Empty() {
  // 你也可以 return null; 代表真的什么都不显示
  return (
    <section className="homeHint">
      <div className="homeCard">
        <h2>空链接</h2>
        <p>这个路由故意不显示下方大区域，用来模拟“没有链接其他内容就不显示”。</p>
      </div>
    </section>
  );
}
```

### Docs.jsx / Plugins.jsx / Pricing.jsx（有内容：显示在大区域里）

```jsx
// src/pages/Docs.jsx
import React from "react";

export default function Docs() {
  return (
    <div className="cards">
      <div className="card">
        <h3>快速开始</h3>
        <p>安装、创建项目、开发模式运行。</p>
      </div>
      <div className="card">
        <h3>内容类型</h3>
        <p>Collection Type / Single Type 的建模思路。</p>
      </div>
      <div className="card">
        <h3>权限与角色</h3>
        <p>RBAC、Public/Authenticated 权限策略。</p>
      </div>
    </div>
  );
}
```

```jsx
// src/pages/Plugins.jsx
import React from "react";

export default function Plugins() {
  return (
    <div className="cards">
      <div className="card">
        <h3>Upload</h3>
        <p>文件上传与媒体库管理。</p>
      </div>
      <div className="card">
        <h3>i18n</h3>
        <p>多语言内容管理与本地化。</p>
      </div>
      <div className="card">
        <h3>GraphQL</h3>
        <p>以 GraphQL 的方式对外暴露 API。</p>
      </div>
    </div>
  );
}
```

```jsx
// src/pages/Pricing.jsx
import React from "react";

export default function Pricing() {
  return (
    <div className="cards">
      <div className="card">
        <h3>Community</h3>
        <p>适合个人与学习项目，基础能力可用。</p>
      </div>
      <div className="card">
        <h3>Pro</h3>
        <p>适合团队协作，包含更多管理能力。</p>
      </div>
      <div className="card">
        <h3>Enterprise</h3>
        <p>适合大型组织，提供更强治理与支持。</p>
      </div>
    </div>
  );
}
```

### NotFound.jsx

```jsx
// src/pages/NotFound.jsx
import React from "react";
import { Link, useRouteError } from "react-router-dom";

export default function NotFound() {
  const err = useRouteError();

  return (
    <section className="homeHint">
      <div className="homeCard">
        <h2>页面不存在 / 路由错误</h2>
        <p style={{ opacity: 0.8 }}>
          {err?.status ? `HTTP ${err.status}` : "Unknown error"}
        </p>
        <Link to="/">返回首页</Link>
      </div>
    </section>
  );
}
```

---

## 6）styles.css（Strapi-like 的视觉骨架）

```css
/* src/styles.css */
:root {
  --bg: #0b1020;
  --panel: rgba(255, 255, 255, 0.06);
  --panel2: rgba(255, 255, 255, 0.08);
  --text: rgba(255, 255, 255, 0.92);
  --muted: rgba(255, 255, 255, 0.72);
  --line: rgba(255, 255, 255, 0.12);
  --brand: #7c3aed;
  --radius: 14px;
  --max: 1100px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--text);
  background: radial-gradient(1200px 700px at 15% 10%, rgba(124, 58, 237, 0.28), transparent 55%),
    radial-gradient(900px 600px at 85% 25%, rgba(59, 130, 246, 0.22), transparent 50%),
    var(--bg);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(11, 16, 32, 0.55);
  border-bottom: 1px solid var(--line);
}

.headerInner {
  max-width: var(--max);
  margin: 0 auto;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
}

.logoBadge {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--brand), #3b82f6);
}

.logoTitle {
  font-weight: 700;
  letter-spacing: 0.2px;
}

.nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.navItem {
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--muted);
  transition: 0.15s ease;
}

.navItem:hover {
  background: var(--panel);
  border-color: var(--line);
  color: var(--text);
}

.navItem.active {
  background: rgba(124, 58, 237, 0.18);
  border-color: rgba(124, 58, 237, 0.35);
  color: var(--text);
}

/* Page shell */
.shell {
  max-width: var(--max);
  margin: 0 auto;
  padding: 22px 18px 60px;
}

.hero {
  margin-top: 16px;
  padding: 22px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.04));
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.hero p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

/* Conditional content area */
.contentArea {
  margin-top: 18px;
  padding: 18px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--panel2);
  min-height: 360px;
}

.contentHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 14px;
}

.contentTitle {
  font-size: 18px;
  font-weight: 700;
}

.contentMeta {
  color: var(--muted);
  font-size: 13px;
}

.contentBody {
  margin-top: 6px;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
}

.card h3 {
  margin: 0 0 6px;
  font-size: 15px;
}

.card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
  font-size: 13px;
}

/* Home/Empty small area */
.homeHint {
  margin-top: 18px;
}

.homeCard {
  padding: 18px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
}

.homeCard h2 {
  margin: 0 0 10px;
}

.homeCard p {
  margin: 0 0 8px;
  color: var(--muted);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
```

---

## 7）你可以如何扩展成“更像官网”的版本

1. **空链接不跳转**：如果你希望“空链接点击完全不变”，可以把它做成 `<button>` 并阻止导航（但你现在需求是“没内容就不显示”，路由到 `/empty` 也可）。
2. **多级导航**：比如 `/docs/getting-started`，只要这些子路由 `handle.showContentArea: true`，大区域就一直显示。
3. **异步加载页面**：用 `lazy()` + `Suspense`，页面切换更接近真实官网。

---

如果你告诉我你用的是 **Vite** 还是 **CRA**，我可以把这套代码按你的脚手架方式给出“可直接粘贴运行”的版本（包括 package.json 需要的依赖版本与启动命令）。
