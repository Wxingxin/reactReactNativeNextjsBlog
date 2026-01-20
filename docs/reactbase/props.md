下面给你一份 **「React 组件嵌套中的数据传递：知识点大全 + 配置/用法大全」**。我会从**最基础 → 中级 → 高级 → 架构级**完整展开，并且每一种方式都会说明**适用场景、优缺点、典型代码**。这套内容基本覆盖你在真实项目（React / Next.js / RN）中会用到的所有数据流方案。

---

# 一、React 组件嵌套中的“数据流本质”

> **React 的核心原则：单向数据流（One-way Data Flow）**

* **父 → 子：通过 props**
* **子 → 父：通过回调函数**
* **兄弟组件：状态提升（Lifting State Up）**
* **深层组件：Context**
* **跨页面 / 跨模块：全局状态管理**

---

# 二、父组件 → 子组件（Props 传递）

## 1️⃣ 基础 props 传值（最常见）

```jsx
function Parent() {
  return <Child name="wjx" age={20} />;
}

function Child({ name, age }) {
  return <div>{name} - {age}</div>;
}
```

### 关键知识点

* props 是 **只读的**
* 子组件 **不能修改 props**
* props 支持 **任意 JS 类型**

---

## 2️⃣ 传对象 / 数组（业务最常见）

```jsx
function Parent() {
  const user = { id: 1, name: "wjx" };
  return <Child user={user} />;
}

function Child({ user }) {
  return <div>{user.name}</div>;
}
```

注意：

* React 只做 **引用比较**
* 不要在子组件里直接修改对象

---

## 3️⃣ 传函数（为“子 → 父”做准备）

```jsx
function Parent() {
  const handleSave = (data) => {
    console.log(data);
  };

  return <Child onSave={handleSave} />;
}
```

---

## 4️⃣ props 解构的两种方式

```jsx
// 方式 1：参数解构（推荐）
function Child({ name, age }) {}

// 方式 2：函数体解构
function Child(props) {
  const { name, age } = props;
}
```

---

# 三、子组件 → 父组件（回调函数）

## 1️⃣ 基本模式（核心思想）

> **父组件把函数传下去，子组件在合适的时机调用**

```jsx
function Parent() {
  const handleChange = (value) => {
    console.log("from child:", value);
  };

  return <Child onChange={handleChange} />;
}

function Child({ onChange }) {
  return (
    <button onClick={() => onChange("hello")}>
      Send
    </button>
  );
}
```

---

## 2️⃣ 表单输入（极高频）

```jsx
function Parent() {
  const [value, setValue] = useState("");

  return <Input value={value} onChange={setValue} />;
}

function Input({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

👉 这就是 **受控组件（Controlled Component）**

---

## 3️⃣ 子组件“通知”父组件（事件上报）

```jsx
<Child onSuccess={handleSuccess} onError={handleError} />
```

> 类似后端的事件回调，是 React 非常重要的设计模式。

---

# 四、兄弟组件通信（状态提升）

## 1️⃣ 状态提升（官方推荐）

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Add onAdd={() => setCount(c => c + 1)} />
      <Display count={count} />
    </>
  );
}
```

### 原则

* **共享状态，放到最近的公共父组件**
* 子组件只负责展示或触发事件

---

## 2️⃣ 什么时候该“提升状态”

* 多个子组件依赖同一份数据
* 一个组件修改，另一个组件展示

---

# 五、跨多层嵌套（Context）

> **Context = 官方解决“props drilling（属性层层传递）”的问题**

## 1️⃣ 创建 Context

```jsx
const ThemeContext = createContext("light");
```

---

## 2️⃣ 提供数据（Provider）

```jsx
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Layout />
    </ThemeContext.Provider>
  );
}
```

---

## 3️⃣ 消费数据（useContext）

```jsx
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Btn</button>;
}
```

---

## 4️⃣ Context 传复杂对象

```jsx
<ThemeContext.Provider value={{ theme, setTheme }}>
```

```jsx
const { theme, setTheme } = useContext(ThemeContext);
```

---

## 5️⃣ Context 的适用场景

✅ 主题
✅ 当前登录用户
✅ 语言国际化
❌ 高频变化的大数据（容易导致重渲染）

---

# 六、props.children（组件嵌套的核心能力）

## 1️⃣ children 基础

```jsx
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

---

## 2️⃣ 具名插槽（模拟）

```jsx
function Layout({ header, footer, children }) {
  return (
    <>
      <header>{header}</header>
      <main>{children}</main>
      <footer>{footer}</footer>
    </>
  );
}
```

---

## 3️⃣ Render Props（函数作为 children）

```jsx
<List
  items={data}
  render={(item) => <Item key={item.id} item={item} />}
/>
```

---

# 七、Ref 传递（父操作子）

## 1️⃣ forwardRef（DOM 或组件）

```jsx
const Input = forwardRef((props, ref) => {
  return <input ref={ref} />;
});
```

```jsx
const ref = useRef();
<Input ref={ref} />;
ref.current.focus();
```

---

## 2️⃣ useImperativeHandle（暴露受控 API）

```jsx
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current.focus(),
}));
```

适用：

* 表单
* 弹窗
* 视频 / 音频

---

# 八、全局状态（跨组件 / 跨页面）

## 1️⃣ Context + useReducer（官方方案）

```jsx
const StateContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1 };
  }
}
```

---

## 2️⃣ 第三方状态库（项目常用）

* Zustand（轻量，推荐）
* Redux Toolkit
* Jotai
* Recoil

👉 **嵌套很深 / 多页面共享 → 用状态库**

---

# 九、数据传递方式选型表（非常重要）

| 场景      | 推荐方式                    |
| ------- | ----------------------- |
| 父 → 子   | props                   |
| 子 → 父   | 回调函数                    |
| 兄弟组件    | 状态提升                    |
| 深层嵌套    | Context                 |
| 控制子组件行为 | ref                     |
| 全局共享    | Zustand / Redux         |
| UI 组合   | children / render props |

---

# 十、常见错误 & 最佳实践

## ❌ 反模式

* props 层层传 5–6 层
* 在子组件中修改 props
* Context 放高频变更数据
* 滥用全局状态

## ✅ 推荐

* 状态放在**最小必要共享层级**
* UI 组件尽量“无状态”
* 数据组件与展示组件分离
* 多层嵌套优先 Context 或组合

---

# 十一、一句话总结（记住这段）

> **React 的组件嵌套数据传递，本质就是：
> 状态放哪里？谁修改？谁消费？**

---

如果你愿意，我可以**直接用一个完整小项目（比如登录 / 列表 / 弹窗 / 表单）**把这些方式全部串一遍，或者**结合你正在做的 React / Next.js / RN 项目结构**，帮你设计一套“最合理的数据传递架构图”。你更想看哪一种？


下面我给你一份 **「React 中 props 可以传递什么数据」的完整清单 + 经典案例**。我会按**数据类型 → 使用场景 → 典型代码**来讲，基本覆盖你在真实项目里会用到的 100% 情况。

---

# 一、props 能传什么？一句话总览

> **props 可以传递：任何合法的 JavaScript 值**

包括但不限于：

* 基本类型
* 引用类型
* 函数
* JSX / 组件
* children
* ref（特殊）
* 高阶模式（render props）

---

# 二、基础数据类型（最基础、最常见）

## 1️⃣ 字符串（string）

```jsx
<UserName name="wjx" />
```

```jsx
function UserName({ name }) {
  return <span>{name}</span>;
}
```

### 场景

* 文本
* 标题
* 占位提示

---

## 2️⃣ 数字（number）

```jsx
<Counter count={3} />
```

```jsx
function Counter({ count }) {
  return <div>Count: {count}</div>;
}
```

---

## 3️⃣ 布尔值（boolean）

```jsx
<Button disabled />
<Button disabled={true} />
<Button disabled={isLoading} />
```

```jsx
function Button({ disabled }) {
  return <button disabled={disabled}>Submit</button>;
}
```

### 经典用法：条件控制

---

## 4️⃣ undefined / null（控制渲染）

```jsx
<Avatar src={null} />
```

```jsx
function Avatar({ src }) {
  if (!src) return <DefaultAvatar />;
  return <img src={src} />;
}
```

---

# 三、引用类型（项目中最常用）

## 5️⃣ 对象（object）

```jsx
<UserCard user={{ id: 1, name: "wjx", role: "admin" }} />
```

```jsx
function UserCard({ user }) {
  return (
    <>
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </>
  );
}
```

### 注意

* props 是只读的
* 不要在子组件中修改对象属性

---

## 6️⃣ 数组（array）

```jsx
<Menu items={["Home", "About", "Profile"]} />
```

```jsx
function Menu({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

---

## 7️⃣ Date / RegExp / Map / Set

```jsx
<Time value={new Date()} />
```

```jsx
function Time({ value }) {
  return <span>{value.toLocaleString()}</span>;
}
```

> 只要是 JS 对象，本质都可以传

---

# 四、函数（极其重要）

## 8️⃣ 普通函数（事件 / 回调）

```jsx
<Child onSave={handleSave} />
```

```jsx
function Child({ onSave }) {
  return <button onClick={() => onSave("data")}>Save</button>;
}
```

### 使用场景

* 子 → 父通信
* 表单提交
* 事件通知

---

## 9️⃣ 箭头函数（参数绑定）

```jsx
<Item onDelete={() => deleteItem(id)} />
```

---

## 10️⃣ 异步函数

```jsx
<Form onSubmit={async (data) => await api.save(data)} />
```

---

# 五、JSX / React 元素（非常强大）

## 🔟1️⃣ JSX 元素

```jsx
<Dialog footer={<Button>OK</Button>} />
```

```jsx
function Dialog({ footer }) {
  return <div>{footer}</div>;
}
```

### 场景

* 插槽
* UI 定制

---

## 🔟2️⃣ React 组件（组件本身）

```jsx
<Page header={Header} />
```

```jsx
function Page({ header: Header }) {
  return <Header />;
}
```

---

# 六、props.children（嵌套的核心）

## 🔟3️⃣ children（默认插槽）

```jsx
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

### children 能是什么？

* string
* JSX
* 数组
* 函数（render props）

---

## 🔟4️⃣ children 是函数（Render Props）

```jsx
<DataProvider>
  {(data) => <div>{data.name}</div>}
</DataProvider>
```

```jsx
function DataProvider({ children }) {
  const data = { name: "wjx" };
  return children(data);
}
```

---

# 七、ref（特殊但重要）

## 🔟5️⃣ ref（配合 forwardRef）

```jsx
<Input ref={inputRef} />
```

```jsx
const Input = forwardRef((props, ref) => {
  return <input ref={ref} />;
});
```

### 场景

* 聚焦
* 滚动
* 控制子组件方法

---

# 八、复杂组合模式（高级）

## 🔟6️⃣ Render Props（具名）

```jsx
<List
  items={items}
  renderItem={(item) => <Row key={item.id} item={item} />}
/>
```

---

## 🔟7️⃣ 配置对象（企业项目最常见）

```jsx
<Table
  columns={[
    { title: "Name", key: "name" },
    { title: "Age", key: "age" },
  ]}
  data={users}
/>
```

---

# 九、props 中“不能直接渲染”的值

❌ 不能直接作为 JSX 子节点渲染：

* 普通对象 `{}`

```jsx
<div>{user}</div> // ❌
```

✅ 正确：

```jsx
<div>{user.name}</div>
<pre>{JSON.stringify(user)}</pre>
```

---

# 十、props 默认值 & 校验（补充）

```jsx
function Button({ type = "button", disabled = false }) {}
```

（TS 项目里用 interface / type，更推荐）

---

# 十一、总结表（速查）

| 类型               | 是否可传 | 常见用途  |
| ---------------- | ---- | ----- |
| string / number  | ✅    | 文本    |
| boolean          | ✅    | 开关    |
| null / undefined | ✅    | 控制渲染  |
| object           | ✅    | 业务数据  |
| array            | ✅    | 列表    |
| function         | ✅    | 回调    |
| JSX              | ✅    | 插槽    |
| Component        | ✅    | UI 注入 |
| children         | ✅    | 组合    |
| ref              | ✅    | 控制    |

---

# 十二、一句话记忆版

> **props = 组件的“参数”，JS 能传的，props 基本都能传。**

---

如果你愿意，我可以 **把这些 props 用法全部放进一个“真实项目结构（列表 + 表单 + 弹窗 + 表格）”里给你一份完整示例**，或者 **专门帮你总结一版 React 面试中关于 props 的高频问题 + 标准回答**。你更想要哪一个？
