好，这一组 **TextInput / Pressable / Button / Switch** 是 React Native 里**最核心的交互组件**。我按**真实项目思路**给你讲：
👉「它是干嘛的 → 常用 props → 常见坑 → 实战示例 → 什么时候用它而不用别的」

你可以直接当**长期参考笔记**。

---

# 一、TextInput 使用大全（输入的核心）

## 1️⃣ TextInput 是什么

* RN 里**唯一的文本输入组件**
* 本质：**受控组件（推荐）或非受控组件**
* 登录、搜索、表单、聊天输入框，全靠它

---

## 2️⃣ 最常用 props（必须掌握）

### ① 值与变化（最重要）

```jsx
value           // 输入框的值（受控）
onChangeText    // 文本变化回调
defaultValue    // 非受控初始值
```

**推荐用法（受控）**

```jsx
const [text, setText] = useState("");

<TextInput
  value={text}
  onChangeText={setText}
/>
```

---

### ② 输入类型 & 行为

```jsx
placeholder
placeholderTextColor

keyboardType
// "default" | "numeric" | "phone-pad" | "email-address" | "decimal-pad"

secureTextEntry   // 密码
maxLength
editable          // 是否可编辑
```

---

### ③ 焦点 & 键盘控制

```jsx
autoFocus
onFocus
onBlur
returnKeyType     // "done" | "next" | "search" | "send"
onSubmitEditing  // 回车 / 搜索 / 发送
blurOnSubmit
```

---

### ④ 多行输入

```jsx
multiline
numberOfLines     // Android 更有用
textAlignVertical // Android 必备："top"
```

---

### ⑤ 样式相关

```jsx
style
selectionColor    // 光标颜色
cursorColor       // 新版本支持
```

---

## 3️⃣ TextInput 常见坑（重点）

❌ **只写 onChangeText，不写 value**

> 会变成“半受控”，状态容易乱

❌ **Android 多行输入不顶上**

```js
textAlignVertical: "top"
```

❌ **placeholder 颜色不统一**

```js
placeholderTextColor="#999"
```

❌ **键盘遮挡输入框**
👉 要配合 `KeyboardAvoidingView` 或 ScrollView

---

## 4️⃣ 实战示例

### ✅ 登录输入框（账号 + 密码）

```jsx
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

<TextInput
  value={username}
  onChangeText={setUsername}
  placeholder="请输入账号"
  keyboardType="email-address"
  autoCapitalize="none"
  style={styles.input}
/>

<TextInput
  value={password}
  onChangeText={setPassword}
  placeholder="请输入密码"
  secureTextEntry
  style={styles.input}
/>
```

---

### ✅ 搜索框（点击键盘搜索）

```jsx
<TextInput
  placeholder="搜索"
  returnKeyType="search"
  onSubmitEditing={(e) => {
    console.log("搜索：", e.nativeEvent.text);
  }}
  style={styles.search}
/>
```

---

# 二、Pressable 使用大全（推荐主力）

## 1️⃣ Pressable 是什么

👉 **现代 RN 推荐的点击组件**

比 `TouchableOpacity` 强在哪？

* 能感知 **press / hover / focus / longPress**
* 支持 **函数式 style**（按压态）

📌 **真实项目：90% 按钮都用 Pressable**

---

## 2️⃣ 核心 props

### ① 事件

```jsx
onPress
onLongPress
onPressIn
onPressOut
disabled
```

---

### ② 按压态样式（重点）

```jsx
style={({ pressed }) => ({
  opacity: pressed ? 0.6 : 1,
})}
```

---

## 3️⃣ 实战示例

### ✅ 通用按钮（推荐写法）

```jsx
<Pressable
  onPress={() => console.log("点击")}
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.7 },
  ]}
>
  <Text style={styles.buttonText}>提交</Text>
</Pressable>
```

---

### ✅ 图标按钮

```jsx
<Pressable onPress={onBack} hitSlop={10}>
  <Icon name="arrow-left" size={24} />
</Pressable>
```

---

## 4️⃣ 常见坑

❌ Pressable 里文字没反应
👉 事件是绑在 Pressable 上的，不是 Text

❌ 没处理 disabled 样式
👉 pressed + disabled 都要考虑

---

# 三、Button 使用大全（⚠️ 真实项目很少用）

## 1️⃣ Button 是什么

* RN 自带的**最基础按钮**
* **几乎不能自定义样式**

📌 **结论：学习可以，用在 Demo；项目基本不用**

---

## 2️⃣ Props

```jsx
title
onPress
color        // 只能改颜色
disabled
```

---

## 3️⃣ 示例

```jsx
<Button
  title="保存"
  onPress={() => console.log("保存")}
  color="#4CAF50"
/>
```

---

## 4️⃣ 为什么不推荐？

* 不能自定义高度 / 圆角 / 字体
* Android / iOS 样式不一致
* 无法实现复杂交互

👉 **用 Pressable + Text 自己封装按钮**

---

# 四、Switch 使用大全（开关）

## 1️⃣ Switch 是什么

* 布尔值切换（true / false）
* 设置页、隐私选项必备

---

## 2️⃣ 核心 props

```jsx
value
onValueChange
disabled

trackColor
thumbColor
ios_backgroundColor
```

---

## 3️⃣ 示例（推荐写法）

```jsx
const [enabled, setEnabled] = useState(false);

<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: "#ccc", true: "#81b0ff" }}
  thumbColor={enabled ? "#2196f3" : "#f4f3f4"}
/>
```

---

## 4️⃣ 搭配文字（真实场景）

```jsx
<View style={styles.row}>
  <Text>接收通知</Text>
  <Switch value={enabled} onValueChange={setEnabled} />
</View>
```

---

## 5️⃣ 常见坑

❌ 忘了控制 value
👉 Switch **必须是受控组件**

❌ iOS 背景色不生效
👉 用 `ios_backgroundColor`

---

# 五、什么时候用哪个？（面试 & 实战）

| 需求      | 推荐组件      |
| ------- | --------- |
| 文本输入    | TextInput |
| 普通按钮    | Pressable |
| 图标点击    | Pressable |
| 快速 Demo | Button    |
| 开关选项    | Switch    |

---

# 六、真实项目最佳实践（非常重要）

### ✅ 1. 自己封装组件

```txt
components/
 ├── AppInput.tsx
 ├── AppButton.tsx
 ├── AppSwitch.tsx
```

统一：

* 字体
* 颜色
* 圆角
* 交互反馈

---

### ✅ 2. 表单统一用受控组件

```js
value + onChangeText
value + onValueChange
```

---

### ✅ 3. Button 永远用 Pressable 实现

---

如果你愿意，**下一步我可以直接帮你：**

* 封装一个【企业级 Button 组件】
* 写一个【完整登录表单（含校验 + 键盘处理）】
* 或者把 **TextInput + Switch + Pressable** 做成一个【设置页完整示例】

你现在是在写 **表单页 / 登录页 / 设置页** 哪一种？我可以直接按你的场景给你一套成品代码。
