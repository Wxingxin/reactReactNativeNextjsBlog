下面给你一份 **React `useEffect` 使用大全（超全 + 案例 + 常见坑）**
这是我总结的“**从小白到熟练开发者**必须掌握的 useEffect 全部套路”。
**每一条都配有清晰解释 + 经典案例。**

建议你收藏。
（也可以让我要 *useMemo/useCallback 全家桶*）

---

# 🟦 目录

1. 基础语法（3 种用法）
2. 依赖项（[]、[state]、不写依赖）
3. 清理函数（return）
4. 常见功能场景模板
5. 异步请求（fetch / axios）
6. 防抖 & 节流版本的 useEffect
7. 订阅/事件监听
8. useEffect vs useLayoutEffect
9. 常见坑大全（非常重要）
10. useEffect 使用思维模型（你到底什么时候该用它）

---

# 🟩 1. useEffect 基础语法（3 种用法）

## 1.1 **无依赖 → 每次渲染后执行**

```jsx
useEffect(() => {
  console.log("组件渲染了！");
});
```

👉 **每次渲染都会执行**（包括初次渲染）。

---

## 1.2 **空依赖 [] → 只执行一次**

```jsx
useEffect(() => {
  console.log("组件挂载时执行（只一次）");
}, []);
```

用途：

* 初始化数据
* 添加监听器
* 获取 localStorage
* 初始化动画

---

## 1.3 **依赖项 [x] → x 变化时执行**

```jsx
useEffect(() => {
  console.log("count 变化了！");
}, [count]);
```

用途：

* 监听 state
* 监听 props
* 监听某些值的变化触发副作用

---

# 🟩 2. 依赖项的作用（3 种核心写法）

| 写法                                | 触发时机      | 示例        |
| --------------------------------- | --------- | --------- |
| `useEffect(() => {...})`          | 每次渲染      | DOM 同步、调试 |
| `useEffect(() => {...}, [])`      | 只一次       | 请求接口、订阅   |
| `useEffect(() => {...}, [value])` | value 变化时 | 监听搜索值变化   |

---

# 🟩 3. 清除副作用（return）

**经典：添加事件监听**

```jsx
useEffect(() => {
  const handler = () => console.log(window.scrollY);
  window.addEventListener("scroll", handler);

  return () => {
    window.removeEventListener("scroll", handler);
  };
}, []);
```

用途：

* 清除计时器
* 取消订阅
* 移除事件监听
* 清除动画

---

# 🟩 4. useEffect 的 10 个经典场景模板

下面是实际开发中最常用的 **“直接复制可用” 模板**。

---

## 4.1 **组件挂载请求数据**

```jsx
useEffect(() => {
  fetch("/api/user")
    .then(res => res.json())
    .then(data => setUser(data));
}, []);
```

---

## 4.2 **监听 state 改变执行某事**

```jsx
useEffect(() => {
  console.log("count 改变了：", count);
}, [count]);
```

---

## 4.3 **防抖搜索（非常经典）**

```jsx
useEffect(() => {
  const handler = setTimeout(() => {
    console.log("搜索：", keyword);
  }, 500);

  return () => clearTimeout(handler);
}, [keyword]);
```

用户持续输入时不会频繁触发 API。

---

## 4.4 **节流（scroll）**

```jsx
useEffect(() => {
  let timer = null;

  const handler = () => {
    if (timer) return;
    timer = setTimeout(() => {
      console.log("scroll:", window.scrollY);
      timer = null;
    }, 200);
  };

  window.addEventListener("scroll", handler);

  return () => window.removeEventListener("scroll", handler);
}, []);
```

---

## 4.5 **监听页面大小变化**

```jsx
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);

  return () => window.removeEventListener("resize", onResize);
}, []);
```

---

## 4.6 **监听 props 变化**

```jsx
useEffect(() => {
  console.log("parent 给的 id 变了：", id);
}, [id]);
```

---

## 4.7 **倒计时（定时器）**

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c - 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

---

## 4.8 **操作 DOM**

```jsx
useEffect(() => {
  inputRef.current.focus();
}, []);
```

---

## 4.9 **同步状态到 localStorage**

```jsx
useEffect(() => {
  localStorage.setItem("count", count);
}, [count]);
```

---

## 4.10 **清除动画**

```jsx
useEffect(() => {
  const animation = startAnimation();
  return () => animation.stop();
}, []);
```

---

# 🟩 5. 异步请求正确写法（非常重要）

❌ 错误：

```jsx
useEffect(async () => {  // ❌ 不能 async
  const res = await fetch(...);
}, []);
```

✔ 正确：

```jsx
useEffect(() => {
  async function load() {
    const res = await fetch(...);
    const data = await res.json();
    setUser(data);
  }
  load();
}, []);
```

---

# 🟩 6. 防抖（debounce）实现完整版

```jsx
useEffect(() => {
  if (!keyword) return;

  const handler = setTimeout(() => {
    fetch("/api/search?q=" + keyword).then(...);
  }, 500);

  return () => clearTimeout(handler);
}, [keyword]);
```

---

# 🟩 7. 订阅 / 事件监听模式（经典）

```jsx
useEffect(() => {
  socket.on("message", handler);
  return () => socket.off("message", handler);
}, []);
```

模式总结：

* **订阅事件**
* **return 里取消订阅**

---

# 🟩 8. useEffect vs useLayoutEffect

| Hook            | 触发时间        | 用途          |
| --------------- | ----------- | ----------- |
| useEffect       | 绘制后执行       | 请求、事件、日志    |
| useLayoutEffect | DOM 更新后、绘制前 | 测量 DOM、同步布局 |

例如测量 DOM 宽高：

```jsx
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  console.log(rect);
}, []);
```

---

# 🟩 9. useEffect 常见坑（99% 的人都会踩）

## ❌ 9.1 依赖项错误导致无限渲染

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]); // 无限循环
```

---

## ❌ 9.2 忘记加依赖项

```jsx
useEffect(() => {
  console.log(user);
}, []); // user 变了也不会执行
```

---

## ❌ 9.3 对象/函数作为依赖导致无限执行

```jsx
useEffect(() => {}, [{}]);  // 每次都是新对象
```

解决：

```jsx
const obj = useMemo(() => ({}), []);
useEffect(() => {}, [obj]);
```

---

## ❌ 9.4 使用 async 作为 useEffect 参数

```jsx
useEffect(async () => {}, []); // ❌
```

---

## ❌ 9.5 不清理订阅导致内存泄漏

必须：

```jsx
return () => 清理();
```

---

# 🟩 10. useEffect 使用思维模型（究竟什么时候用？）

把 useEffect 看成：

> **“让 React 在渲染之后，帮你执行一些副作用（side effects）”**

副作用是什么？

* 异步请求
* 操作 DOM
* 事件订阅
* 定时器
* 写入 localStorage
* 打印日志
* 组件卸载时清理

如果你做的事情 **不是** 副作用：

❌ 计算值
❌ 过滤、排序数据
❌ 从 props 派生 state（能计算就不要用 effect）
❌ 组件内部的同步逻辑

👉 都不要用 useEffect

**副作用才用 useEffect**
**纯计算不要用 useEffect**

---

# 🟦 如果你愿意，我可以继续给你：

### ✔ useMemo 使用大全

### ✔ useCallback 使用大全

### ✔ React Hooks 全家桶最佳实践

### ✔ useEffect + axios 全套模板

### ✔ useEffect + Zustand/Redux 真实项目模式

你想继续学哪一个？