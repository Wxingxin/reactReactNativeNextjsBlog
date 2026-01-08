下面这份是 **Expo 路由（Expo Router）知识点 + 使用大全**，我按**“从 0 到项目级”**的顺序讲清楚，**不只教你怎么写，还告诉你为什么这么写、什么时候这么用**。

> Expo 路由的官方方案叫 **Expo Router**，由 **Expo** 官方维护
> 👉 本质：**基于文件系统的路由（File-based Routing）**

---

# 一、Expo Router 是什么（一句话讲透）

> **Expo Router = 用“文件夹和文件名”来决定页面和导航结构**

你不再需要手写：

* `createStackNavigator`
* `createBottomTabNavigator`
* `NavigationContainer`

而是：

```txt
app/
 ├── index.tsx        → /
 ├── profile.tsx     → /profile
 └── settings.tsx    → /settings
```

👉 **文件 = 页面，文件夹 = 路由层级**

---

# 二、为什么 Expo 要出 Router？（核心动机）

传统 React Navigation 的痛点：

* 导航配置文件很长
* Stack / Tab / Drawer 混在一起
* 页面一多就难维护
* 新人不直观

Expo Router 的目标：

| 传统方式   | Expo Router |
| ------ | ----------- |
| JS 配导航 | 文件结构即导航     |
| 手动注册   | 自动发现        |
| 心智负担大  | 直观          |
| 易写错    | 约定优于配置      |

👉 **你一眼就能“看到整个 App 的页面结构”**

---

# 三、启用 Expo Router（必须知道）

### 1️⃣ 创建项目（推荐）

```bash
npx create-expo-app myApp
cd myApp
```

选择模板时：

* ✅ **Blank (with Expo Router)**

---

### 2️⃣ 关键入口文件

```txt
app/
 └── _layout.tsx   👈 路由的“骨架文件”
```

Expo Router **必须有 `_layout.tsx`**。

---

# 四、最基础的路由规则（重点）

## 1️⃣ 根页面 `/`

```txt
app/index.tsx
```

```tsx
export default function Home() {
  return <Text>Home</Text>;
}
```

访问路径：

```txt
/
```

---

## 2️⃣ 普通页面

```txt
app/profile.tsx
```

路径：

```txt
/profile
```

---

## 3️⃣ 多级路由（文件夹即层级）

```txt
app/user/
 ├── index.tsx      → /user
 └── detail.tsx     → /user/detail
```

---

# 五、_layout.tsx（非常非常重要）

> `_layout.tsx` 决定**当前目录下页面“怎么跳、怎么显示”**

---

## 1️⃣ Stack 布局（最常见）

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "首页" }} />
    </Stack>
  );
}
```

👉 相当于 `createNativeStackNavigator`

---

## 2️⃣ Tab 布局（底部导航）

```txt
app/(tabs)/
 ├── _layout.tsx
 ├── index.tsx
 └── profile.tsx
```

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "首页" }} />
      <Tabs.Screen name="profile" options={{ title: "我的" }} />
    </Tabs>
  );
}
```

路径：

```txt
/          → 首页
/profile  → 我的
```

---

## 3️⃣ Stack + Tabs 组合（真实项目）

```txt
app/
 ├── _layout.tsx      // Stack
 ├── (tabs)/          // Tab
 │    ├── _layout.tsx
 │    ├── index.tsx
 │    └── profile.tsx
 └── login.tsx
```

结构含义：

* **登录页不在 Tab**
* Tab 页在主界面

这是**企业级最常见结构**

---

# 六、路由跳转 API（必会）

Expo Router 提供 `useRouter / Link`

---

## 1️⃣ useRouter（命令式）

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

router.push("/profile");
router.replace("/login");
router.back();
```

### 常用方法

| 方法      | 说明 |
| ------- | -- |
| push    | 压栈 |
| replace | 替换 |
| back    | 返回 |
| reload  | 重载 |

---

## 2️⃣ Link（声明式，推荐）

```tsx
import { Link } from "expo-router";

<Link href="/profile">
  <Text>去个人页</Text>
</Link>
```

优点：

* 更像 Web
* 可读性高
* 不易出错

---

# 七、动态路由（重点、常考）

## 1️⃣ 单参数路由

```txt
app/post/[id].tsx
```

访问：

```txt
/post/123
```

获取参数：

```tsx
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams();
```

---

## 2️⃣ 多参数

```txt
app/user/[uid]/[tab].tsx
```

```ts
const { uid, tab } = useLocalSearchParams();
```

---

## 3️⃣ 可选参数（了解）

```txt
app/search/[[query]].tsx
```

---

# 八、路由分组（不会出现在 URL 中）

```txt
app/(auth)/
 ├── login.tsx
 └── register.tsx
```

访问路径：

```txt
/login
/register
```

👉 `(auth)` **只是逻辑分组，不影响路径**

---

# 九、页面配置 options（标题、返回按钮等）

```tsx
import { Stack } from "expo-router";

<Stack.Screen
  name="profile"
  options={{
    title: "个人中心",
    headerShown: true,
  }}
/>
```

也可以在页面里写：

```tsx
import { Stack } from "expo-router";

export default function Page() {
  return (
    <>
      <Stack.Screen options={{ title: "详情" }} />
      <View />
    </>
  );
}
```

---

# 十、获取当前路由信息

```tsx
import { usePathname, useSegments } from "expo-router";

usePathname();  // 当前路径
useSegments();  // 当前路由段数组
```

**常用于：**

* 登录态判断
* 权限控制
* Tab 高亮

---

# 十一、路由守卫（登录拦截，重点）

```tsx
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

export function useAuthGuard(isLogin: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isLogin && !inAuthGroup) {
      router.replace("/login");
    }
  }, [isLogin]);
}
```

👉 **这就是 Expo Router 的“路由中间件”写法**

---

# 十二、Expo Router vs React Navigation（结论）

| 维度   | Expo Router |
| ---- | ----------- |
| 上手   | ⭐⭐⭐⭐⭐       |
| 可维护性 | ⭐⭐⭐⭐⭐       |
| 可读性  | ⭐⭐⭐⭐⭐       |
| 适合新手 | ✅           |
| 企业可用 | ✅           |

👉 **Expo Router 底层仍然是 React Navigation，不是玩具**

---

# 十三、常见错误 & 建议

❌ 忘了 `_layout.tsx`
❌ 文件名和路径写错
❌ 滥用 `replace`
❌ 登录逻辑写在页面里（应抽 hook）

---

# 十四、给你的直接建议（重要）

> 如果你用 Expo
> **路由 100% 用 Expo Router，不要再手写导航**

这是**官方未来方向**，不是实验品。

---

## 我可以继续帮你做什么？

* ✅ 给你一套 **企业级 Expo Router 目录模板**
* ✅ Expo Router + 登录鉴权完整示例
* ✅ Expo Router + Tabs + Modal 实战
* ✅ Expo Router 常见坑位清单

你现在是 **学习阶段 / 毕设 / 正在写 Expo 项目**？
告诉我，我可以直接按你的目标给你下一步路线。
