下面系统性地整理 **React 中 `useRef` 的常见使用方式、核心知识点、典型场景与对比说明**，偏向**实战 + 原理理解**，适合你目前的 React / Hooks 学习阶段。

---

## 一、useRef 是什么

```ts
const ref = useRef(initialValue);
```

### 本质

* `useRef` **返回一个稳定的对象**
* 结构固定：

```ts
{ current: initialValue }
```

### 核心特性（非常重要）

1. **修改 `ref.current` 不会触发组件重新渲染**
2. **在组件整个生命周期内保持同一个引用**
3. **可以保存任何类型的值（DOM / 普通变量 / 函数 / 对象）**

---

## 二、useRef 的三大核心用途（必须掌握）

---

## 用途一：获取 DOM / 组件实例（最经典）

### 1️⃣ 获取 DOM 元素

```jsx
import { useRef } from "react";

export default function InputFocus() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleFocus}>Focus</button>
    </>
  );
}
```

### 知识点

* `ref` 属性是 **React 的特殊属性**
* DOM 挂载完成后，`ref.current` 才有值
* 初始值一般为 `null`

---

### 2️⃣ 获取子组件实例（forwardRef）

```jsx
const Child = React.forwardRef((props, ref) => {
  return <input ref={ref} />;
});

export default function Parent() {
  const ref = useRef(null);

  return <Child ref={ref} />;
}
```

📌 **注意**

* 函数组件默认无法接收 `ref`
* 必须使用 `forwardRef`

---

## 用途二：保存“不会触发渲染”的状态（非常重要）

### 1️⃣ 保存上一次的值（previous value）

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = useRef(count);

  useEffect(() => {
    prevCount.current = count;
  }, [count]);

  return (
    <div>
      <p>Now: {count}</p>
      <p>Prev: {prevCount.current}</p>
    </div>
  );
}
```

### 适用场景

* 对比新旧 props / state
* 埋点统计
* 状态变化分析

---

### 2️⃣ 代替 useState（不需要 UI 更新）

```jsx
function RenderCount() {
  const renderCount = useRef(0);
  renderCount.current++;

  return <p>Rendered: {renderCount.current}</p>;
}
```

📌 如果使用 `useState` 会造成**死循环**

---

### 3️⃣ 保存定时器 / requestAnimationFrame / socket 实例

```jsx
function Timer() {
  const timerRef = useRef(null);

  const start = () => {
    timerRef.current = setInterval(() => {
      console.log("running");
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
  };

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

📌 **这是 useRef 的高频真实项目用途**

---

## 用途三：解决闭包陷阱（高级且实用）

### 问题：闭包拿到的是旧值

```jsx
function Demo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log(count); // 永远是 0
    }, 1000);
  }, []);
}
```

---

### 使用 useRef 解决

```jsx
function Demo() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, []);
}
```

### 知识点总结

* `useRef` 可以作为 **“最新状态容器”**
* 非常适合：

  * setInterval
  * 事件监听
  * WebSocket
  * 原生 API 回调

---

## 四、useRef vs useState（面试常考）

| 对比点        | useRef          | useState |
| ---------- | --------------- | -------- |
| 数据变化是否触发渲染 | ❌ 不会            | ✅ 会      |
| 是否稳定       | ✅ 始终同一个对象       | ❌ 每次更新新值 |
| 适合存什么      | DOM / 实例 / 临时变量 | UI 状态    |
| 是否参与视图     | ❌               | ✅        |

---

## 五、useRef + useEffect 常见组合

### 1️⃣ 判断是否首次渲染

```jsx
function Demo() {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    console.log("not first render");
  });
}
```

---

### 2️⃣ 防止重复请求

```jsx
function FetchOnce() {
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch("/api/data");
  }, []);
}
```

---

## 六、useRef 的常见误区（重点）

### ❌ 修改 ref 期待页面更新

```js
ref.current = 10; // 页面不会更新
```

### ❌ 在 render 中读取 DOM 尺寸

```js
ref.current.offsetHeight // 可能为 null
```

✔️ 应放到 `useEffect / useLayoutEffect`

---

## 七、useLayoutEffect + useRef（DOM 测量）

```jsx
function Box() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    console.log(ref.current.offsetHeight);
  }, []);

  return <div ref={ref}>Hello</div>;
}
```

📌 `useLayoutEffect` 在 DOM 更新后、浏览器绘制前执行

---

## 八、useRef 的心智模型（记住这句话）

> **useRef 是一个“不会引起重新渲染的、跨 render 持久化的盒子”**

---

## 九、学习建议（结合你目前阶段）

你现在 React / RN 学得比较深入，**useRef 至少要掌握到这 3 个层级**：

1. **基础**：DOM、input focus
2. **进阶**：定时器、保存旧值、避免重复执行
3. **高级**：解决闭包、事件监听、异步回调中的最新状态

如果你愿意，下一步我可以帮你：

* 总结 **useRef 在 React Native 中的差异用法**
* 或结合 **React Query / Zustand / 表单库**讲 useRef 的真实项目案例
* 或整理一份 **useRef 面试题 + 标准回答**

你可以直接告诉我你想往哪一层继续深入。
