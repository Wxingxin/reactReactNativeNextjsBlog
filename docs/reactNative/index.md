下面给你一份**React Native（含 Expo）开发中「可能会用到的工具 / 库 / 资源」全景清单**。我按**用途分类 + 是否常用 + 选型建议**整理，**不是堆名词**，而是告诉你**什么时候该用哪个**。

> 你不需要一次全装，这份清单是**“工具箱”**，按项目需要取用。

---

## 一、开发环境 & 工程工具（必备）

### 1️⃣ Node / 包管理

* **Node.js**（必需）
* npm / yarn / pnpm（三选一，团队统一）

**建议**：个人项目用 npm 或 pnpm；团队看规范。

---

### 2️⃣ Expo / RN CLI

* **Expo**（新手 & 快速开发）
* React Native CLI（需要深度原生）

**建议**：90% 项目从 Expo 起步。

---

### 3️⃣ IDE & 调试

* **Visual Studio Code**
* React DevTools
* Expo DevTools / Metro

---

## 二、导航（App 骨架，必用）

* **Expo Router**（Expo 官方，强烈推荐）
* **React Navigation**（底层）

**用法结论**：

* Expo 项目 → Expo Router
* 非 Expo → React Navigation

---

## 三、状态管理（按复杂度选）

### 🔹 轻量（大多数页面）

* React Context + useReducer

### 🔹 中大型项目

* **Redux Toolkit**
* **Zustand**（简单好上手）

**建议**：

* 表单/局部状态 → useState
* 全局登录态/主题 → Zustand 或 Redux Toolkit

---

## 四、网络请求 & 数据层（必用）

### HTTP

* **Axios**（最常用）
* fetch（原生）

### 数据缓存 / 请求状态

* **TanStack Query**（强烈推荐）

  * loading / error / cache / retry 全解决

**结论**：

> **Axios + TanStack Query = 项目级标配**

---

## 五、UI 组件 & 交互（高频）

### 基础组件（RN 自带）

* View / Text / TextInput
* Pressable
* FlatList / ScrollView

### UI 库（按风格选）

* **NativeBase**
* **React Native Paper**
* **Tamagui**（偏高级）

**建议**：

* 学习阶段：自己封装组件
* 商业项目：引 UI 库提效

---

## 六、表单 & 校验（很常见）

* **React Hook Form**
* **Yup** / Zod

**适合**：

* 登录 / 注册
* 设置页
* 复杂表单

---

## 七、动画 & 手势（体验提升）

### 动画

* **React Native Reanimated**（性能最好）
* LayoutAnimation（简单）

### 手势

* **React Native Gesture Handler**

**典型场景**：

* 下拉刷新
* 拖拽
* 卡片滑动
* 底部抽屉

---

## 八、图片 & 多媒体（几乎必用）

### 图片

* RN Image（基础）
* **expo-image**（缓存 + 性能好）

### 图片选择 / 拍照

* **expo-image-picker**
* **expo-camera**

### 音视频

* **expo-av**

---

## 九、设备能力 & 系统 API（Expo 强项）

* **expo-location**
* **expo-notifications**
* **expo-haptics**
* **expo-file-system**
* **expo-updates**（热更新）

---

## 十、本地存储 & 安全

* **AsyncStorage**
* **expo-secure-store**（token/隐私）

---

## 十一、调试 & 质量保障（进阶）

* **Flipper**
* ESLint / Prettier
* TypeScript（强烈建议）

---

## 十二、图标 / 图片 / 设计资源（你一定会用）

### 图标

* **Expo Vector Icons**
* Ionicons / MaterialIcons

### 插画 & 图片

* Unsplash（免费图片）
* Iconfont（阿里图标库）
* Figma（设计稿）

---

## 十三、一个「现实可用」的推荐组合（抄这个）

> **Expo + 社交 / 业务 App 推荐技术栈**

```txt
- Expo + Expo Router
- TypeScript
- Axios + TanStack Query
- Zustand
- Expo Image
- Expo Image Picker
- Expo Notifications
- React Native Reanimated
- React Hook Form + Zod
```

👉 这套可以覆盖 **80% 商业 App**

---

## 十四、重要建议（别走弯路）

* ❌ 不要一开始就装一堆库
* ✅ 先把 **导航 + 列表 + 表单 + 请求** 写顺
* ❌ 不要迷信 UI 库
* ✅ 先理解 RN 原生组件
* ❌ 不要急着 eject
* ✅ Expo 用到瓶颈再说

---

## 接下来我可以继续帮你什么？

我可以直接帮你：

* ✅ 做一份 **“新手必装库最小清单”**
* ✅ 给你 **Expo 项目初始化模板（目录 + 依赖）**
* ✅ 按你现在做的 **社交 App / 毕设 / 商业项目** 给你定制选型

你现在是 **学习阶段 / 写毕业设计 / 已在做项目**？我可以直接按你的阶段给你“只需要用到的那一小部分”。
