下面按“项目里最常见的落地方式”把 **react-toastify** 的用法系统整理一遍，并给出可以直接复制的经典代码（含注释）。示例默认 React 18。

---

## 1）安装与全局入口配置（ToastContainer 放哪里）

### 安装

```bash
npm i react-toastify
# or
yarn add react-toastify
```

### 在应用根部挂载 ToastContainer（通常 App.jsx 或 main.jsx）

> 关键点：**ToastContainer 只需要放一次**。你在任何组件里 `toast.xxx()` 都能弹。

```jsx
// App.jsx
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // 必须引入默认样式

export default function App() {
  return (
    <>
      {/* 你的路由/页面 */}
      <div>My App</div>

      {/* ToastContainer 建议放在根部，避免重复挂载 */}
      <ToastContainer
        position="top-right"  // 弹窗位置
        autoClose={2500}      // 自动关闭时间(ms)，false 表示不自动关闭
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"         // "light" | "dark" | "colored"
        limit={3}             // 同时最多显示 3 条，超出排队
      />
    </>
  );
}
```

---

## 2）最常用的 toast 类型（success / error / info / warning / default）

```jsx
// ToastBasics.jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastBasics() {
  const showSuccess = () => toast.success("保存成功");
  const showError = () => toast.error("保存失败，请重试");
  const showInfo = () => toast.info("这是一条提示信息");
  const showWarning = () => toast.warning("请检查输入内容");
  const showDefault = () => toast("普通提示（default）");

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={showSuccess}>success</button>
      <button onClick={showError}>error</button>
      <button onClick={showInfo}>info</button>
      <button onClick={showWarning}>warning</button>
      <button onClick={showDefault}>default</button>
    </div>
  );
}
```

---

## 3）单次调用的常见配置项（覆盖默认行为）

```jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastOptions() {
  const showWithOptions = () => {
    toast("自定义配置 toast", {
      position: "bottom-left", // 覆盖 container 的默认 position
      autoClose: 5000,
      closeOnClick: false,     // 点击不关闭
      pauseOnHover: true,
      draggable: false,
      progress: undefined,     // 允许默认进度条
      theme: "colored",
    });
  };

  return <button onClick={showWithOptions}>Show options</button>;
}
```

---

## 4）避免重复提示：toastId / isActive（“同一条不要刷屏”）

适用场景：表单校验、网络错误、重复点击按钮等。

```jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastDedup() {
  const TOAST_ID = "network_error";

  const showOnce = () => {
    // 如果该 toastId 还在显示中，就不再弹新的
    if (!toast.isActive(TOAST_ID)) {
      toast.error("网络异常，请稍后重试", { toastId: TOAST_ID });
    }
  };

  return <button onClick={showOnce}>Network request</button>;
}
```

---

## 5）Promise 场景（最经典）：toast.promise 自动管理 loading/success/error

适用：登录/注册/提交表单/保存设置等。

```jsx
import React from "react";
import { toast } from "react-toastify";

// 模拟接口
function fakeApi(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Server error"));
      else resolve({ ok: true });
    }, 1200);
  });
}

export default function ToastPromise() {
  const handleSubmit = async () => {
    // toast.promise 会自动：
    // 1) 先显示 pending（loading）
    // 2) resolve -> success
    // 3) reject  -> error
    await toast.promise(
      fakeApi(false),
      {
        pending: "提交中...",
        success: "提交成功",
        error: {
          // error 文案也可用函数，获取错误对象
          render({ data }) {
            // data 是 reject 的 error
            return `提交失败：${data?.message ?? "未知错误"}`;
          },
        },
      },
      {
        // 第三个参数是 toast 的配置（可选）
        autoClose: 2000,
        closeOnClick: true,
      }
    );
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

---

## 6）更新同一个 toast：toast.loading + toast.update（“先 loading 后更新结果”）

适用：你想更精细控制流程，或有多阶段进度。

```jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastUpdateFlow() {
  const handleRun = async () => {
    // 先创建一个 loading toast，并拿到 id
    const id = toast.loading("处理中...");

    try {
      // 模拟异步
      await new Promise((r) => setTimeout(r, 1000));

      // 更新同一个 toast：改文案、类型、关闭时间等
      toast.update(id, {
        render: "处理完成",
        type: "success",
        isLoading: false,  // 关闭 loading 状态
        autoClose: 2000,
        closeOnClick: true,
      });
    } catch (e) {
      toast.update(id, {
        render: "处理失败",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

  return <button onClick={handleRun}>Run flow</button>;
}
```

---

## 7）关闭与清理：dismiss / clearWaitingQueue（“关单条、关全部、清队列”）

```jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastDismiss() {
  const show = () => {
    const id = toast("这条可手动关闭");
    // 1.5 秒后关闭这条
    setTimeout(() => toast.dismiss(id), 1500);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={show}>Show & dismiss later</button>

      {/* 关闭所有正在显示的 toast */}
      <button onClick={() => toast.dismiss()}>Dismiss all</button>

      {/* 清理排队中的 toast（配合 ToastContainer 的 limit 使用） */}
      <button onClick={() => toast.clearWaitingQueue()}>Clear queue</button>
    </div>
  );
}
```

---

## 8）自定义内容：传 ReactNode + 自定义按钮/交互

适用：撤销（Undo）、跳转、复制链接等。

```jsx
import React from "react";
import { toast } from "react-toastify";

export default function ToastCustomContent() {
  const showUndoToast = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>已删除一条记录</div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                // 执行撤销逻辑
                console.log("undo");
                closeToast(); // 关闭当前 toast
              }}
            >
              撤销
            </button>

            <button onClick={closeToast}>关闭</button>
          </div>
        </div>
      ),
      {
        autoClose: false, // 需要用户手动处理
        closeOnClick: false,
      }
    );
  };

  return <button onClick={showUndoToast}>Delete</button>;
}
```

---

## 9）统一封装（推荐）：在项目里做一个 toast 工具模块

适用：你不想在业务组件里到处写配置；也便于统一文案与样式。

```jsx
// src/utils/toast.js
import { toast } from "react-toastify";

/**
 * 项目统一 toast：减少业务代码重复
 */
export const notify = {
  success(msg, options) {
    return toast.success(msg, { autoClose: 2000, ...options });
  },
  error(msg, options) {
    return toast.error(msg, { autoClose: 3000, ...options });
  },
  info(msg, options) {
    return toast.info(msg, { autoClose: 2500, ...options });
  },
  warn(msg, options) {
    return toast.warning(msg, { autoClose: 2500, ...options });
  },
  loading(msg = "加载中...", options) {
    // 返回 id，方便 toast.update
    return toast.loading(msg, { ...options });
  },
};
```

业务里直接用：

```jsx
import React from "react";
import { notify } from "./utils/toast";

export default function Demo() {
  const handleSave = async () => {
    const id = notify.loading("保存中...");
    try {
      await new Promise((r) => setTimeout(r, 800));
      // 更新为成功
      notify.success("保存成功");
    } catch {
      notify.error("保存失败");
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

---

## 10）典型项目场景清单（你会经常用到）

1. **表单提交**：`toast.promise()` 或 `toast.loading + toast.update`
2. **接口错误统一提示**：配合 axios 拦截器/Fetch 封装（只在必要时弹）
3. **去重**：`toastId + toast.isActive()` 防止重复弹同类错误
4. **撤销操作**：自定义内容 toast（`autoClose: false`）
5. **长任务进度**：loading -> update -> success/error
6. **页面切换提示**：在路由跳转成功后 toast.success（注意去重）

---

如果你愿意，我可以把它进一步落到你常用的工程结构里：

* React + Fetch 封装里如何统一在 `apiFetch` 抛错时弹 toast
* React + Axios（拦截器）里如何只对“需要提示”的错误弹 toast（比如 401/500）
  并给你一套可直接复制的目录结构与代码。
