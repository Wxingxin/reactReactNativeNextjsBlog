下面给你一套「在 React 的 `useEffect` 里使用 `window.addEventListener`」的常见案例大全（覆盖最常用事件），每个案例都包含：正确的清理（`removeEventListener`）、依赖项写法、以及关键注释。你可以直接复制到项目里用。

---

## 统一原则（先记住这 4 条）

1. **永远在 `useEffect` 里注册监听，并在 cleanup 里移除监听**
2. **handler 引用要稳定**（否则 `removeEventListener` 可能移除不到正确函数）

   * 要么把 handler 定义在 `useEffect` 内部
   * 要么用 `useCallback` 保持引用稳定
3. **依赖项要正确**：用到外部变量就写进依赖；不想频繁重绑就用 `ref` 存最新值
4. **性能**：`scroll/resize/mousemove` 这种高频事件，常配合节流/防抖

---

## 案例 1：监听窗口尺寸变化（resize）

```jsx
import { useEffect, useState } from "react";

export default function UseResizeExample() {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  useEffect(() => {
    // 1) 事件处理函数（定义在 effect 内部，引用稳定）
    const handleResize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };

    // 2) 注册事件
    window.addEventListener("resize", handleResize);

    // 3) 可选：组件首次渲染后立即同步一次（有些场景 SSR/布局变化有用）
    // handleResize();

    // 4) 清理：组件卸载 or effect 重新执行前移除监听
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 无外部依赖 -> 只绑定一次

  return (
    <div>
      <h3>Resize Example</h3>
      <p>
        width: {size.w}, height: {size.h}
      </p>
    </div>
  );
}
```

---

## 案例 2：监听滚动（scroll）+ 判断是否到达页面底部

```jsx
import { useEffect, useState } from "react";

export default function UseScrollBottomExample() {
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // 距离底部 <= 1px 视为到底（避免小数误差）
      setIsBottom(scrollTop + viewportHeight >= fullHeight - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 初始同步一次

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ height: 2000 }}>
      <h3>Scroll Bottom Example</h3>
      <p>isBottom: {String(isBottom)}</p>
      <p>向下滚动到页面底部观察变化</p>
    </div>
  );
}
```

> `passive: true` 表示监听器不会调用 `preventDefault()`，浏览器可以更顺滑地滚动（常用于 `scroll/touch`）。

---

## 案例 3：监听键盘按键（keydown）实现快捷键（Ctrl/⌘ + K 打开搜索）

```jsx
import { useEffect, useState } from "react";

export default function UseHotkeyExample() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Mac 用 metaKey（⌘），Windows/Linux 用 ctrlKey
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault(); // 阻止浏览器默认行为（例如聚焦地址栏/搜索）
        setOpen(true);
      }

      // ESC 关闭
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <h3>Hotkey Example</h3>
      <p>按 Ctrl/⌘ + K 打开；ESC 关闭</p>
      {open && (
        <div style={{ border: "1px solid #ccc", padding: 12 }}>
          <strong>Search Modal</strong>
          <div>这里放搜索框...</div>
        </div>
      )}
    </div>
  );
}
```

---

## 案例 4：监听点击空白处关闭弹层（click outside）

这里用 `window` 监听 `mousedown`/`click`，结合 `ref` 判断是否点在组件外部。

```jsx
import { useEffect, useRef, useState } from "react";

export default function ClickOutsideExample() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      // 如果弹层没打开，不处理
      if (!open) return;

      // 如果点击目标不在 panel 内部 -> 关闭
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, [open]); // open 变化时 handler 读取到最新 open

  return (
    <div>
      <h3>Click Outside Example</h3>
      <button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Open"}</button>

      {open && (
        <div
          ref={panelRef}
          style={{
            marginTop: 12,
            border: "1px solid #ccc",
            padding: 12,
            width: 260,
          }}
        >
          我是弹层，点击外部关闭
        </div>
      )}
    </div>
  );
}
```

---

## 案例 5：监听页面可见性变化（visibilitychange）暂停/恢复逻辑

> 注意：这个事件在 `document` 上，不在 `window` 上，但仍是前端常见“全局监听”模式。

```jsx
import { useEffect, useState } from "react";

export default function VisibilityExample() {
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibility = () => {
      setVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div>
      <h3>Visibility Example</h3>
      <p>页面可见：{String(visible)}</p>
      <p>切换浏览器标签页观察变化</p>
    </div>
  );
}
```

---

## 案例 6：监听网络状态变化（online/offline）

```jsx
import { useEffect, useState } from "react";

export default function OnlineOfflineExample() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div>
      <h3>Online/Offline Example</h3>
      <p>当前网络：{online ? "在线" : "离线"}</p>
    </div>
  );
}
```

---

## 案例 7：高频事件的节流（scroll/resize）标准写法（避免卡顿）

下面给一个不依赖库、用 `requestAnimationFrame` 的节流（常见且性能好）：

```jsx
import { useEffect, useState } from "react";

export default function ThrottledScrollExample() {
  const [y, setY] = useState(() => window.scrollY);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      // 如果本帧已经安排了更新，就跳过
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        setY(window.scrollY);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ height: 2000 }}>
      <h3>Throttled Scroll Example</h3>
      <p>scrollY: {y}</p>
    </div>
  );
}
```

---

## 常见坑：为什么 removeEventListener “移除不掉”？

错误示例（每次 render 都产生新函数引用）：

```jsx
useEffect(() => {
  window.addEventListener("resize", () => console.log("resize"));
  return () => window.removeEventListener("resize", () => console.log("resize"));
}, []);
```

两次 `() => console.log()` 不是同一个函数引用，移除自然失败。

正确做法：用同一个 `handleResize` 引用（前面案例已示范）。

---

如果你愿意，我可以把这些案例整理成一个「自带菜单切换的 Demo 页面」（一个组件里切换不同事件示例），更适合你学习和复用。也可以按你当前项目（React Web / Next.js / RN WebView）给你最贴近实战的版本。
