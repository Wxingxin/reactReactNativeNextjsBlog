我给你把 React Native 的 **Text、Image、ImageBackground、StatusBar** 按“核心概念 → 常用属性 → 常见坑 → 实战例子”整理成一份使用大全，直接当笔记用。

---

## 1）Text 使用大全

### 1.1 Text 是什么（你必须知道的点）

* RN 里**只有 Text 能直接显示文字**，`View` 不能直接渲染字符串。
* `Text` **支持嵌套**：子 Text 会继承父 Text 的样式（很常用来做高亮/局部变色）。
* `Text` 默认是**行内布局**，但在 RN 里样式更像 Flex + 文本的组合。

### 1.2 常用 props（高频）

**内容/交互**

* `onPress`：点击文本（做“查看更多/链接”）
* `selectable`：是否可复制（Android/iOS 支持情况略有差异）
* `numberOfLines={n}`：限制行数（超出会省略）
* `ellipsizeMode="tail" | "head" | "middle" | "clip"`：省略方式
* `allowFontScaling`：是否跟随系统字体缩放
* `suppressHighlighting`：按下时不高亮（iOS）
* `onLongPress`：长按

**事件（做埋点/布局）**

* `onLayout`：获取布局尺寸
* `onTextLayout`：获取每行信息（做“展开/收起”判断）

### 1.3 常用 style（你会天天写）

* `fontSize`
* `fontWeight`：注意 Android 对某些字体不完整
* `color`
* `lineHeight`：非常重要，文字看起来舒服全靠它
* `letterSpacing`
* `textAlign: "left" | "center" | "right"`
* `textAlignVertical`（Android 常用）
* `textDecorationLine: "underline" | "line-through"`
* `includeFontPadding`（Android 专用，去掉字体上下内边距，排版更贴合）
* `textTransform: "none" | "uppercase" | "lowercase" | "capitalize"`

### 1.4 Text 嵌套高亮示例

```jsx
<Text style={{ fontSize: 16, color: "#333" }}>
  你好，<Text style={{ color: "tomato", fontWeight: "700" }}>重点内容</Text> 在这里
</Text>
```

### 1.5 多行省略 + “展开/收起”（常见需求）

```jsx
import React, { useMemo, useState } from "react";
import { Text, Pressable, View } from "react-native";

export default function ExpandableText({ content }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const lines = expanded ? undefined : 3;

  return (
    <View>
      <Text
        numberOfLines={lines}
        onTextLayout={(e) => {
          // 如果实际行数 > 3 才显示“展开”
          setCanExpand(e.nativeEvent.lines.length > 3);
        }}
        style={{ fontSize: 14, lineHeight: 20, color: "#333" }}
      >
        {content}
      </Text>

      {canExpand && (
        <Pressable onPress={() => setExpanded((v) => !v)} style={{ marginTop: 6 }}>
          <Text style={{ color: "dodgerblue" }}>{expanded ? "收起" : "展开"}</Text>
        </Pressable>
      )}
    </View>
  );
}
```

### 1.6 常见坑

* `Text` 里想垂直居中：不要只靠 `lineHeight` 瞎调，尽量让容器 `justifyContent/alignItems` 配合。
* Android 字体上下空隙大：试试 `includeFontPadding: false`。
* `fontWeight` 在 Android 有时没效果：看你使用的字体是否包含对应字重。

---

## 2）Image 使用大全

### 2.1 Image 的三种常见来源

1. 本地静态资源（打包进 app）

```jsx
<Image source={require("./assets/avatar.png")} />
```

2. 网络图片

```jsx
<Image source={{ uri: "https://xxx.com/a.png" }} />
```

3. base64（一般不推荐，内存开销大）

```jsx
<Image source={{ uri: "data:image/png;base64,xxxx" }} />
```

### 2.2 必会 props

* `source`：图片来源（本地 require / uri）
* `style`：必须要有宽高（**网络图尤其**，不然可能不显示）
* `resizeMode`：`cover | contain | stretch | repeat | center`
* `onLoad / onLoadStart / onLoadEnd / onError`：加载状态/失败兜底
* `defaultSource`：占位图（iOS 支持更好）
* `blurRadius`：模糊（可做毛玻璃背景）
* `fadeDuration`（Android）：淡入时间
* `loadingIndicatorSource`（部分平台支持）

### 2.3 resizeMode 怎么选（很关键）

* `cover`：铺满容器，可能裁剪（头像、封面图常用）
* `contain`：完整显示，可能留白（展示完整图片）
* `stretch`：拉伸变形（一般少用）
* `center`：居中不缩放
* `repeat`：平铺（小纹理背景）

示例：

```jsx
<Image
  source={{ uri: imgUrl }}
  style={{ width: 120, height: 120, borderRadius: 12 }}
  resizeMode="cover"
/>
```

### 2.4 例子：带 loading + error fallback

```jsx
import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";

export default function SmartImage({ uri }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={{ width: 160, height: 120, borderRadius: 12, overflow: "hidden", backgroundColor: "#eee" }}>
      <Image
        source={error ? require("./assets/fallback.png") : { uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />

      {loading && (
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 6 }}>加载中...</Text>
        </View>
      )}
    </View>
  );
}
```

> 注意：上面用了 `StyleSheet.absoluteFillObject`，你也可以用 `position: "absolute"` 手写。

### 2.5 常见坑

* **网络图必须有宽高**（或父容器有尺寸 + 子用 100%），否则经常“啥也不显示”。
* `borderRadius` + Image：有时需要外层 `View` 加 `overflow: "hidden"` 才能裁切圆角。
* 大图会吃内存：尽量用服务端裁剪成合适尺寸（头像别上 4000px 原图）。

---

## 3）ImageBackground 使用大全（背景图容器）

### 3.1 它解决什么？

当你需要**在图片上叠内容**（标题、按钮、渐变、蒙层等），用 `ImageBackground` 最顺手。

### 3.2 常用 props

* `source`：同 Image
* `resizeMode`
* `imageStyle`：只作用于“图片层”，比如圆角
* `style`：作用于容器（决定布局）
* `children`：叠在图片上的内容

### 3.3 例子：卡片封面 + 蒙层 + 标题

```jsx
import React from "react";
import { ImageBackground, View, Text, Pressable } from "react-native";

export default function CoverCard() {
  return (
    <ImageBackground
      source={{ uri: "https://picsum.photos/600/400" }}
      style={{ height: 180, borderRadius: 16, overflow: "hidden", justifyContent: "flex-end" }}
      imageStyle={{ borderRadius: 16 }}
      resizeMode="cover"
    >
      {/* 黑色蒙层，增强文字可读性 */}
      <View style={{ backgroundColor: "rgba(0,0,0,0.35)", padding: 12 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>标题</Text>
        <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>副标题描述</Text>

        <Pressable style={{ marginTop: 10, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8 }}>
          <Text style={{ color: "#fff" }}>查看</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
```

### 3.4 常见坑

* `borderRadius` 不生效：用 `imageStyle` + 外层 `overflow: "hidden"`。
* 内容遮挡：合理加蒙层，否则白字在浅色图上看不清。

---

## 4）StatusBar 使用大全（状态栏控制）

> `StatusBar` 用来控制顶部系统状态栏（时间、电量那条）的 **文字颜色、背景颜色、是否透明、是否隐藏**。不同平台差异很大，所以你要知道关键点。

### 4.1 核心 props

* `barStyle="dark-content" | "light-content" | "default"`

  * 控制状态栏文字/图标颜色
* `backgroundColor`（Android）

  * 状态栏背景色（Android 原生支持）
* `translucent`（Android）

  * 状态栏是否“覆盖在页面上”（沉浸式常用）
* `hidden`

  * 隐藏状态栏
* `animated`

  * 切换是否带动画

### 4.2 最常见的三种场景

#### 场景 A：普通页面（白底黑字）

```jsx
<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
```

#### 场景 B：深色导航（黑底白字）

```jsx
<StatusBar barStyle="light-content" backgroundColor="#000000" />
```

#### 场景 C：沉浸式（图片顶到状态栏下面）

Android 常用：

```jsx
import { StatusBar, View } from "react-native";

export default function Immersive() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* 你的内容需要自己加 paddingTop（通常用 SafeAreaView 或状态栏高度） */}
    </View>
  );
}
```

> iOS 没有 `backgroundColor` 这种直接设置状态栏背景色的概念，背景色通常由你的导航栏/页面背景“透出来”。

### 4.3 推荐搭配：SafeAreaView

* iPhone 刘海/状态栏区域你要考虑安全区
* 沉浸式页面尤其需要

示例（简单版）：

```jsx
import { SafeAreaView, StatusBar, View, Text } from "react-native";

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ padding: 16 }}>
        <Text>内容</Text>
      </View>
    </SafeAreaView>
  );
}
```

### 4.4 常见坑

* **Android**：`translucent` 开了以后，内容会被状态栏盖住，你要手动做顶部间距（SafeArea 或 paddingTop）。
* **iOS**：`backgroundColor` 不一定起作用（它不是 iOS 的主逻辑）。
* 如果你用了 React Navigation（导航库），状态栏可能被它管理，你需要在每个 screen 配置或在 screen 内放 `StatusBar` 控制。

---

## 5）一套“真实项目”组合示例（图片头图 + 状态栏 + 标题）

```jsx
import React from "react";
import { View, Text, StatusBar, ImageBackground, SafeAreaView } from "react-native";

export default function ProfileHeader() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={{ uri: "https://picsum.photos/900/600" }}
        style={{ height: 260, justifyContent: "flex-end" }}
        resizeMode="cover"
      >
        <SafeAreaView>
          <View style={{ padding: 16, backgroundColor: "rgba(0,0,0,0.25)" }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>用户昵称</Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}>这是一段简介</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16 }}>下面是页面内容...</Text>
      </View>
    </View>
  );
}
```

---

如果你想学得更“工程化”，我可以继续给你：

* Text：自定义 `AppText`（统一字体、字号、行高、颜色）
* Image：封装 `SmartImage`（占位图、错误兜底、缓存策略）
* StatusBar：配合 React Navigation 做“每个页面不同状态栏”的最佳实践

你现在项目里用的是 **React Navigation** 吗？如果是，我可以按你导航结构给你一套更贴近项目的写法。
