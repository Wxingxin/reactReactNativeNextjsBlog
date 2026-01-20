我直接把 **useReducer 的知识点 + 经典案例** 打包给你，讲完你基本就能“看懂 Redux，再自己封装一套全局状态管理”了。

---

## 一、useReducer 是什么？一句话版

> **用“reducer 函数”来管理 state 的 useState。**

把原来：

```jsx
const [count, setCount] = useState(0);
```

换成：

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

* `state`：当前状态（可以是对象/数组/复杂结构）
* `dispatch(action)`：派发“我要做什么”
* `reducer(state, action)`：**纯函数**，接收旧 state 和 action，返回新 state

---

## 二、基本语法

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init?);
```

* `reducer`: `(state, action) => newState`
* `initialArg`: 初始值或用于 lazy init 的参数
* `init`: (可选) 惰性初始化函数

### 最简单例子：计数器

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return initialState;
    default:
      return state; // 一定要有 default
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </div>
  );
}
```

---

## 三、useState vs useReducer 什么时候用？

**用 useState：**

* 状态比较简单：1–3 个字段
* 更新逻辑不复杂，`setX(x+1)` 就能搞定

**用 useReducer：**

* 状态是一个“对象/树”，字段比较多
* 更新逻辑多而复杂：if/else、switch 很多
* 一个操作要同时改多个字段
* 你希望把“逻辑”集中放在 reducer，不想到处写 setState

可以这样理解：

> 逻辑简单 → `useState`
> 逻辑复杂、有很多“动作” → `useReducer`

---

## 四、useReducer 的 3 个核心知识点

### 1️⃣ state 是只读的（不可变）

在 reducer 里面 **不能直接改 state**：

```jsx
// ❌ 错误
state.count++;
return state;

// ✅ 正确
return { ...state, count: state.count + 1 };
```

---

### 2️⃣ action 是“描述你想做什么”的对象

常见写法：

```js
{ type: "add_todo", payload: { title: "学习 useReducer" } }

{ type: "set_name", name: "张三" }

{ type: "toggle", id: 123 }
```

建议统一格式：

```js
{ type: "xxx", payload: ... }
```

---

### 3️⃣ reducer 必须是 “纯函数”

**纯函数：**

* 输入相同 `(state, action)` → 输出一定相同
* 不做副作用：不请求接口、不操作 DOM、不改外部变量

比如：

```js
function reducer(state, action) {
  // ✅ 只根据 state + action 推导出新的 state
  // ❌ 不在里面 fetch、setTimeout、localStorage.setItem 等
}
```

---

## 五、useReducer 经典案例 1：Todo List

一个完整一点的例子，帮你体会 useReducer 的感觉。

### 1. 定义 state & reducer

```jsx
const initialState = {
  todos: [],
  filter: "all", // all / active / completed
};

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const newTodo = {
        id: Date.now(),
        text: action.payload.text,
        done: false,
      };
      return { ...state, todos: [...state.todos, newTodo] };
    }
    case "toggle": {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, done: !todo.done }
            : todo
        ),
      };
    }
    case "remove": {
      return {
        ...state,
        todos: state.todos.filter(
          (todo) => todo.id !== action.payload.id
        ),
      };
    }
    case "set_filter": {
      return {
        ...state,
        filter: action.payload.filter,
      };
    }
    default:
      return state;
  }
}
```

### 2. 在组件里使用

```jsx
function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [text, setText] = useState("");

  const filteredTodos = state.todos.filter((todo) => {
    if (state.filter === "active") return !todo.done;
    if (state.filter === "completed") return todo.done;
    return true;
  });

  const onAdd = () => {
    if (!text.trim()) return;
    dispatch({ type: "add", payload: { text } });
    setText("");
  };

  return (
    <div>
      <h2>Todo List (useReducer)</h2>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入待办"
      />
      <button onClick={onAdd}>添加</button>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => dispatch({ type: "set_filter", payload: { filter: "all" } })}>
          全部
        </button>
        <button onClick={() => dispatch({ type: "set_filter", payload: { filter: "active" } })}>
          未完成
        </button>
        <button onClick={() => dispatch({ type: "set_filter", payload: { filter: "completed" } })}>
          已完成
        </button>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  dispatch({
                    type: "toggle",
                    payload: { id: todo.id },
                  })
                }
              />
              <span
                style={{
                  textDecoration: todo.done ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>
            </label>
            <button
              onClick={() =>
                dispatch({
                  type: "remove",
                  payload: { id: todo.id },
                })
              }
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

你会发现：
所有的“增删改查逻辑”都集中在 `reducer`，组件里只管 `dispatch({ type: 'xxx' })`，非常清晰。

---

## 六、useReducer 经典案例 2：复杂表单状态

比如一个多字段的表单：`name、email、age、同意条款...`

### 1. 一般写法（useState / useState 对象）

```jsx
const [form, setForm] = useState({
  name: "",
  email: "",
  age: "",
  agree: false,
});

// 更新字段
setForm(prev => ({ ...prev, [field]: value }));
```

状态稍微复杂一些，用 useReducer 会更顺：

### 2. 用 useReducer 重写

```jsx
const initialForm = {
  name: "",
  email: "",
  age: "",
  agree: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case "update_field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "reset":
      return initialForm;
    default:
      return state;
  }
}

function Form() {
  const [form, dispatch] = useReducer(formReducer, initialForm);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "update_field",
      field: name,
      value: type === "checkbox" ? checked : value,
    });
  };

  return (
    <form>
      <input
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="姓名"
      />
      <input
        name="email"
        value={form.email}
        onChange={onChange}
        placeholder="邮箱"
      />
      <input
        name="age"
        value={form.age}
        onChange={onChange}
        placeholder="年龄"
      />
      <label>
        <input
          type="checkbox"
          name="agree"
          checked={form.agree}
          onChange={onChange}
        />
        我已阅读并同意条款
      </label>

      <button
        type="button"
        onClick={() => dispatch({ type: "reset" })}
      >
        重置
      </button>
    </form>
  );
}
```

---

## 七、useReducer 进阶：惰性初始化（lazy init）

当初始 state 需要复杂计算、或从 localStorage 读取时，可以这样：

```jsx
function init(initialArg) {
  // 比如从 localStorage 恢复
  const saved = localStorage.getItem("count");
  return saved ? { count: Number(saved) } : { count: initialArg };
}

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, 0, init);

  useEffect(() => {
    localStorage.setItem("count", state.count);
  }, [state.count]);

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: "increment" })}>
        +
      </button>
    </div>
  );
}
```

`useReducer(reducer, initialArg, init)`：

* 第三参 `init` 只在第一次渲染时执行一次
* 返回值作为真正的初始 state

---

## 八、useReducer + useContext = 简易全局状态管理

这是“从 useReducer 走向 Redux 思想”的关键一步。

### 1. 创建 Context + Provider

```jsx
const StoreContext = React.createContext(null);

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch }; // 提供给全局
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore 必须在 StoreProvider 中使用");
  return ctx;
}
```

### 2. 在任意组件中使用“全局 state”

```jsx
function Counter() {
  const { state, dispatch } = useStore();
  return (
    <div>
      <p>全局 count: {state.count}</p>
      <button onClick={() => dispatch({ type: "inc" })}>+1</button>
    </div>
  );
}

// 在根组件包一层
function App() {
  return (
    <StoreProvider>
      <Counter />
      <OtherComponent />
    </StoreProvider>
  );
}
```

> 这套就是“迷你版 Redux + React-Redux”，但完全用 Hooks 实现。

---

## 九、useReducer 和 Redux 有什么区别？

* API 结构很像：`state + reducer + action + dispatch`
* 区别主要是：

  * `useReducer` 只能在组件树内部用
  * Redux 是一个独立库，可以跨框架
  * Redux 有中间件、DevTools、时间旅行等完善生态
  * useReducer + useContext 可以做简单全局，但项目很大时可考虑 Redux / Zustand / Jotai 等

你可以把 `useReducer` 当成：

> **理解 Redux 思想的最佳练习工具**

---

## 十、最后帮你捋一下记忆重点

1. `const [state, dispatch] = useReducer(reducer, initialState)`
2. `reducer(state, action)` 纯函数，**不能**直接改 state
3. `action` 一般写成 `{ type, payload }`
4. 状态简单 → useState；状态复杂、有一堆操作 → useReducer
5. 惰性初始化：`useReducer(reducer, initialArg, init)`
6. 搭配 `useContext` 可以做全局状态（迷你 Redux）

---

如果你愿意，下一步我可以帮你：

* 把 **useReducer + useContext** 打造成一个项目可用的 **简单全局状态库**（比如像你之前想手写 zustand / redux 那样）
* 或者给你一份 **“Redux 源码和 useReducer 的对照理解指南”**
* 或者用一个稍微真实一点的业务例子（比如购物车 / 登录用户 / 权限）带你完整实现一遍 useReducer 管理逻辑

你比较想往哪个方向继续深入？