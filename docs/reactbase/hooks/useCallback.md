下面给你一份「项目里真正常用」的 `useCallback` 使用大全：**何时用、为什么用、怎么写**，并配上**经典案例 + 可直接复制的代码 + 注释**。示例以 React 18 + Hooks 为主。

---

## 0）`useCallback` 的一句话定位

`useCallback(fn, deps)` 用来**缓存函数引用**，让同一个函数在依赖不变时**不重新创建**，从而：

* 配合 `React.memo` / `useMemo` **减少子组件无意义渲染**
* 保证 `useEffect` / `useSubscription` / `addEventListener` 等场景里**依赖稳定**
* 在并发/频繁渲染场景里减少不必要的回调重建（次要）

> 重点：`useCallback` 不会“让函数执行更快”，它主要解决“引用变化导致的渲染/订阅重复”的问题。

---

## 1）最经典：`React.memo` 子组件 + 父组件回调（避免子组件重复渲染）

### 场景

父组件每次渲染都会新建 `onAdd` 函数，导致 `memo` 子组件认为 props 变了而重渲染。

```jsx
import React, { useCallback, useState, memo } from "react";

const AddButton = memo(function AddButton({ onAdd }) {
  console.log("AddButton render");
  return <button onClick={onAdd}>Add</button>;
});

export default function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // ✅ useCallback 缓存函数引用，count 变化不会导致 onAdd 引用变化
  const onAdd = useCallback(() => {
    setItems((prev) => [...prev, { id: Date.now(), name: "new item" }]);
  }, []); // 依赖为空：因为函数内部只用到 setItems（稳定）和 Date.now（非 state）

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Inc count</button>

      {/* ✅ AddButton 不会因为 count 改变而无意义重渲染 */}
      <AddButton onAdd={onAdd} />

      <ul>
        {items.map((it) => (
          <li key={it.id}>{it.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**项目要点**

* 如果子组件用了 `React.memo`，并且你把函数 props 传给子组件，`useCallback` 非常常见。
* 反过来：**子组件没 memo**，你用 `useCallback` 多半没收益（还增加复杂度）。

---

## 2）列表项组件（大量 item）+ 点击/删除/编辑回调（性能高频点）

### 场景

列表很长，每次父组件 state 更新会导致每个 item 的 `onDelete` 都是新函数 → memo item 失效。

```jsx
import React, { memo, useCallback, useState } from "react";

const TodoItem = memo(function TodoItem({ todo, onDelete }) {
  console.log("TodoItem render:", todo.id);
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

export default function Todos() {
  const [todos, setTodos] = useState([
    { id: 1, text: "learn react" },
    { id: 2, text: "learn hooks" },
  ]);
  const [filter, setFilter] = useState("");

  // ✅ 缓存删除函数引用
  const onDelete = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const visible = todos.filter((t) => t.text.includes(filter));

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="filter"
      />
      <ul>
        {visible.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}
```

**要点**

* `onDelete` 内部用 `setTodos(prev => ...)`，这样就**不需要把 todos 放进 deps**，回调更稳定。
* 大列表 + memo item 时，这个优化收益很明显。

---

## 3）`useEffect` 依赖函数：避免“依赖抖动”导致重复请求/重复订阅

### 场景

你把 `fetchData` 写在组件里，再在 `useEffect` 里用它，eslint 会要求把 `fetchData` 放依赖，导致每次渲染都变 → effect 重跑。

```jsx
import React, { useCallback, useEffect, useState } from "react";

export default function UserProfile({ userId }) {
  const [data, setData] = useState(null);

  // ✅ 用 useCallback 把 fetch 函数稳定下来
  const fetchUser = useCallback(async () => {
    const res = await fetch(`/api/users/${userId}`);
    const json = await res.json();
    setData(json);
  }, [userId]); // userId 变化时才需要更新

  useEffect(() => {
    fetchUser(); // ✅ 依赖稳定，不会重复触发
  }, [fetchUser]);

  if (!data) return <p>Loading...</p>;
  return <div>{data.name}</div>;
}
```

**项目要点**

* “函数作为依赖”是 `useCallback` 最常见的真实理由之一。
* 也可以把函数直接写进 effect 内部，但有时你需要复用这个函数（按钮点击也调用），此时 `useCallback` 很自然。

---

## 4）事件监听 `addEventListener`：确保解绑的是同一个函数

### 场景

`removeEventListener` 必须传入**同一个函数引用**，否则解绑失败。

```jsx
import React, { useCallback, useEffect, useState } from "react";

export default function ResizeWatcher() {
  const [w, setW] = useState(window.innerWidth);

  // ✅ 处理函数稳定，解绑可靠
  const onResize = useCallback(() => {
    setW(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  return <div>width: {w}</div>;
}
```

---

## 5）把“业务动作”封装成稳定回调：表单提交 / 保存 / 取消

### 场景

表单组件把 `onSubmit` 传给多个子组件（提交按钮、快捷键监听、离开页面提示），希望引用稳定。

```jsx
import React, { useCallback, useState } from "react";

export default function EditProfile() {
  const [name, setName] = useState("");

  const onSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      // ✅ 依赖里需要 name：因为提交就是要用当前 name
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      alert("saved");
    },
    [name]
  );

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
```

**注意**

* 这里 `deps` 必须包含 `name`，否则提交会拿到旧值（闭包问题）。

---

## 6）典型坑：依赖写错导致“闭包旧值”

### 错误示例（常见）

```jsx
const [count, setCount] = useState(0);

// ❌ deps 为空，但内部使用了 count：会永远拿到初始 count
const inc = useCallback(() => {
  setCount(count + 1);
}, []);
```

### 正确写法 1：把依赖补齐

```jsx
const inc = useCallback(() => {
  setCount(count + 1);
}, [count]);
```

### 正确写法 2（更推荐）：函数式更新，deps 可为空

```jsx
const inc = useCallback(() => {
  setCount((c) => c + 1);
}, []);
```

---

## 7）什么时候“不该用” `useCallback`（项目里很重要）

### 不建议滥用的情况

* 组件很小、渲染不频繁
* 回调没有传给 `memo` 子组件
* 没有作为 `useEffect`/订阅/事件监听的依赖
* 你为了“看起来更优化”到处 useCallback

**原因**

* `useCallback` 本身也有维护成本（依赖管理、阅读难度）
* React 渲染性能瓶颈多数不在函数创建，而在子树渲染与计算

---

## 8）快速决策表（你写项目时可直接套）

需要用 `useCallback` 的高概率场景：

* 回调 props 传给 `React.memo` 子组件
* 回调用于 `useEffect` 依赖（请求、订阅、监听）
* `addEventListener/removeEventListener`、第三方订阅要求稳定回调
* 大列表 item 回调（删除/编辑/选择）

不太需要的场景：

* 只是给 DOM `onClick` 用，且组件不大
* 没有 memo、没有依赖、没有订阅

---

如果你愿意，我可以把上面这些案例进一步“工程化”，给你一套**可直接复制进项目的 hooks 工具包**，例如：

* `useEvent`（稳定回调但总拿最新 state）
* `useDebouncedCallback`（输入框防抖）
* `useThrottleCallback`（滚动/resize 节流）
* `useStableCallback`（避免闭包旧值）

你告诉我你主要做 Web React 还是 React Native，我就按你的项目栈给你写。
