我先给你一句话版的直觉：

> **useRef = 一个不会因为修改而触发重新渲染的“小仓库”，最常见用途是拿 DOM 节点 + 存跨渲染的变量。**

下面给你一套 **“知识点速查 + 经典代码案例合集”**，你可以当文档用。

---

## 一、useRef 是什么？核心概念

```js
const ref = useRef(initialValue);
```

* `ref` 是一个对象：`{ current: 初始值 }`
* React 只在第一次渲染时创建这个对象，**之后每次渲染都是同一个 ref 对象**
* 修改 `ref.current` **不会让组件重新渲染**（这点和 state 最大区别）

👉 所以它有两个主要用途：

1. **获取和操作 DOM 元素**
2. **存放在渲染之间需要“记住”的可变数据，但又不想触发重新渲染**

---

## 二、基础用法 1：获取 DOM 元素（最常见）

### 例 1：自动聚焦输入框

```jsx
import { useRef, useEffect } from "react";

function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // 组件挂载后，ref.current 指向真实的 input DOM
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="会自动聚焦" />;
}
```

关键点：

* JSX 上写：`ref={inputRef}`
* 渲染后：`inputRef.current` 就是这个 DOM 节点

### 例 2：控制视频播放 / 暂停

```jsx
function VideoPlayer() {
  const videoRef = useRef(null);

  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();

  return (
    <div>
      <video ref={videoRef} src="xxx.mp4" width="400" />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
    </div>
  );
}
```

> 这里 `useRef` 就是给你一个“遥控器”直接操作 DOM。

---

## 三、基础用法 2：存放不会触发渲染的变量

### 例 3：保存一个变化的值，但不想引发重渲染

```jsx
function Demo() {
  const countRef = useRef(0);

  const handleClick = () => {
    countRef.current += 1;
    console.log("点击次数（不触发重渲染）：", countRef.current);
  };

  console.log("组件渲染");

  return <button onClick={handleClick}>点我</button>;
}
```

* 点击按钮只会更新 `countRef.current`，**组件不会重新渲染**。
* 适合用来做：统计、缓存、锁、标记位等。

---

## 四、useRef vs useState 怎么选？

| 场景                          | 用 useState | 用 useRef |
| --------------------------- | ---------- | -------- |
| 改了之后要更新 UI                  | ✅          | ❌        |
| 仅在逻辑中使用，不需要 UI 更新           | ❌          | ✅        |
| 需要参与 React 的数据流、依赖项         | ✅          | ❌        |
| 存 DOM 节点                    | ❌          | ✅        |
| 存定时器 id、WebSocket 实例、一些“句柄” | ❌          | ✅        |

一句话记：

> **UI 用 useState，纯逻辑或 DOM 用 useRef。**

---

## 五、经典知识点小结

1. `useRef(initialValue)` → `{ current: initialValue }`
2. ref 对象在整个组件生命周期里**只有一个**（不会重建）
3. 改 `ref.current` 不会触发渲染
4. 拿 DOM 就是：`<div ref={divRef} />` → `divRef.current`
5. 不能在 `if / for` 里调用 useRef（同 hooks 规则）
6. 配合 `forwardRef` 可以把 ref 传给子组件（下面给例子）

---

## 六、经典代码案例合集

### ✅ 案例 1：滚动到某个元素

```jsx
function ScrollDemo() {
  const boxRef = useRef(null);

  const scrollToBox = () => {
    boxRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div>
      <button onClick={scrollToBox}>滚动到方块</button>
      <div style={{ height: 800 }} />
      <div
        ref={boxRef}
        style={{ width: 100, height: 100, background: "skyblue" }}
      >
        目标
      </div>
      <div style={{ height: 800 }} />
    </div>
  );
}
```

---

### ✅ 案例 2：保存上一次的 state（自定义 Hook：usePrevious）

```jsx
import { useRef, useEffect } from "react";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; // 每次渲染完把当前值存起来
  }, [value]);
  return ref.current; // 上一次的值
}

// 使用
function Counter() {
  const [count, setCount] = React.useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>现在：{count}</p>
      <p>上一次：{prevCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

> 这个模式在实际项目里非常常用，用来对比“前后变化”。

---

### ✅ 案例 3：存定时器 id，组件卸载时清除

```jsx
function Timer() {
  const [count, setCount] = React.useState(0);
  const timerRef = useRef(null);

  const start = () => {
    if (timerRef.current) return; // 防止重复创建
    timerRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  React.useEffect(() => {
    return stop; // 组件卸载时清除定时器
  }, []);

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

---

### ✅ 案例 4：记录组件渲染次数（不影响渲染）

```jsx
function RenderCountDemo() {
  const [value, setValue] = React.useState("");
  const renderCount = useRef(0);

  renderCount.current += 1;

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="随便输入"
      />
      <p>组件渲染了 {renderCount.current} 次</p>
    </div>
  );
}
```

---

### ✅ 案例 5：解决“闭包拿不到最新 state”的问题

有时你在 `setTimeout` / 事件回调里会读到旧的 state，这时可以用 ref 存最新值。

```jsx
function LatestStateDemo() {
  const [count, setCount] = React.useState(0);
  const latestCountRef = useRef(count);

  // 每次 count 变化时同步到 ref
  React.useEffect(() => {
    latestCountRef.current = count;
  }, [count]);

  const logLater = () => {
    setTimeout(() => {
      // 这里总是最新的 count
      console.log("1秒后打印：", latestCountRef.current);
    }, 1000);
  };

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={logLater}>1 秒后打印 count</button>
    </div>
  );
}
```

> 这是非常实用的模式：**“state + ref 同步”**，解决闭包变旧的问题。

---

### ✅ 案例 6：防抖 / 节流中的 ref 使用

#### 输入搜索框防抖（只在停止输入 500ms 后搜索）

```jsx
function SearchInput() {
  const [keyword, setKeyword] = React.useState("");
  const debounceRef = useRef(null);

  const onChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      console.log("搜索：", value);
      // 这里可以真实发请求
    }, 500);
  };

  React.useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return <input value={keyword} onChange={onChange} placeholder="搜索..." />;
}
```

---

### ✅ 案例 7：用 ref 做“请求中”锁，防止重复点击

```jsx
function SubmitButton() {
  const [text, setText] = React.useState("");
  const loadingRef = useRef(false);

  const handleSubmit = async () => {
    if (loadingRef.current) return; // 正在请求中，直接返回
    loadingRef.current = true;
    try {
      await fakeRequest(text);
      alert("提交成功");
    } finally {
      loadingRef.current = false;
    }
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}

function fakeRequest(value) {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
```

> 这种“锁”性质的变量，非常适合放在 ref 里，不需要 UI 更新。

---

### ✅ 案例 8：forwardRef + useRef：把 ref 传给子组件

有时你希望外部组件可以直接操作某个内部 DOM，可以用 `forwardRef`。

```jsx
import React, { useRef, useImperativeHandle, forwardRef } from "react";

const Input = forwardRef((props, ref) => {
  const inputRef = useRef(null);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => (inputRef.current.value = ""),
  }));

  return <input ref={inputRef} {...props} />;
});

function App() {
  const inputRef = useRef(null);

  return (
    <div>
      <Input ref={inputRef} placeholder="子组件里的 input" />
      <button onClick={() => inputRef.current.focus()}>聚焦</button>
      <button onClick={() => inputRef.current.clear()}>清空</button>
    </div>
  );
}
```

> 这个是进阶用法：`useRef + forwardRef + useImperativeHandle`，做“对外提供的实例方法”。

---

## 七、记忆小总结（心中留一个模型）

你可以这样记：

1. **“DOM 遥控器”**

   * `ref={xxx}` → `xxx.current` 就是 DOM
   * 可用于 `focus()`、`scrollIntoView()`、`play()` 等

2. **“不会触发渲染的小仓库”**

   * 存：定时器 id、最新 state、锁、计数器、上一次值、统计信息…
   * 改：`ref.current = 新值`，不会重渲染

3. 和 `useState` 的使用分界线：

   * 要更新界面：`useState`
   * 不用更新界面，只是逻辑需要：`useRef`

---

如果你愿意，下一步我可以：

* 帮你做一个 **综合 demo**：在一个小项目中同时用到 `useState + useEffect + useRef + useReducer + useContext`，把这些 hook 串起来理解
* 或者专门讲一讲 **forwardRef + useImperativeHandle 的进阶用法**（这两个和 useRef 很配）
* 或帮你看一段你项目里的代码，指出哪里适合用 useRef 优化

你现在更想往哪个方向搞？