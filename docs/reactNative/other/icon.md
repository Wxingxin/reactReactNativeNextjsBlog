在 **React Native 本身（官方核心库）中是「没有内置图标组件」的**。
这是一个非常关键、也经常被初学者误解的点。

下面我按**“图标从哪里来、怎么用、项目中怎么选”**的逻辑，系统说明。

---

## 一、核心结论（先给答案）

> **React Native 官方不提供任何内置 Icon 组件或图标库。**

也就是说：

* ❌ 没有类似 Web 的 `<i class="iconfont" />`
* ❌ 没有 Material Icons 内置
* ❌ 没有 FontAwesome 内置

**图标必须来自：**

1. 第三方图标库
2. 图片（Image）
3. SVG
4. Expo 内置方案（仅限 Expo）

---

## 二、最主流方案：react-native-vector-icons（事实标准）

### 1️⃣ 它是什么

* React Native 生态 **事实上的标准图标库**
* 内置多个图标集

### 2️⃣ 常用图标集

| 图标集                    | 说明        |
| ---------------------- | --------- |
| MaterialIcons          | Google 官方 |
| MaterialCommunityIcons | 最全，推荐     |
| Ionicons               | iOS 风格    |
| FontAwesome / FA5      | Web 熟悉    |
| AntDesign              | 国内项目常见    |
| Feather                | 简约风格      |

---

### 3️⃣ 安装（CLI 项目）

```bash
npm install react-native-vector-icons
```

> RN 0.60+ 自动 link，一般无需手动配置

---

### 4️⃣ 使用示例

```tsx
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

<Icon name="home" size={24} color="#333" />
```

---

## 三、如果你用的是 Expo（非常重要）

### Expo 已经**内置**图标库

👉 不需要安装 `react-native-vector-icons`

### 使用方式：

```tsx
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="home" size={24} color="black" />
```

支持：

* Ionicons
* MaterialIcons
* MaterialCommunityIcons
* FontAwesome 等

---

## 四、图片作为图标（最原始方式）

### 适用场景

* UI 设计稿给的是 PNG / WebP
* 复杂多彩图标

```tsx
<Image
  source={require('./icon.png')}
  style={{ width: 24, height: 24 }}
/>
```

❌ 缺点：

* 不支持变色
* 分辨率适配麻烦

---

## 五、SVG 图标（中大型项目推荐）

### 常用库

```bash
npm install react-native-svg
```

### 使用方式

```tsx
import Svg, { Path } from 'react-native-svg';
```

优点：

* 矢量
* 可控性极强
* UI 设计友好

---

## 六、导航栏图标从哪里来？

### React Navigation + Icon

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

tabBarIcon: ({ color, size }) => (
  <Icon name="home-outline" color={color} size={size} />
)
```

> 图标本身仍然来自 **vector-icons**

---

## 七、项目中该怎么选？（实战建议）

### 小项目 / Demo

* Expo + @expo/vector-icons ✅

### 正式商业项目

* `react-native-vector-icons` + MaterialCommunityIcons ✅

### UI 强一致性

* SVG + react-native-svg ✅

---

## 八、一句话总结

> **React Native 没有“图标在哪”的概念**
> **图标不是内置的，而是你主动引入的资源**

---

