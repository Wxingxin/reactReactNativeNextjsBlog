我先给你一句话版，然后展开成“**useContext 全攻略 + 经典案例**”。

> **一句话：useContext = 在组件树里“抛一个全局广播”，任何后代组件都能直接收，不用层层传 props。**

---

## 一、useContext 是什么？

React 早就有 context 这个东西，useContext 只是它的 Hooks 写法。

三件套：

1. `createContext` —— 创建一个“上下文频道”
2. `Context.Provider` —— 在某个地方“广播”
3. `useContext` —— 在后代组件中“收听”

---

## 二、最基础用法（从 0 到 1）

### 1. 创建一个 Context

```jsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext("light"); // 这里的 "light" 是默认值
```

### 2. 在上层组件用 Provider 提供 value

```jsx
function App() {
  const [theme, setTheme] = React.useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}
```

### 3. 在任意子组件中使用 useContext 拿到 value

```jsx
function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={() =>
        setTheme(theme === "light" ? "dark" : "light")
      }
    >
      当前主题：{theme}，点击切换
    </button>
  );
}
```

`ThemeSwitcher` 不需要 props，不管它在组件树多深，只要在 `ThemeContext.Provider` 下面，就能拿到 `theme` 和 `setTheme`。

> 这就是 useContext 最核心的作用：**避免“props 层层传递”（prop drilling）**。

---

## 三、默认值 & Provider 的覆盖关系

```jsx
const UserContext = createContext({ name: "游客" });

function ShowUser() {
  const user = useContext(UserContext);
  return <div>你好，{user.name}</div>;
}
```

如果你没有提供 Provider：

```jsx
function App() {
  return <ShowUser />; // 没有 UserContext.Provider
}
```

那 `user` 就会是 `{ name: "游客" }` —— 也就是 `createContext` 时的默认值。

一旦你在上层加了 Provider：

```jsx
function App() {
  const user = { name: "张三" };
  return (
    <UserContext.Provider value={user}>
      <ShowUser />
    </UserContext.Provider>
  );
}
```

那 `ShowUser` 里的值就变成 `张三`，**Provider 会覆盖默认值。**

---

## 四、经典使用场景一：主题 Theme

### 1）定义 Context

```jsx
const ThemeContext = createContext();
```

### 2）做一个 ThemeProvider（推荐写法）

```jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState("light");

  const value = React.useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

> 用 `useMemo` 包一下，避免每次渲染都创建新对象导致所有子组件重渲染。

### 3）自定义 Hook：用起来更舒服

```jsx
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 必须在 <ThemeProvider> 中使用");
  }
  return context;
}
```

### 4）在组件中使用

```jsx
function Toolbar() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <p>当前主题：{theme}</p>
      <button onClick={() => setTheme("light")}>浅色</button>
      <button onClick={() => setTheme("dark")}>深色</button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  );
}
```

> 模式小结：
> `Context` + `Provider` + `useXxx` 自定义 hook = **最推荐的 useContext 用法**。

---

## 五、经典使用场景二：登录用户 Auth

### 1）AuthContext + Provider

```jsx
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);

  const login = async (username, password) => {
    // 伪代码：请求接口
    const fakeUser = { id: 1, name: username };
    setUser(fakeUser);
  };

  const logout = () => setUser(null);

  const value = React.useMemo(
    () => ({ user, login, logout }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内使用");
  }
  return ctx;
}
```

### 2）在任意组件中使用登录信息

```jsx
function UserPanel() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return (
      <div>
        <p>未登录</p>
        <button onClick={() => login("张三", "123456")}>
          登录
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>你好，{user.name}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserPanel />
      {/* 其他组件... */}
    </AuthProvider>
  );
}
```

> 这就是很多项目里常见的 `AuthContext` 模式。

---

## 六、经典使用场景三：语言 i18n

```jsx
const LocaleContext = createContext();

function LocaleProvider({ children }) {
  const [locale, setLocale] = React.useState("zh-CN");

  const t = React.useCallback(
    (key) => {
      const dict = {
        "zh-CN": { hello: "你好" },
        "en-US": { hello: "Hello" },
      };
      return dict[locale][key] || key;
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale 必须在 <LocaleProvider> 中使用");
  return ctx;
}

function Greeting() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div>
      <p>{t("hello")}</p>
      <button onClick={() => setLocale("zh-CN")}>中文</button>
      <button onClick={() => setLocale("en-US")}>English</button>
      <p>当前语言：{locale}</p>
    </div>
  );
}
```

---

## 七、useContext + useReducer = 简易全局状态管理

这个你前面已经看到过类似 Redux / Zustand 的手写版本，用 useContext + useReducer 能轻松做一个全局 store。

### 1）创建 StoreContext + Provider

```jsx
const StoreContext = createContext(null);

const initialState = { count: 0, user: null };

function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { ...state, count: state.count + 1 };
    case "set_user":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const value = React.useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore 必须在 <StoreProvider> 中使用");
  return ctx;
}
```

### 2）组件中用 useStore

```jsx
function Counter() {
  const { state, dispatch } = useStore();
  return (
    <div>
      <p>count: {state.count}</p>
      <button onClick={() => dispatch({ type: "inc" })}>+1</button>
    </div>
  );
}
```

这样整个项目就有了一个 **“简单全局 store”**，这个套路在中小项目里非常好用。

---

## 八、常见坑 & 性能问题

### ⚠️ 1. Context value 是对象时，记得 useMemo 包一下

```jsx
// ❌ 每次渲染都会创建新对象，导致所有 useContext 的子组件重渲染
<SomeContext.Provider value={{ a, b, c }}>
  {children}
</SomeContext.Provider>

// ✅ 用 useMemo 固定引用
const value = useMemo(() => ({ a, b, c }), [a, b, c]);
<SomeContext.Provider value={value}>{children}</SomeContext.Provider>
```

---

### ⚠️ 2. useContext 会让使用它的组件在 value 变化时全部重渲染

也就是说：

* 某个 Context 下挂了 20 个组件
* 只要 value 变一次（引用变），20 个都要重新 render 一遍

优化方式：

* 拆 Context：比如 `ThemeContext` 跟 `AuthContext` 分开
* 把不需要频繁变化的部分放一个 Context
* 或在子组件里用 `memo` 做进一步优化

---

### ⚠️ 3. useContext 不是“万能全局变量”

不要把所有东西都塞进 context：

* 某些只和某一小块组件有关的 state，用普通 `useState` 就好
* Context 更适合 **全局配置、登录信息、主题、语言、全局 store** 等

---

### ⚠️ 4. 不要在 Context 里做异步副作用逻辑太多

尽量把请求、复杂逻辑写在 Provider 组件里，然后把结果通过 value 往下传，而不是塞到 `createContext` 的默认值里的函数里乱搞。

---

## 九、一张脑内小图帮你记忆（文字版）

* `createContext(defaultValue)`
  → 开了一个频道：ThemeChannel / AuthChannel…

* `Context.Provider value={xxx}`
  → 在一棵子树上“广播”了 xxx

* `useContext(Context)`
  → 在这棵子树里任何地方，都能“收听”到同一个 xxx

* 配合自定义 Hook（`useTheme` / `useAuth` / `useStore` 等）
  → 用起来会非常丝滑

---

如果你愿意，下一步我可以帮你：

1. **根据你现在的项目结构**，设计一个实际可用的

   * ThemeContext
   * AuthContext
   * 全局 Store 的组织方式
2. 或者带你从 0 写一套：`useContext + useReducer` → 模仿一个迷你 Redux / Zustand 全局管理。
3. 或者做一套 **React Hooks 总结脑图**：useState / useEffect / useReducer / useContext 放在一起对比记忆。

你现在是在做什么类型的项目？后台管理、博客、还是小工具？我可以按你当前场景给一套“落地版 useContext 方案”。