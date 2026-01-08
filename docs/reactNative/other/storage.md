下面我把 **React Native 本地存储**按**“从简单到专业、从不安全到安全、从小数据到大数据”**一次讲清楚。
你看完这一条，**基本就知道任何场景该用哪种存储**。

---

# 一、一句话总览（先给结论）

> **React Native 的本地存储 = 多种方案并存，没有“万能方案”**

你要根据 **数据大小 / 是否敏感 / 是否结构化 / 性能要求** 来选。

---

## 本地存储方案速览表

| 场景           | 推荐方案         |
| ------------ | ------------ |
| token / 登录态  | SecureStore  |
| 用户设置 / theme | AsyncStorage |
| 高频读写小数据      | MMKV         |
| 复杂结构 / 列表缓存  | SQLite       |
| 文件 / 图片      | FileSystem   |

---

# 二、最常用：AsyncStorage（基础存储）

### 是什么

* **键值对（key-value）**
* 异步
* 明文存储（❗不安全）
* RN/Expo 都能用

官方库：
**AsyncStorage**

---

## 1️⃣ 安装

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## 2️⃣ 基本用法

### 存

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("token", "abc123");
```

### 取

```ts
const token = await AsyncStorage.getItem("token");
```

### 删

```ts
await AsyncStorage.removeItem("token");
```

### 对象必须 JSON

```ts
await AsyncStorage.setItem("user", JSON.stringify(user));
const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");
```

---

## 3️⃣ 适合 & 不适合

✅ 适合：

* 用户偏好
* 是否首次打开
* 简单缓存

❌ 不适合：

* 密码 / token（明文）
* 大量频繁读写
* 复杂查询

---

# 三、安全存储：SecureStore（强烈推荐存 token）

Expo 官方安全存储：
**Expo SecureStore**

---

## 1️⃣ 特点

* iOS：Keychain
* Android：Keystore
* 自动加密
* API 简单

👉 **登录 token / 私密信息首选**

---

## 2️⃣ 使用示例

```ts
import * as SecureStore from "expo-secure-store";

await SecureStore.setItemAsync("token", "abc123");

const token = await SecureStore.getItemAsync("token");

await SecureStore.deleteItemAsync("token");
```

---

## 3️⃣ 注意

* 不适合存大量数据
* 比 AsyncStorage 稍慢（但安全）

---

# 四、高性能方案：MMKV（进阶）

高性能同步存储：
**react-native-mmkv**

---

## 1️⃣ 特点

* **同步 API（非常快）**
* 原生 C++ 实现
* 适合频繁读写
* 支持加密

---

## 2️⃣ 使用示例

```ts
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

storage.set("count", 1);
const count = storage.getNumber("count");
```

---

## 3️⃣ 适合

* 状态缓存
* 性能敏感场景
* 替代 AsyncStorage

❗ Expo Managed 里用 MMKV 需要 **eject**

---

# 五、结构化存储：SQLite（大数据 / 列表）

Expo 内置 SQLite：
**Expo SQLite**

---

## 1️⃣ 适合什么

* 聊天记录
* 离线列表
* 历史数据
* 复杂查询

---

## 2️⃣ 使用示例（简化）

```ts
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("app.db");

db.transaction(tx => {
  tx.executeSql(
    "create table if not exists posts (id integer primary key not null, title text);"
  );
});
```

---

## 3️⃣ 什么时候用

* 数据多
* 需要分页 / 查询
* AsyncStorage 不够用

---

# 六、文件系统：图片 / 下载文件

Expo 文件系统：
**Expo FileSystem**

---

## 1️⃣ 用途

* 图片缓存
* 下载文件
* 本地附件

---

## 2️⃣ 示例

```ts
import * as FileSystem from "expo-file-system";

const path = FileSystem.documentDirectory + "image.png";
```

---

# 七、真实项目的“组合用法”（非常重要）

### 登录系统（标准做法）

```txt
SecureStore  → token
AsyncStorage → 用户信息 / 设置
```

---

### 社交 App（推荐）

```txt
MMKV          → 登录态 / flags
SQLite        → 帖子 / 评论
FileSystem   → 图片缓存
```

---

### 简单 App / 毕设

```txt
AsyncStorage + SecureStore
```

---

# 八、常见误区（你一定会踩）

❌ 把 token 存 AsyncStorage
❌ 把大列表 JSON 存 AsyncStorage
❌ 每次渲染都 getItem
❌ 不做 JSON parse 错误处理

---

# 九、最佳实践（非常重要）

### 1️⃣ 封装 storage 层

```ts
export const storage = {
  async set(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get<T>(key: string): Promise<T | null> {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  }
};
```

---

### 2️⃣ 启动时加载

```ts
useEffect(() => {
  loadUserFromStorage();
}, []);
```

---

### 3️⃣ 不要在 render 里读存储

---

# 十、我给你的直接建议（重点）

> 如果你现在在学 RN / Expo：

* ✔️ **先精通 AsyncStorage + SecureStore**
* ❌ 不要急着上 SQLite / MMKV
* ✔️ 项目复杂了再升级

---

## 如果你愿意，我可以继续帮你：

* ✅ 给你写一个 **“登录态 + 本地存储 + 路由守卫”完整示例**
* ✅ 帮你选：**AsyncStorage vs MMKV**
* ✅ Expo 项目中 **本地缓存架构设计**

你现在是 **学习阶段 / 毕设 / 社交 App 项目**？我可以直接给你一套**最合适的本地存储方案代码**。
