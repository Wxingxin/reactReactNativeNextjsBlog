下面给你一套**用 Expo Router 写“X（推特）风格社交 App 导航”**的完整骨架：
✅ **底部 Tabs（首页/搜索/发帖/通知/我的）**
✅ **Stack 详情页（推文详情、个人主页等）**
✅ **Modal 发帖（点击中间“+”弹出发帖页）**
✅ **支持深链：/tweet/123 /user/jack**

你直接按这个目录建文件就能跑。

---

## 1）目录结构（照抄就行）

```txt
app/
  _layout.tsx                 # Root Stack：承载 Tabs + Modal + 详情页
  (tabs)/
    _layout.tsx               # Bottom Tabs
    home.tsx                  # 首页时间线
    search.tsx                # 搜索
    notifications.tsx         # 通知
    me.tsx                    # 我的
  compose.tsx                 # 发帖（Modal）
  tweet/
    [id].tsx                  # 推文详情（Stack）
  user/
    [username].tsx            # 个人主页（Stack）
  settings.tsx                # 设置（Stack）
```

> 说明：`(tabs)` 是**路由分组**，不会出现在 URL 里。

---

## 2）Root Stack：`app/_layout.tsx`

它负责：

* 默认入口是 Tabs
* `compose` 用 Modal 弹出
* `tweet/[id]`、`user/[username]`、`settings` 是普通 Stack 页面

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Tabs（底部导航） */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 发帖：Modal 弹出 */}
      <Stack.Screen
        name="compose"
        options={{
          presentation: "modal",
          title: "发帖",
        }}
      />

      {/* 详情页：正常 push */}
      <Stack.Screen name="tweet/[id]" options={{ title: "推文" }} />
      <Stack.Screen name="user/[username]" options={{ title: "个人主页" }} />
      <Stack.Screen name="settings" options={{ title: "设置" }} />
    </Stack>
  );
}
```

---

## 3）Tabs：`app/(tabs)/_layout.tsx`

这里做一个“X 风格”：

* 4 个正常 Tab
* 中间按钮用 `router.push("/compose")` 打开发帖 Modal
* 图标用 `@expo/vector-icons`（Expo 常用，开箱即用）

```tsx
// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "首页",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "搜索",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 中间“发帖”按钮：不是一个真正页面，用按钮劫持 */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "通知",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          title: "我的",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 用一个“隐藏的 Tab”来放中间按钮逻辑（常见做法：把它做成一个 screen，但不显示） */}
      <Tabs.Screen
        name="__compose_button__"
        options={{
          href: null, // 关键：不生成路由
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push("/compose")}
              style={({ pressed }) => ({
                width: 56,
                height: 56,
                borderRadius: 28,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#1d9bf0", // X 蓝
                marginBottom: 18,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
```

> 注意：这里用到了一个“虚拟 Tab”：`__compose_button__`
>
> * `href: null` 让它**不参与路由**
> * 只负责渲染 TabBar 中间按钮并打开 `/compose` Modal

**还需要创建一个文件**让它不报错：
`app/(tabs)/__compose_button__.tsx`

```tsx
// app/(tabs)/__compose_button__.tsx
export default function Dummy() {
  return null;
}
```

---

## 4）各 Tab 页面示例（最小可跑）

### `app/(tabs)/home.tsx`

```tsx
import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Home Timeline</Text>

      {/* 点进推文详情 */}
      <Link href="/tweet/123">
        <Text style={{ color: "#1d9bf0" }}>打开推文详情 /tweet/123</Text>
      </Link>

      {/* 点进个人主页 */}
      <Link href="/user/jack">
        <Text style={{ color: "#1d9bf0" }}>打开个人主页 /user/jack</Text>
      </Link>
    </View>
  );
}
```

### `app/(tabs)/search.tsx`

```tsx
import { View, Text } from "react-native";

export default function Search() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Search</Text>
    </View>
  );
}
```

### `app/(tabs)/notifications.tsx`

```tsx
import { View, Text } from "react-native";

export default function Notifications() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Notifications</Text>
    </View>
  );
}
```

### `app/(tabs)/me.tsx`

```tsx
import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Me() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Me</Text>
      <Link href="/settings">
        <Text style={{ color: "#1d9bf0" }}>设置</Text>
      </Link>
    </View>
  );
}
```

---

## 5）发帖 Modal：`app/compose.tsx`

```tsx
import { useRouter } from "expo-router";
import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";

export default function Compose() {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>发帖</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="有什么新鲜事？"
        multiline
        style={{
          minHeight: 120,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 12,
          textAlignVertical: "top",
        }}
      />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ddd" }}
        >
          <Text>取消</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            // 这里你接 API 发帖，然后关闭
            router.back();
          }}
          style={{ padding: 12, borderRadius: 10, backgroundColor: "#1d9bf0" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>发布</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## 6）详情页：推文 & 个人主页（动态路由）

### `app/tweet/[id].tsx`

```tsx
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function TweetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>推文详情</Text>
      <Text>tweet id: {id}</Text>
    </View>
  );
}
```

### `app/user/[username].tsx`

```tsx
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function UserProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>个人主页</Text>
      <Text>@{username}</Text>
    </View>
  );
}
```

---

## 7）设置页：`app/settings.tsx`

```tsx
import { View, Text } from "react-native";

export default function Settings() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>设置</Text>
    </View>
  );
}
```

---

## 8）你跑起来需要什么依赖？

如果你是 Expo Router 模板创建的，一般都齐。图标如果缺再装：

```bash
npx expo install @expo/vector-icons
```

---

## 9）这个结构怎么扩展成“真 X”？

你后面一定会加这些（我给你方向）：

* `/home`：FlatList 时间线 + 下拉刷新/分页
* `/tweet/[id]`：评论列表（也是 FlatList）
* `/user/[username]`：Profile Header + Tabs（帖子/回复/媒体/喜欢）
* `/compose`：支持图片选择、@提及、话题
* 登录拦截：`useSegments()` 做路由守卫，把未登录导到 `/login`

---

如果你想更像 X：我可以下一步帮你把 **“个人主页内的二级 Tabs（帖子/回复/媒体/喜欢）”** 用 Expo Router 正确做出来（嵌套 layout + 顶部 Tab 风格），并把整个导航结构整理成可复用模板。你要主页做“顶部 Tab”还是“滚动吸顶的 Tab”？
