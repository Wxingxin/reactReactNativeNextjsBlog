下面给你一份在 React 中用 `useEffect` 做“数据获取”的常见写法大全（覆盖：加载/错误/取消、依赖变化、并发、串行、分页、搜索防抖、轮询、条件请求、Axios 拦截器等），并说明 **fetch vs axios** 的关键差异与选型建议。

---

## 1) 基础模板：loading / error / data（三件套）

### fetch 版本（带 AbortController 取消）

```jsx
import { useEffect, useState } from "react";

export default function Users() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users", { signal: controller.signal });
        // fetch：HTTP 4xx/5xx 不会自动 throw，需要自己判断
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        // 取消请求不当作错误
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, []);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error: {String(error.message || error)}</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### Axios 版本（推荐用 AbortController：Axios v1+ 支持 signal）

```jsx
import axios from "axios";
import { useEffect, useState } from "react";

export default function Users() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/users", { signal: controller.signal });
        setData(res.data);
      } catch (e) {
        // Axios：取消通常可用 axios.isCancel / 或检查 name/message（不同版本略有差异）
        if (e.name !== "CanceledError") setError(e);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, []);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error: {String(error.message || error)}</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## 2) 依赖变化重新拉取：根据 `userId` 请求

```jsx
useEffect(() => {
  if (!userId) return; // 条件请求
  const controller = new AbortController();

  (async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUser(await res.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    } finally {
      setLoading(false);
    }
  })();

  return () => controller.abort();
}, [userId]);
```

要点：**依赖项变化会触发重新执行 effect**；清理函数会在下一次执行前调用，用于取消上一轮请求。

---

## 3) 竞态条件处理：只保留“最后一次请求”的结果

即使你 abort 了，也建议加一个“版本号”防止极端情况（比如某些环境取消不及时）。

```jsx
useEffect(() => {
  let alive = true; // 或者 requestId 递增
  (async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (alive) setData(json);
  })();
  return () => { alive = false; };
}, [q]);
```

---

## 4) 并发请求（多个接口同时取）

### fetch：`Promise.all`

```jsx
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        fetch("/api/user", { signal: controller.signal }),
        fetch("/api/posts", { signal: controller.signal }),
      ]);
      if (!uRes.ok) throw new Error("user failed");
      if (!pRes.ok) throw new Error("posts failed");
      const [user, posts] = await Promise.all([uRes.json(), pRes.json()]);
      setUser(user);
      setPosts(posts);
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    } finally {
      setLoading(false);
    }
  })();
  return () => controller.abort();
}, []);
```

### Axios：`Promise.all`

```jsx
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get("/api/user", { signal: controller.signal }),
        axios.get("/api/posts", { signal: controller.signal }),
      ]);
      setUser(userRes.data);
      setPosts(postsRes.data);
    } catch (e) {
      if (e.name !== "CanceledError") setError(e);
    }
  })();
  return () => controller.abort();
}, []);
```

---

## 5) 串行请求（先 A 再 B，例如先拿 token/配置再请求列表）

```jsx
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const configRes = await fetch("/api/config", { signal: controller.signal });
      if (!configRes.ok) throw new Error("config failed");
      const config = await configRes.json();

      const listRes = await fetch(`/api/list?region=${config.region}`, { signal: controller.signal });
      if (!listRes.ok) throw new Error("list failed");
      setList(await listRes.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    }
  })();
  return () => controller.abort();
}, []);
```

---

## 6) 分页 / “加载更多”

```jsx
const [page, setPage] = useState(1);
const [items, setItems] = useState([]);

useEffect(() => {
  const controller = new AbortController();
  (async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?page=${page}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems((prev) => (page === 1 ? json : [...prev, ...json]));
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    } finally {
      setLoading(false);
    }
  })();
  return () => controller.abort();
}, [page]);
```

---

## 7) 搜索防抖（输入时不要每个字符都请求）

```jsx
useEffect(() => {
  if (!q) {
    setData([]);
    return;
  }

  const controller = new AbortController();
  const t = setTimeout(async () => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    }
  }, 300);

  return () => {
    clearTimeout(t);
    controller.abort();
  };
}, [q]);
```

---

## 8) 轮询（polling）/ 定时刷新

```jsx
useEffect(() => {
  let timerId;

  const controller = new AbortController();

  async function tick() {
    try {
      const res = await fetch("/api/status", { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus(await res.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    } finally {
      timerId = setTimeout(tick, 5000);
    }
  }

  tick();
  return () => {
    controller.abort();
    clearTimeout(timerId);
  };
}, []);
```

---

# fetch vs axios 有什么不同？

## 1) 错误处理语义不同（最关键）

* **fetch**：只有网络层失败才 `throw`，**HTTP 404/500 不会 throw**，你必须 `if (!res.ok) throw ...`
* **axios**：默认 **HTTP 非 2xx 会直接 throw**，更贴近“请求失败”的直觉

## 2) 默认解析与数据形态

* **fetch**：返回 `Response`，需要手动 `res.json()` / `res.text()`，并自己决定如何解析
* **axios**：返回 `{ data, status, headers, ... }`，`data` 默认已解析（常见 JSON 场景更省事）

## 3) 拦截器与实例化能力

* **axios**：`axios.create()` + 请求/响应拦截器，统一加 token、统一处理 401、统一错误提示，非常适合中大型项目
* **fetch**：没有内建拦截器；通常要自己封装 `fetcher()` 或用库（如 ky、wretch）来补齐

## 4) 超时（timeout）

* **axios**：支持 `timeout` 配置（到时会中断并报错）
* **fetch**：没有内建超时，通常配合 `AbortController` + `setTimeout` 自己实现

## 5) 取消请求

* 现在两者都推荐 **AbortController + signal**
* 旧 axios 还会看到 `CancelToken`（已不推荐）

## 6) 上传下载进度（onUploadProgress 等）

* **axios**：在浏览器侧更容易拿到上传/下载进度回调（实现更直接）
* **fetch**：下载进度可以用 streams 处理，但写法更复杂；上传进度更不直观

---

# 选型建议（实战）

* 小项目、简单 GET：**fetch 足够**（少依赖、标准 API）
* 中大型项目、需要统一鉴权/拦截器/超时/全局错误处理：**axios 更省心**
* 如果你之后要做“缓存、去重、重试、并发控制、自动刷新”：建议直接上 **React Query / SWR**（`useEffect` 只负责副作用不负责数据层架构）

---

如果你愿意，我可以把上面的 fetch/axios 进一步封装成一个可复用的 `useFetch` / `useAxios` Hook（含：缓存 key、取消、竞态、重试），更贴近你在 RN/React 项目里的真实写法。
