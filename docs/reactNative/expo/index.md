下面我把 **Expo 在 React Native 开发中能提供的 API**，按**能力分类 + 使用场景 + 是否常用**给你系统梳理一遍。
你看完这一份，**基本就知道 Expo 能不能满足你的项目需求**了。

---

## 一、先给结论（让你心里有数）

> **Expo 提供的是：一整套“常见 App 原生能力”的 JS API 封装**
> 覆盖了 **80%～90% 普通移动 App 的需求**

它的定位是：
👉 **“不用写原生代码，也能用原生能力”**

---

## 二、Expo API 总览（按功能分类）

> 这些 API 都来自 **Expo SDK**
> 使用方式统一：`npx expo install xxx`

---

## 1️⃣ 设备 & 系统能力（非常常用）

### 📱 设备信息

* `expo-device`

  * 设备型号
  * 系统版本
  * 是否真机 / 模拟器

**使用场景**

* 区分 iOS / Android
* 判断是否支持某些能力

```ts
import * as Device from "expo-device";

Device.modelName;
Device.osVersion;
```

---

### 📡 网络状态

* `expo-network`

```ts
import * as Network from "expo-network";

const state = await Network.getNetworkStateAsync();
```

用于：

* 无网提示
* 弱网处理

---

### 🔋 电池状态

* `expo-battery`

```ts
import * as Battery from "expo-battery";
```

---

## 2️⃣ 媒体能力（最常用一类）

### 📷 相机 & 相册

* `expo-camera`
* `expo-image-picker`

**典型用途**

* 拍照
* 选择头像
* 扫码（Camera）

```ts
import * as ImagePicker from "expo-image-picker";

await ImagePicker.launchImageLibraryAsync();
```

---

### 🎙️ 音频 & 视频

* `expo-av`

支持：

* 播放音频
* 播放视频
* 录音

```ts
import { Audio, Video } from "expo-av";
```

---

### 🖼️ 图片增强

* `expo-image`

  * 高性能图片组件
  * 缓存支持（比 Image 强）

---

## 3️⃣ 文件 & 数据存储（很重要）

### 📂 文件系统

* `expo-file-system`

```ts
import * as FileSystem from "expo-file-system";

FileSystem.documentDirectory;
```

用途：

* 下载文件
* 缓存图片
* 本地保存数据

---

### 💾 本地存储

* `@react-native-async-storage/async-storage`

> 虽然不是 Expo 独有，但 Expo 官方推荐

```ts
await AsyncStorage.setItem("token", "xxx");
```

---

## 4️⃣ 传感器 & 硬件能力

### 🧭 位置 / GPS

* `expo-location`

```ts
import * as Location from "expo-location";

await Location.getCurrentPositionAsync();
```

---

### 🧲 传感器

* `expo-sensors`

  * 加速度计
  * 陀螺仪
  * 磁力计

---

### 📳 震动

* `expo-haptics`
* `expo-vibration`

```ts
import * as Haptics from "expo-haptics";

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

---

## 5️⃣ UI & 系统交互（高频）

### 🧠 剪贴板

* `expo-clipboard`

---

### 🌗 主题 / 深色模式

* `expo-appearance`

---

### 🔔 通知（非常重要）

* `expo-notifications`

支持：

* 本地通知
* 推送通知（需配置）

```ts
import * as Notifications from "expo-notifications";
```

---

### 🔗 深度链接

* `expo-linking`

```ts
import * as Linking from "expo-linking";
```

---

## 6️⃣ 应用生命周期 & 系统行为

### ⏱️ 前后台监听

* `expo-application`
* `AppState`（RN）

---

### 🚪 退出 / 重启

* `expo-updates`

  * 热更新
  * OTA 更新
  * 应用重启

```ts
import * as Updates from "expo-updates";

Updates.reloadAsync();
```

---

## 7️⃣ Expo 独家“杀手级能力”

### 🚀 OTA 热更新（极其重要）

* `expo-updates`

👉 **无需重新上架 App Store / Play Store**
👉 修 bug / 改文案 / 小功能

---

### ☁️ EAS 云服务（不算 API，但非常强）

* 云打包
* 云签名
* 云发布

---

## 8️⃣ 开发 & 调试辅助 API

* `expo-dev-client`
* `expo-constants`
* `expo-status-bar`

```ts
import Constants from "expo-constants";

Constants.expoConfig;
```

---

## 三、Expo API 能力边界（你必须知道）

### ✅ Expo 很强的地方

* 相机
* 相册
* 定位
* 通知
* 文件
* 音视频
* 传感器
* OTA

### ❌ Expo 托管模式做不到的

* 深度系统级修改
* 特殊厂商 SDK（银行 / 车机 / 定制 ROM）
* 非官方原生 SDK
* 极端性能优化

👉 **解决方案：eject 到 Bare（不推翻 Expo）**

---

## 四、Expo API 使用体验总结

| 维度      | 评价    |
| ------- | ----- |
| API 丰富度 | ⭐⭐⭐⭐⭐ |
| 易用性     | ⭐⭐⭐⭐⭐ |
| 稳定性     | ⭐⭐⭐⭐  |
| 学习成本    | ⭐⭐    |
| 新手友好    | ⭐⭐⭐⭐⭐ |

---

## 五、给你的实话建议（很关键）

> 如果你现在学 React Native
> **Expo 提供的 API = 完全够用，甚至用不完**

你应该关心的是：

* 组件设计
* 状态管理
* 网络请求
* 列表 & 表单
* 架构

而不是：

* 配 Android Studio
* 改 Gradle
* 配 Xcode

---

## 六、我可以继续怎么帮你

如果你愿意，我可以直接：

* ✅ 给你一份 **Expo API 使用优先级清单（新手必学）**
* ✅ 带你用 Expo API 写一个完整功能（相机 + 上传）
* ✅ 帮你判断：**你的项目是否需要 eject**

你现在是 **学习阶段 / 毕设 / 正在做项目**？我可以直接按你的目标帮你规划 Expo 的使用路线。
