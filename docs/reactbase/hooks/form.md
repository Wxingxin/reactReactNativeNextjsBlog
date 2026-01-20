下面给你一套 React 中 **`useState` 配合表单**的“使用大全 + 配置大全”（覆盖从最基础到常见业务写法）。你可以按场景直接复制使用。

---

## 1) 最基础：单个 input（受控组件）

核心：`value` 由 state 控制，`onChange` 更新 state。

```jsx
import { useState } from "react";

export default function SingleInput() {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 提交时拿 username
    console.log({ username });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        用户名：
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
        />
      </label>

      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 2) 多个字段：一个对象管理（最常用）

适合登录/注册/资料编辑等。推荐写一个通用 `handleChange`。

```jsx
import { useState } from "react";

export default function ObjectForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // 通用 change：兼容 input/checkbox/select/textarea
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />

      <label>
        <input
          name="remember"
          type="checkbox"
          checked={form.remember}
          onChange={handleChange}
        />
        记住我
      </label>

      <button type="submit">登录</button>
    </form>
  );
}
```

要点：

* `name` 对应 state key
* checkbox 用 `checked`，不是 `value`
* `setForm(prev => ...)` 防止并发更新问题

---

## 3) `select` / `textarea` 配置大全

### select（单选）

```jsx
<select name="role" value={form.role} onChange={handleChange}>
  <option value="">请选择</option>
  <option value="user">用户</option>
  <option value="admin">管理员</option>
</select>
```

### textarea

```jsx
<textarea
  name="bio"
  value={form.bio}
  onChange={handleChange}
  placeholder="个人简介"
/>
```

---

## 4) Radio（单选组）

```jsx
import { useState } from "react";

export default function RadioExample() {
  const [gender, setGender] = useState("male");

  return (
    <div>
      <label>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={gender === "male"}
          onChange={(e) => setGender(e.target.value)}
        />
        男
      </label>

      <label>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={gender === "female"}
          onChange={(e) => setGender(e.target.value)}
        />
        女
      </label>
    </div>
  );
}
```

---

## 5) Checkbox 多选（数组字段）

比如兴趣：`["music", "code"]`

```jsx
import { useState } from "react";

const options = ["music", "sports", "code"];

export default function CheckboxMulti() {
  const [hobbies, setHobbies] = useState([]);

  const toggle = (v) => {
    setHobbies((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  return (
    <div>
      <h4>兴趣：</h4>
      {options.map((v) => (
        <label key={v} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={hobbies.includes(v)}
            onChange={() => toggle(v)}
          />
          {v}
        </label>
      ))}

      <pre>{JSON.stringify(hobbies, null, 2)}</pre>
    </div>
  );
}
```

---

## 6) 表单校验：`errors` 状态 + 提交时校验（轻量版）

```jsx
import { useState } from "react";

export default function ValidateExample() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    // 可选：输入时清除当前字段错误
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email 不能为空";
    if (!form.password.trim()) next.password = "密码不能为空";
    if (form.password && form.password.length < 6) next.password = "至少 6 位";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;
    console.log("submit:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
      </div>

      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 7) 提交状态：`isSubmitting` + 禁用按钮 + 防止重复提交

```jsx
import { useState } from "react";

export default function SubmitStateExample() {
  const [form, setForm] = useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 模拟请求
      await new Promise((r) => setTimeout(r, 800));
      console.log("submit:", form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.email}
        onChange={(e) => setForm({ email: e.target.value })}
        placeholder="Email"
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

---

## 8) 表单重置（Reset）/ 填充初始值（Edit 表单）

```jsx
import { useState } from "react";

const initial = { name: "", age: "" };

export default function ResetExample() {
  const [form, setForm] = useState(initial);

  const reset = () => setForm(initial);

  const fillDemo = () =>
    setForm({ name: "wjx", age: "20" }); // 模拟编辑页面从接口拿到数据

  return (
    <div>
      <form>
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="name"
        />
        <input
          name="age"
          value={form.age}
          onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
          placeholder="age"
        />
      </form>

      <button onClick={fillDemo}>填充示例数据</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

---

## 9) 动态表单：字段数组（添加/删除一组 input）

例如：添加多个“联系人”。

```jsx
import { useState } from "react";

export default function FieldArrayExample() {
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);

  const add = () => setContacts((p) => [...p, { name: "", phone: "" }]);

  const remove = (index) =>
    setContacts((p) => p.filter((_, i) => i !== index));

  const update = (index, key, value) => {
    setContacts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(contacts);
  };

  return (
    <form onSubmit={handleSubmit}>
      {contacts.map((c, idx) => (
        <div key={idx} style={{ marginBottom: 12 }}>
          <input
            value={c.name}
            onChange={(e) => update(idx, "name", e.target.value)}
            placeholder="联系人姓名"
          />
          <input
            value={c.phone}
            onChange={(e) => update(idx, "phone", e.target.value)}
            placeholder="电话"
          />
          <button type="button" onClick={() => remove(idx)}>
            删除
          </button>
        </div>
      ))}

      <button type="button" onClick={add}>
        添加联系人
      </button>
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 10) 性能与工程化：通用 `useFormState`（建议你在项目里用）

把“通用 change、setField、reset”封装成 hook，写表单更快更稳。

```jsx
import { useCallback, useMemo, useState } from "react";

function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return useMemo(
    () => ({ values, setValues, handleChange, setField, reset }),
    [values, handleChange, setField, reset]
  );
}

export default function UseFormStateDemo() {
  const { values, handleChange, reset } = useFormState({
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
      />
      <label>
        <input
          name="remember"
          type="checkbox"
          checked={values.remember}
          onChange={handleChange}
        />
        remember
      </label>

      <button type="submit">提交</button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </form>
  );
}
```

---

## 11) 配置清单（你写表单会反复用到）

### input 常用属性

* `name`：绑定字段 key（对象表单必备）
* `value`：受控输入值
* `onChange`：更新 state
* `type`：`text/password/email/number/date/...`
* `placeholder`：占位
* `disabled/readOnly`
* `maxLength/minLength`
* `autoComplete`：`"username"|"current-password"|"new-password"|...`
* `inputMode`：移动端键盘优化（`numeric`, `email`）
* `pattern`：简单正则限制（不建议当作唯一校验）

### checkbox / radio

* checkbox：用 `checked` + `onChange`
* radio：用 `checked={state===value}`

### form submit

* `onSubmit` + `e.preventDefault()`
* 提交中禁用按钮：`disabled={isSubmitting}`

---

## 12) 什么时候 `useState` 不够用？

当你遇到以下情况，建议直接用 **React Hook Form + Zod**（你之前也在学 RN 表单那套）：

* 表单字段很多（10+）
* 动态字段/嵌套对象非常多
* 校验规则复杂、要联动校验
* 需要更高性能（减少 re-render）

但在多数中小表单、后台管理系统“编辑/新增弹窗”里，`useState` 足够。

---

如果你告诉我：你现在的表单是 **登录/注册**、**个人信息编辑**，还是 **后台新增/编辑（带动态字段）**，我可以给你一份更贴近你项目的“完整目录结构 + 可复制的组件写法”（包含校验、提交状态、错误提示、重置、编辑回填）。
