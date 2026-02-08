下面给你一套**可直接用在 React 项目里的“多条件筛选 + 列表/网格展示”**方案：

* 数据来自 `data.json`（产品数组）
* 支持：**价格区间（下拉）**、**品牌（多选）**、**排序（下拉）**、**视图切换（列表/网格）**
* 组件拆分清晰，后续你想接真实 API / React Query 也很顺

> 我用纯 React（`useMemo/useState`），不依赖表单库，先把“筛选数据流”讲透。

---

## 1) 目录结构建议

```
src/
  data/data.json
  components/
    ProductFilters.tsx
    ProductGrid.tsx
    ProductList.tsx
  pages/
    ProductsPage.tsx
```

---

## 2) TypeScript 类型（建议）

```ts
// src/types.ts
export type Product = {
  id: number;
  title: string;
  brand: string;
  price: number;
  thumbnailUrl: string;
  albumId?: number;
};
```

---

## 3) 主页面：状态 + 过滤逻辑（核心）

```tsx
// src/pages/ProductsPage.tsx
import { useMemo, useState } from "react";
import rawData from "../data/data.json";
import type { Product } from "../types";
import { ProductFilters, type FiltersState } from "../components/ProductFilters";
import { ProductGrid } from "../components/ProductGrid";
import { ProductList } from "../components/ProductList";

type ViewMode = "grid" | "list";

const products = rawData as Product[];

export default function ProductsPage() {
  // ✅ 筛选状态：集中管理（表单只是 UI，状态在这里）
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: "all",      // 下拉：all / 0-500 / 500-1000 / 1000+
    brands: [],             // 多选：["Apple", "Samsung"]
    query: "",              // 搜索：标题关键字
    sort: "default",        // 排序：default / price-asc / price-desc / title-asc
  });

  const [view, setView] = useState<ViewMode>("grid");

  // ✅ 从数据中计算品牌选项
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(p.brand);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  // ✅ 核心：根据 filters 派生 filteredProducts
  const filteredProducts = useMemo(() => {
    const { priceRange, brands, query, sort } = filters;

    // 1) 过滤
    let result = products.filter((p) => {
      // 价格区间
      const passPrice =
        priceRange === "all"
          ? true
          : priceRange === "0-500"
            ? p.price >= 0 && p.price <= 500
            : priceRange === "500-1000"
              ? p.price > 500 && p.price <= 1000
              : priceRange === "1000+"
                ? p.price > 1000
                : true;

      // 品牌多选（未选则不过滤）
      const passBrand =
        brands.length === 0 ? true : brands.includes(p.brand);

      // 标题关键字
      const passQuery =
        query.trim() === ""
          ? true
          : p.title.toLowerCase().includes(query.trim().toLowerCase());

      return passPrice && passBrand && passQuery;
    });

    // 2) 排序（注意：不要原地 sort products，要 sort 拷贝）
    result = [...result];
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "title-asc") result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [filters]);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Products</h1>

      <ProductFilters
        value={filters}
        onChange={setFilters}
        brandOptions={brandOptions}
        view={view}
        onViewChange={setView}
        total={products.length}
        filteredTotal={filteredProducts.length}
      />

      <div style={{ marginTop: 16 }}>
        {view === "grid" ? (
          <ProductGrid items={filteredProducts} />
        ) : (
          <ProductList items={filteredProducts} />
        )}
      </div>
    </div>
  );
}
```

---

## 4) 筛选表单组件：下拉 + 多选 + 搜索 + 视图切换

```tsx
// src/components/ProductFilters.tsx
import type { Product } from "../types";

export type PriceRange = "all" | "0-500" | "500-1000" | "1000+";
export type SortMode = "default" | "price-asc" | "price-desc" | "title-asc";

export type FiltersState = {
  priceRange: PriceRange;
  brands: string[]; // 多选
  query: string;    // 搜索
  sort: SortMode;
};

type Props = {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  brandOptions: string[];
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  total: number;
  filteredTotal: number;
};

export function ProductFilters({
  value,
  onChange,
  brandOptions,
  view,
  onViewChange,
  total,
  filteredTotal,
}: Props) {
  // ✅ 通用更新器：避免写一堆 setState
  const patch = (partial: Partial<FiltersState>) =>
    onChange({ ...value, ...partial });

  const toggleBrand = (brand: string) => {
    const exists = value.brands.includes(brand);
    patch({
      brands: exists
        ? value.brands.filter((b) => b !== brand)
        : [...value.brands, brand],
    });
  };

  const clearAll = () =>
    onChange({ priceRange: "all", brands: [], query: "", sort: "default" });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: 12,
        alignItems: "end",
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 12,
      }}
    >
      {/* 搜索 */}
      <div>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Search
        </label>
        <input
          value={value.query}
          onChange={(e) => patch({ query: e.target.value })}
          placeholder="Search by title..."
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* 价格区间（下拉） */}
      <div>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Price Range
        </label>
        <select
          value={value.priceRange}
          onChange={(e) => patch({ priceRange: e.target.value as any })}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All</option>
          <option value="0-500">$0 - $500</option>
          <option value="500-1000">$500 - $1000</option>
          <option value="1000+">$1000+</option>
        </select>
      </div>

      {/* 排序（下拉） */}
      <div>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Sort
        </label>
        <select
          value={value.sort}
          onChange={(e) => patch({ sort: e.target.value as any })}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        >
          <option value="default">Default</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="title-asc">Title A-Z</option>
        </select>
      </div>

      {/* 操作区 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onViewChange(view === "grid" ? "list" : "grid")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          View: {view}
        </button>

        <button
          type="button"
          onClick={clearAll}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* 品牌多选（checkbox 列表） */}
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Brands (multi)</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Showing {filteredTotal} / {total}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {brandOptions.map((b) => {
            const checked = value.brands.includes(b);
            return (
              <label
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #ddd",
                  padding: "6px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  userSelect: "none",
                  background: checked ? "#f5f5f5" : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(b)}
                />
                <span style={{ fontSize: 13 }}>{b}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## 5) 网格展示组件

```tsx
// src/components/ProductGrid.tsx
import type { Product } from "../types";

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <img
            src={p.thumbnailUrl}
            alt={p.title}
            style={{ width: "100%", borderRadius: 10 }}
          />
          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#666" }}>{p.brand}</span>
            <span style={{ fontWeight: 700 }}>${p.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 6) 列表展示组件

```tsx
// src/components/ProductList.tsx
import type { Product } from "../types";

export function ProductList({ items }: { items: Product[] }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <img
            src={p.thumbnailUrl}
            alt={p.title}
            style={{ width: 72, height: 72, borderRadius: 12 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{p.title}</div>
            <div style={{ color: "#666", fontSize: 13 }}>{p.brand}</div>
          </div>
          <div style={{ fontWeight: 800 }}>${p.price}</div>
        </div>
      ))}
    </div>
  );
}
```

---

# 你接下来可以升级的点（很关键）

### ✅ 1) 价格区间改成“滑块 range + output”

* 用 `<input type="range">` 做 `minPrice/maxPrice`
* `<output>` 实时显示范围

### ✅ 2) 多选品牌改成 `<select multiple>`

* 适合品牌很多的时候
  （现在用 checkbox 更直观）

### ✅ 3) URL 同步（可分享筛选结果）

* 用 `useSearchParams`（React Router）或 `URLSearchParams`
* 刷新不丢筛选状态

---

如果你告诉我：你项目用的是 **Vite 还是 Next.js**，以及你想用 **Tailwind 做 UI（而不是我这里的 inline style）**，我可以把上面全部改成 **Tailwind + 更像电商筛选栏的布局**（含移动端抽屉筛选）。
