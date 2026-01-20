下面给你一个**真实项目中最常见、最稳妥的 React Modal 弹窗组件实现**。
我会按 **「使用方式 → 组件实现 → 样式 → 核心知识点 → 常见扩展」** 的顺序来讲，代码**可直接复制使用**。

---

## 一、Modal 的典型使用方式（父组件控制显示）

**核心原则：Modal 是否显示 = 父组件 state 控制**

```jsx
import { useState } from "react";
import Modal from "./Modal";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开弹窗</button>

      <Modal
        open={open}
        title="提示"
        onClose={() => setOpen(false)}
      >
        <p>这是一个最常见的 Modal 弹窗内容。</p>
      </Modal>
    </div>
  );
}
```

---

## 二、Modal 组件实现（核心代码）

这是一个**通用、可复用、面试级别**的 Modal 组件。

```jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, title, children, onClose }) {
  // 如果不显示，直接不渲染（性能最好）
  if (!open) return null;

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 使用 Portal 渲染到 body 下
  return createPortal(
    <div className="modal-mask" onClick={onClose}>
      {/* 阻止冒泡，防止点内容区关闭 */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose}>取消</button>
          <button className="primary">确定</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

---

## 三、样式（最常见的 Modal CSS）

```css
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 420px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

.modal-header,
.modal-footer {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.modal-footer {
  border-top: 1px solid #eee;
  border-bottom: none;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-body {
  padding: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.primary {
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 四、这个 Modal 用到了哪些「核心 React 知识点」

### 1️⃣ **受控组件思想（Controlled）**

```jsx
<Modal open={open} onClose={() => setOpen(false)} />
```

✔ Modal 自己不管显示逻辑
✔ 父组件是唯一数据源（单向数据流）

---

### 2️⃣ **createPortal（非常重要）**

```js
createPortal(jsx, document.body);
```

为什么要用？

* 避免被父组件 `overflow: hidden`
* 保证 z-index 正常
* 真正的“全局弹窗”

👉 **几乎所有 UI 库（AntD / MUI）都用 Portal**

---

### 3️⃣ **点击遮罩关闭 + 阻止冒泡**

```jsx
<div onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()} />
</div>
```

✔ 点击背景关闭
✔ 点击内容区不关闭

这是 **Modal 必考点**

---

### 4️⃣ **ESC 键关闭（提升体验）**

```js
useEffect(() => {
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, []);
```

✔ 注意清理事件
✔ 真实项目必备

---

## 五、常见扩展（真实项目经常要）

### ✅ 1. 点击遮罩是否允许关闭

```jsx
function Modal({ maskClosable = true }) {
  <div onClick={maskClosable ? onClose : undefined} />
}
```

---

### ✅ 2. 只显示内容（无 footer）

```jsx
{showFooter && <div className="modal-footer">...</div>}
```

---

### ✅ 3. 异步确认按钮（loading）

```jsx
const [loading, setLoading] = useState(false);

<button disabled={loading}>
  {loading ? "提交中..." : "确定"}
</button>
```

---

### ✅ 4. 多个 Modal 管理（推荐方式）

```jsx
{open && <Modal />}
```

而不是：

```jsx
<Modal open={true} />
```

---

## 六、你现在这个 Modal 已经达到了什么水平？

✔ React 面试 **标准实现**
✔ 满足 90% 中小项目需求
✔ 思想与 Ant Design / MUI 完全一致
✔ 可直接封装成组件库

---

## 七、下一步我可以帮你做什么？

你可以继续进阶到：

* ✅ **TypeScript 版本 Modal**
* ✅ **Promise 风格 Modal（Modal.confirm）**
* ✅ **Modal + 表单（react-hook-form）**
* ✅ **React Native Modal 对比实现**
* ✅ **仿 Ant Design Modal API 设计**

你直接告诉我你想做哪一个，我按**真实工程标准**给你写。
