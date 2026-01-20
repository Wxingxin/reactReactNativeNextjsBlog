下面给你一份“React 中 JSX 的知识点大全 + 使用大全”，按你做项目时最常遇到的点组织，并配上典型代码。你把这份当成 JSX 的“速查 + 进阶笔记”就行。

---

## 1) JSX 是什么

* JSX 是一种语法扩展：看起来像 HTML，但本质是 **JavaScript 表达式**，会被编译成 `React.createElement(...)`（或新 JSX 运行时的等价形式）。
* JSX 不是模板语言；它能直接用 JS 的表达式、变量、函数、三元等。

---

## 2) JSX 语法核心规则

### 2.1 必须有一个根节点

```jsx
return (
  <div>
    <h1>Title</h1>
    <p>content</p>
  </div>
);
```

不想多包一层，用 Fragment：

```jsx
return (
  <>
    <h1>Title</h1>
    <p>content</p>
  </>
);
```

或显式：

```jsx
return (
  <React.Fragment>
    <h1>Title</h1>
  </React.Fragment>
);
```

### 2.2 在 JSX 里写 JS：用 `{}`（只能放“表达式”）

可用：变量、函数调用、三元、`&&`、数组 `map`、模板字符串等
不可用：`if/for/while/switch` 等语句（但你可以在 JSX 外先计算好）

```jsx
const name = "wjx";
return <div>Hello {name.toUpperCase()}</div>;
```

### 2.3 属性命名：`className`、`htmlFor`、驼峰事件

```jsx
<label htmlFor="email">Email</label>
<input id="email" className="input" onClick={handleClick} />
```

---

## 3) JSX 中渲染值的规则（非常重要）

### 3.1 可以直接渲染的类型

* string / number
* JSX 元素
* 数组（元素是可渲染值）
* `null/undefined/false` 会被忽略（不渲染）

```jsx
<div>{0}</div>           // 渲染 0
<div>{false}</div>       // 不渲染
<div>{null}</div>        // 不渲染
<div>{undefined}</div>   // 不渲染
```

### 3.2 不能直接渲染的类型

* 普通对象（会报错）：`Objects are not valid as a React child`

```jsx
const user = { name: "A" };
return <div>{user}</div>; // ❌
```

正确做法：

```jsx
return <div>{user.name}</div>;
// 或
return <pre>{JSON.stringify(user, null, 2)}</pre>;
```

---

## 4) 条件渲染大全（JSX 必考点）

### 4.1 `&&` 短路

```jsx
{isLoading && <Spinner />}
```

注意：如果左边可能是 `0`，会渲染 `0`：

```jsx
{count && <span>Count: {count}</span>} // count=0 会显示 0
```

更稳：

```jsx
{count > 0 && <span>Count: {count}</span>}
```

### 4.2 三元表达式

```jsx
{isLogin ? <Dashboard /> : <Login />}
```

### 4.3 提前 return（工程里最常用）

```jsx
if (isLoading) return <Spinner />;
if (error) return <ErrorView />;

return <Main />;
```

### 4.4 用变量存 JSX（复杂 UI 分支很清晰）

```jsx
let content = <Empty />;

if (isLoading) content = <Spinner />;
else if (data) content = <List data={data} />;

return <section>{content}</section>;
```

---

## 5) 列表渲染与 key（高频坑）

### 5.1 map 渲染

```jsx
<ul>
  {todos.map((t) => (
    <li key={t.id}>{t.title}</li>
  ))}
</ul>
```

### 5.2 key 的原则

* key 必须在同级中唯一
* **优先使用稳定 id**（数据库 id、uuid）
* 不推荐用 index（除非列表永远不变顺序、不增删）

```jsx
{items.map((item, idx) => (
  <Row key={item.id ?? idx} item={item} />
))}
```

---

## 6) JSX 属性（props）写法大全

### 6.1 字符串与表达式

```jsx
<Component title="hello" />
<Component count={1} />
<Component user={user} />
<Component onSave={() => save(id)} />
```

### 6.2 布尔属性简写

```jsx
<Button disabled />
// 等价于 disabled={true}
```

### 6.3 展开运算符（常用于透传 props）

```jsx
const props = { id: "a", className: "x" };
<div {...props} />
```

注意覆盖顺序：后面的会覆盖前面的

```jsx
<div {...props} className="override" />
```

### 6.4 children 的使用

```jsx
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

---

## 7) JSX 中的事件处理（React 合成事件）

### 7.1 基本

```jsx
function handleClick(e) {
  console.log(e.type);
}
<button onClick={handleClick}>Click</button>
```

### 7.2 传参（别直接调用）

```jsx
<button onClick={() => onDelete(id)}>Delete</button>
```

### 7.3 阻止默认行为

```jsx
<form onSubmit={(e) => { e.preventDefault(); submit(); }}>
  ...
</form>
```

---

## 8) JSX 中的样式写法

### 8.1 className（推荐）

```jsx
<div className="container" />
```

### 8.2 style 内联对象（驼峰属性）

```jsx
<div style={{ marginTop: 12, backgroundColor: "white" }} />
```

### 8.3 条件 className（常见模式）

```jsx
<div className={isActive ? "item active" : "item"} />
```

更工程化：用数组拼接

```jsx
<div className={["item", isActive && "active"].filter(Boolean).join(" ")} />
```

---

## 9) JSX 的“插槽/组合”能力（React 组件设计关键）

### 9.1 children 组合

```jsx
function Layout({ header, children }) {
  return (
    <div>
      <header>{header}</header>
      <main>{children}</main>
    </div>
  );
}

<Layout header={<Nav />}>
  <Page />
</Layout>
```

### 9.2 Render Props（函数作为 children）

```jsx
<List
  items={items}
  renderItem={(item) => <Row key={item.id} item={item} />}
/>
```

---

## 10) JSX 中的常见陷阱与最佳实践

### 10.1 不要在 render 中做“重计算/副作用”

* JSX 渲染阶段应尽量纯：不要请求接口、不要写入 localStorage、不要随机数影响 UI 稳定性。
* 重计算用 `useMemo` 或提前在外面计算。

### 10.2 `dangerouslySetInnerHTML`（慎用）

```jsx
<div dangerouslySetInnerHTML={{ __html: html }} />
```

要确保内容可信或已做 XSS 清洗。

### 10.3 空白与换行

JSX 中文本换行会被压缩成空格；需要显式换行用 `<br />` 或 CSS。

### 10.4 自闭合标签

```jsx
<img src="a.png" alt="" />
<input />
```

---

## 11) JSX 与组件命名规则（非常关键）

* **大写开头**：React 才当作组件

```jsx
<MyButton />   // 组件
<myButton />   // 会被当作 DOM 标签（错误/无效）
```

---

## 12) JSX 进阶：类型与表达能力（你写大型项目会用到）

### 12.1 JSX.Element vs ReactNode（概念）

* `JSX.Element`：一次 `React.createElement` 的结果（更“窄”）
* `ReactNode`：能被渲染的一切（string/number/element/array/null...），更“宽”
  在 TS 的 props 类型定义很常用（你后续学 TS 时会遇到）。

### 12.2 条件渲染保持结构稳定

复杂页面常用“骨架 + 占位”减少布局抖动：

```jsx
return (
  <section>
    <Header />
    {isLoading ? <Skeleton /> : <Content data={data} />}
  </section>
);
```

---

## 13) 经典例子：把 JSX 关键点一次串起来

```jsx
function TodoList({ todos, onToggle, filter }) {
  const visible = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  if (!todos) return null;

  return (
    <div className="todo">
      <h2>Todos ({visible.length})</h2>

      {visible.length === 0 ? (
        <p>No items</p>
      ) : (
        <ul>
          {visible.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => onToggle(t.id)}
                />
                {t.title}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

如果你希望我“更像文档/教材”那样输出：比如按「基础语法 → 条件/列表 → 事件/表单 → 组合模式 → 最佳实践 → 面试常问」每部分再细分成更长的清单与练习题，我也可以直接给你一份“JSX 学习路线 + 练习题 + 常见面试题与标准答法”。你更偏向项目实战还是面试复习？
