我给你把 **React Native 的 ScrollView / FlatList / SectionList** 用“什么时候用 + 核心属性 + 性能要点 + 常见坑 + 完整例子”整理成一份可直接当笔记的使用大全。

---

## 1）先选对组件：ScrollView vs FlatList vs SectionList

### ScrollView（一次性渲染）

适合：

* 内容不多（几十个以内）、页面结构更像“文章/表单/详情页”
* 需要把很多不同的组件组合成一页，并且整体可滚动

不适合：

* 很长的列表（上百/上千条）——因为它会把所有子元素一次性渲染，容易卡、占内存

### FlatList（虚拟列表，性能优先）

适合：

* 大数据列表、无限滚动、下拉刷新
* 数据结构是一维数组：`[{...}, {...}]`

特点：

* 只渲染屏幕附近的 item（虚拟化/回收），性能好

### SectionList（带分组的虚拟列表）

适合：

* 有分组标题的列表：通讯录 A/B/C、订单按日期分组、消息按月份分组等
* 数据结构是分组数组：`[{ title, data: [...] }, ...]`

---

## 2）ScrollView 使用大全

### 最常用属性

* `contentContainerStyle`：内容容器样式（常用来做 padding、居中、填满高度）
* `horizontal`：横向滚动
* `showsVerticalScrollIndicator / showsHorizontalScrollIndicator`：滚动条
* `keyboardShouldPersistTaps="handled" | "always" | "never"`：输入框场景很重要
* `refreshControl`：下拉刷新（ScrollView 也能用）
* `onScroll` + `scrollEventThrottle`：监听滚动（做吸顶/渐变/回到顶部）

### 常见坑

* 只设置 `style` 不一定能让内容有 padding，很多时候要用 `contentContainerStyle`
* ScrollView 里放很多 item 会卡：这种直接换 FlatList/SectionList

### 例子：基础竖向滚动 + 下拉刷新 + 回到顶部

```jsx
import React, { useRef, useState } from "react";
import { ScrollView, RefreshControl, View, Text, Button } from "react-native";

export default function DemoScrollView() {
  const ref = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="回到顶部"
        onPress={() => ref.current?.scrollTo({ y: 0, animated: true })}
      />

      <ScrollView
        ref={ref}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={(e) => {
          // e.nativeEvent.contentOffset.y
        }}
        scrollEventThrottle={16}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={{ height: 80, backgroundColor: "#eee", justifyContent: "center", padding: 12 }}
          >
            <Text>Card #{i + 1}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

## 3）FlatList 使用大全（重点：性能 & 功能）

### 必学核心 props

**数据与渲染**

* `data`：数组数据
* `renderItem`：渲染函数 `({ item, index }) => ...`
* `keyExtractor`：返回唯一 key（强烈建议写）
* `ListHeaderComponent / ListFooterComponent / ListEmptyComponent`
* `ItemSeparatorComponent`

**滚动/分页**

* `onEndReached`：触底加载更多
* `onEndReachedThreshold`：距离底部多少比例触发（0~1）
* `initialNumToRender`：初次渲染多少条
* `windowSize`：渲染窗口大小（越大越流畅但更耗内存）
* `removeClippedSubviews`：Android 上常用（可能有坑，UI 复杂时谨慎）

**刷新**

* `refreshing` + `onRefresh`：下拉刷新

**布局优化（能提升很多）**

* `getItemLayout`：如果 item 高度固定/可计算，滚动会更稳更快
* `extraData`：当渲染依赖外部 state 时，用它触发刷新

### FlatList 性能“必做项”

1. `keyExtractor` 用稳定唯一 id，不要用 index（除非列表完全静态）
2. `renderItem` 里尽量用 `React.memo` / 把 Item 抽成组件，减少重渲染
3. 大列表尽量给 `getItemLayout`（固定高度最爽）
4. 图片使用合适尺寸，避免巨图

### 例子：下拉刷新 + 上拉分页 + header/footer/empty

```jsx
import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";

const ItemRow = React.memo(function ItemRow({ item, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={{ padding: 14, borderBottomWidth: 1, borderColor: "#eee" }}
    >
      <Text style={{ fontSize: 16 }}>{item.title}</Text>
      <Text style={{ color: "#666" }}>id: {item.id}</Text>
    </Pressable>
  );
});

export default function DemoFlatList() {
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({ id: String(i + 1), title: `Item ${i + 1}` }))
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onPressItem = useCallback((item) => {
    console.log("press", item.id);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setData(Array.from({ length: 20 }).map((_, i) => ({ id: String(i + 1), title: `New Item ${i + 1}` })));
    setHasMore(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);

    await new Promise((r) => setTimeout(r, 700));
    setData((prev) => {
      const start = prev.length + 1;
      const next = Array.from({ length: 15 }).map((_, i) => ({
        id: String(start + i),
        title: `Item ${start + i}`,
      }));
      return [...prev, ...next];
    });

    // 模拟加载到一定数量就没更多
    setHasMore((prevHasMore) => (data.length + 15 >= 80 ? false : prevHasMore));
    setLoadingMore(false);
  }, [loadingMore, refreshing, hasMore, data.length]);

  const header = useMemo(
    () => (
      <View style={{ padding: 14, backgroundColor: "#fafafa", borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontWeight: "600" }}>Header：公告/筛选栏都可以放这里</Text>
      </View>
    ),
    []
  );

  const footer = useMemo(() => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 8, color: "#666" }}>加载中...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemRow item={item} onPress={onPressItem} />}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={<Text style={{ padding: 20, textAlign: "center" }}>暂无数据</Text>}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
    />
  );
}
```

### 例子：固定高度 item + getItemLayout（强烈推荐）

```jsx
const ITEM_HEIGHT = 64;

<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={{ height: ITEM_HEIGHT, justifyContent: "center", paddingHorizontal: 16 }}>
      <Text>{item.title}</Text>
    </View>
  )}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 例子：多列网格（numColumns）

```jsx
<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  numColumns={2}
  columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
  contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
  renderItem={({ item }) => (
    <View style={{ flex: 1, height: 120, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
      <Text>{item.title}</Text>
    </View>
  )}
/>
```

---

## 4）SectionList 使用大全（分组列表）

### 数据结构

```js
const sections = [
  { title: "A", data: [{ id: "1", name: "Alice" }, { id: "2", name: "Aaron" }] },
  { title: "B", data: [{ id: "3", name: "Bob" }] },
];
```

### 常用 props

* `sections`：分组数据
* `renderItem`：渲染每一行
* `renderSectionHeader`：渲染分组头
* `keyExtractor`
* `stickySectionHeadersEnabled`：是否吸顶（默认多为 true）
* `SectionSeparatorComponent`（有些版本支持）/ `ItemSeparatorComponent`
* 同样支持：`ListHeaderComponent`、`ListFooterComponent`、`refreshing/onRefresh`、`onEndReached`

### 例子：通讯录分组 + 吸顶标题 + 下拉刷新

```jsx
import React, { useCallback, useState } from "react";
import { View, Text, SectionList } from "react-native";

export default function DemoSectionList() {
  const [refreshing, setRefreshing] = useState(false);

  const sections = [
    { title: "A", data: [{ id: "1", name: "Alice" }, { id: "2", name: "Aaron" }] },
    { title: "B", data: [{ id: "3", name: "Bob" }, { id: "4", name: "Bella" }] },
    { title: "C", data: [{ id: "5", name: "Cindy" }] },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <View style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f5f5f5" }}>
          <Text style={{ fontWeight: "700" }}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}>
          <Text>{item.name}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Contacts</Text>
        </View>
      }
    />
  );
}
```

---

## 5）三者通用的“高频需求”写法

### A. 列表为空时展示

* FlatList：`ListEmptyComponent`
* SectionList：也支持 `ListEmptyComponent`（sections 为空/或 data 全空时）

### B. Header / Footer（筛选栏、广告位、loading）

* `ListHeaderComponent`
* `ListFooterComponent`

### C. 分隔线

* `ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}`
* 或在 item 自己加 borderBottom（更简单）

### D. 滚动到指定位置 / 回到顶部

* FlatList/SectionList：用 ref

```jsx
const listRef = useRef(null);

// 回到顶部
listRef.current?.scrollToOffset({ offset: 0, animated: true });
```

### E. 内嵌滚动（Nested Scroll）

一般不推荐“ScrollView 包 FlatList”，容易滚动冲突和性能问题。

* 如果必须嵌套：`nestedScrollEnabled`（Android）可能需要开
* 更常见做法：用 `ListHeaderComponent` 把上面的内容塞进 FlatList/SectionList 的 header

---

## 6）一眼记住的选择建议（面试也能用）

* **页面内容少、结构复杂**：ScrollView
* **纯列表、多数据、要性能**：FlatList
* **列表要分组 + 吸顶标题**：SectionList

---

如果你愿意，我可以再给你补一份“真实项目模板”：

* 列表页（搜索 + 筛选 + 下拉刷新 + 分页 + 错误重试 + skeleton）
  并且把每个 prop 为什么这么配讲清楚。你更偏向做电商/资讯/社交哪种列表？
