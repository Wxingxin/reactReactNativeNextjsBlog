# 

这是 **React Hooks 最核心、也是最容易被忽视的规则之一**。我直接给你**本质原因**，而不是背规则。

---

## 一句话结论（先记住）

> **Hook 不能写在条件语句里，是因为 React 是“按调用顺序”来区分每一个 Hook 的。**
> 一旦顺序变了，React 就不知道哪个 state 属于谁了。

---

## React 内部是怎么“记住” Hook 的？

**React 并不是通过变量名来识别 Hook 的。**

它是通过**调用顺序（index）**。

你可以把 React 内部理解成这样👇

```js
// 伪代码：React 内部
const hooks = [];
let hookIndex = 0;

function useState(initial) {
  hooks[hookIndex] ??= initial;
  const currentIndex = hookIndex;
  hookIndex++;

  return [
    hooks[currentIndex],
    (v) => (hooks[currentIndex] = v)
  ];
}
```

👉 **关键点**：

* 第一次调用 `useState` → hooks[0]
* 第二次调用 `useState` → hooks[1]
* 第三次 → hooks[2]
* **完全依赖“调用顺序”**

---

## 条件语句为什么会破坏顺序？

### ❌ 错误示例

```jsx
function Demo({ show }) {
  if (show) {
    const [count, setCount] = useState(0);
  }

  const [name, setName] = useState("Tom");
}
```

### 第一次 render（show = true）

```txt
useState → hooks[0] (count)
useState → hooks[1] (name)
```

### 第二次 render（show = false）

```txt
useState → hooks[0] (name)
```

💥 **灾难发生了：**

* 原来 `hooks[0]` 是 `count`
* 现在 React 以为 `hooks[0]` 是 `name`
* state 全乱了

> React 不知道你“想不想调用”，它只知道“第几个调用”

---

## 所以 React 强制了这条规则

> **Hooks 必须在组件最外层、且每次 render 调用顺序完全一致**

这就是官方的 **Rules of Hooks**。

---

## 常见误区澄清（你很可能踩过）

### ❌ 误区 1：变量名不同就没事

```js
const [a, setA] = useState();
const [b, setB] = useState();
```

❌ 错
React **根本不看变量名**

---

### ❌ 误区 2：只在第一次渲染时用 if

```js
if (!mounted) {
  useEffect(...)
}
```

❌ 还是错
React **不关心你是不是“只执行一次”**

---

## 正确写法：条件逻辑写在 Hook 里面

### ✅ 正确方式 1：Hook 一定调用，逻辑在内部判断

```jsx
const [count, setCount] = useState(0);

if (show) {
  // 用 state
}
```

---

### ✅ 正确方式 2：条件放在 effect 内部

```jsx
useEffect(() => {
  if (!show) return;

  // 副作用逻辑
}, [show]);
```

---

### ✅ 正确方式 3：拆组件（**这是高手写法**）

```jsx
function Demo({ show }) {
  return show ? <Inner /> : null;
}

function Inner() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

👉 **组件级条件是安全的**

---

## 为什么 class 组件没有这个限制？

因为 class 是：

```js
this.state = { count: 0, name: "Tom" }
```

* state 有 key
* 不靠顺序
* Hook 是函数 + 闭包 + 顺序机制

---

## 你现在应该如何“真正记住”这条规则？

记住这一句话就够了：

> **Hook = 数组 + 顺序**
> **条件 = 顺序变化 = 爆炸**

---

如果你愿意，下一步我可以直接带你看 **React 源码里 Hook 是怎么实现的**，或者帮你总结一张 **Hook 使用的“安全 / 危险写法对照表”**，哪个更适合你？
