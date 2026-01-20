下面给你一份 **React 中 `Suspense` 的常见用法大全**，覆盖你在项目里最常遇到的场景，并且每个场景都给 **经典代码 + 关键注释**。我会按“你真的会用到的频率”来组织。

---

## 1) 最常见：配合 `React.lazy` 做路由/页面级懒加载

适用：**首屏加速**、减少 bundle、按路由分包。

```jsx
import React, { Suspense, lazy } from "react";

// ✅ 懒加载组件：只有真正渲染到时才会加载该 chunk
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

export default function App() {
  return (
    // ✅ Suspense 负责“等待 lazy 组件加载完成”的兜底 UI
    <Suspense fallback={<div>页面加载中...</div>}>
      {/* 这里通常放路由 */}
      <HomePage />
      {/* <ProfilePage /> */}
    </Suspense>
  );
}
```

要点：

* `lazy()` 返回的是“异步组件”，首次渲染会 **抛出一个 Promise**，由最近的 `Suspense` 接住并展示 `fallback`。
* `fallback` 建议放骨架屏（Skeleton）而不是纯文字。

---

## 2) 多层 `Suspense`：不同区域不同兜底（比一个全局兜底更好）

适用：页面分区加载（Header 快，Main 慢），避免“一处慢，全页都 loading”。

```jsx
import React, { Suspense, lazy } from "react";

const Header = lazy(() => import("./Header"));
const Main = lazy(() => import("./Main"));
const Sidebar = lazy(() => import("./Sidebar"));

export default function Page() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr" }}>
      {/* ✅ Sidebar 独立兜底 */}
      <Suspense fallback={<div>侧边栏加载中...</div>}>
        <Sidebar />
      </Suspense>

      <div>
        {/* ✅ Header 独立兜底 */}
        <Suspense fallback={<div>Header 加载中...</div>}>
          <Header />
        </Suspense>

        {/* ✅ Main 独立兜底 */}
        <Suspense fallback={<div>主内容加载中...</div>}>
          <Main />
        </Suspense>
      </div>
    </div>
  );
}
```

要点：

* `Suspense` 的边界（boundary）越贴近“慢的地方”越好。
* 这类结构在实际体验上明显优于全局一个 `Suspense`。

---

## 3) “细粒度切片”：列表里的每一项都可以懒加载

适用：某些卡片/模块很重（图表、富文本、地图），但列表很多条。

```jsx
import React, { Suspense, lazy } from "react";

const HeavyCard = lazy(() => import("./HeavyCard"));

export default function Feed({ items }) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it.id}>
          {/* ✅ 每个 item 自己的 loading，不影响其他 item */}
          <Suspense fallback={<div>卡片加载中...</div>}>
            <HeavyCard data={it} />
          </Suspense>
        </li>
      ))}
    </ul>
  );
}
```

要点：

* 边界越小，越能避免“一个慢组件拖垮全部”。
* 注意：边界太多也会让 UI 频繁闪动，可配合骨架屏与延迟策略（见后面第 7 点）。

---

## 4) 与错误边界（Error Boundary）配合：解决懒加载失败/网络错误

`Suspense` **只管等待**，不负责错误处理。模块加载失败（chunk 404 / 网络断开）要用 **Error Boundary** 来兜底。

```jsx
import React, { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("./Dashboard"));

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          加载失败，请重试
          <button onClick={() => location.reload()}>刷新</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* ✅ Suspense：等待 */}
      <Suspense fallback={<div>Dashboard 加载中...</div>}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}
```

要点：

* 推荐：**ErrorBoundary 包 Suspense**（更常见），统一处理懒加载错误。
* 生产环境可以做 chunk retry（失败后重试下载）——如你要我也可以给你一份常用实现。

---

## 5) 配合 `SuspenseList`：控制多个 Suspense 的“显示顺序”（实验特性）

适用：你有多个区域在并行加载，但希望按顺序“一个接一个出现”，减少跳动。

> 注意：`SuspenseList` 属于实验特性，是否可用取决于你的 React 版本与构建环境；如果报错就先别用它。

```jsx
import React, { Suspense, lazy } from "react";
// ⚠️ 实验特性：可能需要特定版本/构建才能用
import { SuspenseList } from "react";

const A = lazy(() => import("./A"));
const B = lazy(() => import("./B"));
const C = lazy(() => import("./C"));

export default function Page() {
  return (
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<div>A loading...</div>}>
        <A />
      </Suspense>

      <Suspense fallback={<div>B loading...</div>}>
        <B />
      </Suspense>

      <Suspense fallback={<div>C loading...</div>}>
        <C />
      </Suspense>
    </SuspenseList>
  );
}
```

参数要点：

* `revealOrder="forwards"`：按顺序展示（A 完成才展示 B）。
* `tail="collapsed"`：后面的 fallback 折叠，减少一堆 loading 同时出现。

---

## 6) React 18 的“数据获取 + Suspense”（框架/库层更常见）

现实结论：**纯 React（不借助框架/库）不推荐自己手写“Suspense 数据获取”**，因为模式复杂且需要缓存与一致性处理。实际工程里通常是：

* Next.js App Router（`loading.js`、Server Components）天然用 Suspense
* Relay / Apollo / React Query（实验/特定模式）等提供 Suspense 集成

不过你理解它的核心很重要：**组件在读数据时如果没准备好，会“抛 Promise”给 Suspense**。

下面用一个“最小可理解”示例（仅用于理解，不建议生产照抄）：

```jsx
import React, { Suspense } from "react";

// ✅ 简化版资源缓存（演示用）
const cache = new Map();

function fetchUser(id) {
  if (!cache.has(id)) {
    // 这里创建一个“资源记录”，内部保存状态
    const record = {
      status: "pending",
      value: null,
    };

    record.promise = fetch(`/api/user/${id}`)
      .then((r) => r.json())
      .then(
        (data) => {
          record.status = "fulfilled";
          record.value = data;
        },
        (err) => {
          record.status = "rejected";
          record.value = err;
        }
      );

    cache.set(id, record);
  }
  return cache.get(id);
}

function useUser(id) {
  const record = fetchUser(id);

  // ✅ 关键：没准备好就抛 promise -> Suspense 显示 fallback
  if (record.status === "pending") throw record.promise;

  // ✅ 有错误就抛 error -> ErrorBoundary 接住
  if (record.status === "rejected") throw record.value;

  return record.value;
}

function Profile({ id }) {
  const user = useUser(id);
  return <div>用户名：{user.name}</div>;
}

export default function App() {
  return (
    <Suspense fallback={<div>用户信息加载中...</div>}>
      <Profile id={1} />
    </Suspense>
  );
}
```

要点：

* 这就是“Suspense for data fetching”的核心机制：`throw promise`。
* 生产要有：缓存淘汰、并发一致性、错误重试、请求取消等，所以一般交给框架/库。

---

## 7) 避免“频繁闪 loading”：配合 `startTransition` 做平滑切换

适用：点击 tab/筛选导致组件切换，反复出现 fallback 闪烁。

```jsx
import React, { Suspense, lazy, useState, startTransition } from "react";

const TabA = lazy(() => import("./TabA"));
const TabB = lazy(() => import("./TabB"));

export default function Tabs() {
  const [tab, setTab] = useState("A");

  const switchTab = (next) => {
    // ✅ 低优先级更新：减少 UI 抖动，尽量保持已有内容
    startTransition(() => setTab(next));
  };

  return (
    <div>
      <button onClick={() => switchTab("A")}>Tab A</button>
      <button onClick={() => switchTab("B")}>Tab B</button>

      <Suspense fallback={<div>切换中...</div>}>
        {tab === "A" ? <TabA /> : <TabB />}
      </Suspense>
    </div>
  );
}
```

要点：

* `startTransition` 不会“消灭 fallback”，但能显著改善切换体验。
* 更进一步可以搭配 `useDeferredValue`、骨架屏策略等。

---

## 8) 预加载（Preload）：用户还没点之前就把 chunk 先拉下来

适用：你知道用户大概率会进入某页面（hover 菜单、进入某流程第二步），提前下载减少等待。

经典写法是把 import 提出来做“预加载函数”：

```jsx
import React, { Suspense, lazy, useState } from "react";

// ✅ 拿到 import 函数，既可给 lazy 用，也可手动调用做预加载
const loadSettings = () => import("./Settings");
const Settings = lazy(loadSettings);

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* ✅ hover 预加载：用户还没点就提前下载 */}
      <button onMouseEnter={() => loadSettings()} onClick={() => setOpen(true)}>
        打开设置
      </button>

      {open && (
        <Suspense fallback={<div>设置加载中...</div>}>
          <Settings />
        </Suspense>
      )}
    </div>
  );
}
```

要点：

* 预加载不是“必须”，但对重页面体验很有价值。
* 注意流量与带宽，移动端谨慎。

---

## 9) 你需要牢记的规则清单（高频踩坑）

1. **`Suspense` 只对“抛出 Promise 的子树”生效**

   * 典型：`React.lazy`、或框架/库的数据 Suspense。
2. **错误不归 Suspense 管**：必须用 Error Boundary。
3. **fallback 不一定全局最好**：多边界/小边界更符合真实体验。
4. **CSR 项目里**，最稳妥的就是：`lazy + Suspense + ErrorBoundary + 预加载（可选）`。
5. 如果你用 **Next.js App Router**：`loading.js`、`<Suspense>`、Server Components 的 Suspense 是主战场（与你的纯 CSR 模式略不同）。

---

如果你告诉我你现在的工程是：

* 纯 React（Vite/CRA）
* Next.js（App Router 还是 Pages Router）
* 还是 React Native（RN 本身的 Suspense 能力与生态不同）

我可以把上面代码“落地成你项目的标准目录结构 + 最佳实践模板”，例如：路由懒加载、chunk 加载失败重试、骨架屏组件库接入等。
