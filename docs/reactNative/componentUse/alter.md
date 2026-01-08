我给你把 **React Native 的 ActivityIndicator（加载指示器）** 和 **Alert（系统弹窗）** 用“怎么用 + 常用参数 + 常见坑 + 真实项目写法”整理成一份使用大全。

---

## 1）ActivityIndicator 使用大全（loading 圈）

### 1.1 它适合什么场景

* 页面首次加载（全屏 loading）
* 列表分页加载（footer loading）
* 按钮提交中（按钮里转圈 + 禁用）
* 局部模块加载（卡片/图片/区域）

> 它是一个很轻量的组件，通常配合 `visible` 状态来显示/隐藏。

---

### 1.2 常用 props

* `animating`：是否旋转（默认 true）
* `size`：`"small" | "large"`（iOS/Android都支持）
* `color`：颜色（可选）
* `hidesWhenStopped`（iOS）：`animating={false}` 时是否隐藏（默认 true）
* `style`

---

### 1.3 基础用法（局部 loading）

```jsx
import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function DemoLocalLoading() {
  const loading = true;

  return (
    <View style={{ padding: 16 }}>
      {loading ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <ActivityIndicator size="small" />
          <Text>加载中...</Text>
        </View>
      ) : (
        <Text>内容已加载</Text>
      )}
    </View>
  );
}
```

---

### 1.4 全屏 loading（最常见）

```jsx
import React from "react";
import { View, ActivityIndicator } from "react-native";

export function FullScreenLoading() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
```

---

### 1.5 覆盖在页面上的“遮罩 loading”（防重复点击）

```jsx
import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export function OverlayLoading({ visible, text = "处理中..." }) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ padding: 16, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.95)" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, textAlign: "center" }}>{text}</Text>
      </View>
    </View>
  );
}
```

---

### 1.6 列表分页 footer loading（FlatList 常用）

```jsx
<ListFooterComponent={
  loadingMore ? (
    <View style={{ padding: 16 }}>
      <ActivityIndicator />
    </View>
  ) : null
}
/>
```

---

### 1.7 常见坑 & 建议

* **不要一直转**：请求失败/超时要能退出 loading，并给提示。
* 全屏 overlay 要注意层级：需要 `position: "absolute"` 覆盖父容器（父容器最好 `flex:1`）。
* 按钮 loading 时应该 **禁用点击**（Pressable disabled），避免重复提交。

---

---

## 2）Alert 使用大全（系统弹窗）

### 2.1 Alert 是什么

* 调用系统原生弹窗（iOS/Android风格不同）
* 适合：删除确认、退出提示、权限提示、错误提示

导入：

```js
import { Alert } from "react-native";
```

---

### 2.2 基础用法（提示）

```jsx
Alert.alert("提示", "操作成功");
```

---

### 2.3 带按钮（确认 / 取消）

```jsx
Alert.alert(
  "删除确认",
  "确定要删除这条记录吗？",
  [
    { text: "取消", style: "cancel" },
    { text: "删除", style: "destructive", onPress: () => console.log("deleted") },
  ],
  { cancelable: true }
);
```

按钮对象常用字段：

* `text`：按钮文字
* `onPress`：点击回调
* `style`：`"default" | "cancel" | "destructive"`

配置项（第三个参数后面的 options）：

* `cancelable`（Android）：点遮罩能否关闭
* `onDismiss`：弹窗消失回调（部分平台支持）

---

### 2.4 输入弹窗（iOS 支持，Android 不支持）

> `Alert.prompt` 基本是 iOS-only。Android 想要输入框弹窗，通常用自定义 Modal。

```jsx
// iOS only
Alert.prompt(
  "输入昵称",
  "请填写新的昵称",
  [
    { text: "取消", style: "cancel" },
    { text: "确定", onPress: (value) => console.log("value:", value) },
  ],
  "plain-text",
  "默认值"
);
```

---

### 2.5 错误提示（建议统一封装）

现实项目里你会到处报错提示，建议封装一个方法：

```js
import { Alert } from "react-native";

export function alertError(err) {
  const msg =
    typeof err === "string"
      ? err
      : err?.message || "发生未知错误，请稍后再试";
  Alert.alert("出错了", msg, [{ text: "知道了" }]);
}
```

---

### 2.6 常见坑 & 建议

* Alert 是**同步触发**，但按钮回调里通常做异步请求，记得处理 loading/错误。
* Android 的 `Alert.prompt` 不可用：需要你自己用 `Modal + TextInput` 做。
* 不要在短时间内连续弹多个 Alert：用户体验很差。必要时做“节流”。

---

## 3）实战组合：提交按钮 + loading + 成功/失败 Alert

```jsx
import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";

export default function SubmitDemo() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 模拟请求
      await new Promise((r) => setTimeout(r, 900));

      Alert.alert("成功", "已提交");
    } catch (e) {
      Alert.alert("失败", e?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Pressable
        onPress={submit}
        disabled={submitting}
        style={({ pressed }) => ({
          height: 44,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: submitting ? "#aaa" : "#2f80ed",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        {submitting ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator color="#fff" />
            <Text style={{ color: "#fff" }}>提交中...</Text>
          </View>
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>提交</Text>
        )}
      </Pressable>
    </View>
  );
}
```

---

## 4）一句话总结（让你记牢）

* **ActivityIndicator**：用来表达“正在加载”，一定要配合状态控制 + 错误退出。
* **Alert**：用来做“系统级确认/提示”，输入框需求（尤其 Android）优先考虑自定义 Modal。

---

如果你下一步想做得更像“项目级”，我可以直接给你一个**自定义 Modal 输入弹窗**（Android/iOS通用），并且把它封装成 `showConfirm()` / `showPrompt()` 这种 API，跟 Alert 一样好用。你要不要？
