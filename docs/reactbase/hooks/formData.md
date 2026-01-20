下面给你一套 React 表单里 **`FormData` 的使用大全与配置大全**（覆盖：文件上传、混合字段、数组/对象、与 `fetch/axios` 配合、进度、常见坑）。你可以直接复制到项目里用。

---

## 1) FormData 是什么，什么时候用

`FormData` 主要用于发送 `multipart/form-data` 请求，典型场景：

* **上传文件**（头像、图片、附件）
* **表单字段 + 文件混合提交**
* **需要后端按 multipart 解析**（如 Node/Express + multer）

不传文件、只传 JSON 的普通表单，一般不需要 FormData。

---

## 2) 基础：文本字段 FormData（最小可用）

```jsx
import { useState } from "react";

export default function BasicFormDataText() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("email", form.email);
    fd.append("password", form.password);

    const res = await fetch("/api/login", {
      method: "POST",
      body: fd, // 关键：body 直接放 FormData
    });

    console.log("status:", res.status);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        placeholder="email"
      />
      <input
        value={form.password}
        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        placeholder="password"
        type="password"
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

要点：**不要手动设置 `Content-Type`**（浏览器会自动带 boundary）。

---

## 3) 文件上传：单文件（头像上传最常见）

```jsx
import { useState } from "react";

export default function UploadSingleFile() {
  const [file, setFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("avatar", file); // key 要和后端字段名一致

    const res = await fetch("/api/upload/avatar", {
      method: "POST",
      body: fd,
    });

    console.log("upload status:", res.status);
  };

  return (
    <form onSubmit={submit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button type="submit">上传头像</button>
    </form>
  );
}
```

常用配置：

* `accept="image/*"` 限制选择类型
* `files[0]` 拿第一张

---

## 4) 多文件上传：同一个 key 多次 append

```jsx
import { useState } from "react";

export default function UploadMultiFiles() {
  const [files, setFiles] = useState([]);

  const submit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    const fd = new FormData();
    // 多文件：同一个字段名 append 多次
    files.forEach((f) => fd.append("photos", f));

    const res = await fetch("/api/upload/photos", {
      method: "POST",
      body: fd,
    });

    console.log("status:", res.status);
  };

  return (
    <form onSubmit={submit}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <button type="submit">上传多张</button>

      <div>已选择：{files.length} 个文件</div>
    </form>
  );
}
```

---

## 5) 混合提交：文本字段 + 文件（最典型业务）

```jsx
import { useState } from "react";

export default function UploadPostWithImage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    if (cover) fd.append("cover", cover);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: fd,
    });

    console.log("status:", res.status);
  };

  return (
    <form onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="内容" />
      <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
      <button type="submit">发布</button>
    </form>
  );
}
```

---

## 6) 发送数组/对象：推荐 JSON.stringify（后端再 JSON.parse）

FormData 原生只存字符串/Blob/File。对象/数组建议序列化：

```jsx
const fd = new FormData();

const tags = ["react", "upload"];
const meta = { draft: false, level: 3 };

fd.append("tags", JSON.stringify(tags));
fd.append("meta", JSON.stringify(meta));
```

后端（示例思路）：

* `JSON.parse(req.body.tags)`
* `JSON.parse(req.body.meta)`

---

## 7) 读取/调试 FormData（查看你到底 append 了什么）

```jsx
for (const [k, v] of fd.entries()) {
  console.log(k, v);
}
```

注意：文件对象在 console 会显示为 `File`，这是正常的。

---

## 8) 与 axios 配合：不要手动写 Content-Type（通常）

```jsx
import axios from "axios";

const fd = new FormData();
fd.append("avatar", file);

await axios.post("/api/upload/avatar", fd, {
  // headers 通常不需要设置 Content-Type，让 axios/浏览器自动处理 boundary
  // headers: { "Content-Type": "multipart/form-data" }, // 一般不建议手动写
  withCredentials: true, // 如你使用 cookie 鉴权
});
```

---

## 9) 上传进度（axios 最方便）

fetch 标准 API 对上传进度支持不直接（要用 XHR/streams），axios 提供 `onUploadProgress`：

```jsx
import axios from "axios";
import { useState } from "react";

export default function UploadWithProgress() {
  const [file, setFile] = useState(null);
  const [pct, setPct] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    await axios.post("/api/upload", fd, {
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        setPct(Math.round((evt.loaded * 100) / evt.total));
      },
    });
  };

  return (
    <form onSubmit={submit}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button type="submit">上传</button>
      <div>进度：{pct}%</div>
    </form>
  );
}
```

---

## 10) 常见配置与坑（非常重要）

### 坑 1：手动设置 `Content-Type` 导致后端解析失败

错误示例：

```js
fetch(url, { headers: { "Content-Type": "multipart/form-data" }, body: fd })
```

原因：缺少 boundary。正确做法：**不要设**，让浏览器生成。

### 坑 2：把 File 放进 JSON

`JSON.stringify(file)` 没意义，会丢失文件内容。文件必须走 FormData 或 Blob 上传。

### 坑 3：后端字段名不一致

前端：`fd.append("avatar", file)`
后端 multer：`upload.single("avatar")`
两边 key 必须一致。

### 坑 4：多文件字段名

多文件一般：

* `fd.append("photos", file1)`
* `fd.append("photos", file2)`
  后端：`upload.array("photos")`

---

## 11) FormData 常用方法配置大全

* `new FormData(formElement)`：从原生 `<form>` 一次性读取
* `append(name, value)`：追加字段（同名可多次追加）
* `set(name, value)`：设置字段（覆盖同名）
* `delete(name)`：删除字段
* `get(name)` / `getAll(name)`：获取值（或同名多个）
* `has(name)`：是否存在
* `entries()` / `keys()` / `values()`：迭代查看

---

## 12) 进阶：直接从 `<form>` 构建 FormData（无需 useState）

适合简单表单（不需要实时校验/联动）：

```jsx
export default function NativeFormToFormData() {
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); // 直接读取 form 中所有有 name 的字段

    await fetch("/api/submit", { method: "POST", body: fd });
  };

  return (
    <form onSubmit={submit}>
      <input name="title" placeholder="title" />
      <input name="cover" type="file" />
      <button type="submit">提交</button>
    </form>
  );
}
```

要点：表单控件必须有 `name` 才会进入 FormData。

---

如果你后端是 **Express + multer**（你之前在学这个组合），我也可以给你一套“前端 FormData + 后端 multer/sharp/cloudinary”的完整可跑模板（含路由、存储策略、字段校验、错误处理）。你更偏向：**本地磁盘存储**还是 **Cloudinary**？
