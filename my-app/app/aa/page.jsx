"use client";
// import React, { useState } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import SearchSelect from "./SearchSelect";

const cards = [
  { id: 1, title: "React useEffect 监听事件", content: "..." },
  { id: 2, title: "React useRef 常见用法", content: "..." },
  { id: 3, title: "React Suspense 与懒加载", content: "..." },
  { id: 4, title: "Express JWT 鉴权实践", content: "..." },
];

export default function Page() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: 24 }}>
      <SearchSelect items={cards} onSelect={(item) => setSelected(item)} />

      {selected && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid #eee",
            borderRadius: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>{selected.title}</h3>
          <p style={{ marginTop: 8, opacity: 0.85 }}>{selected.content}</p>
        </div>
      )}
    </div>
  );
}

/**
 * props:
 * - items: [{ id: string|number, title: string, ... }]
 * - onSelect: (item) => void
 * - placeholder?: string
 */
// export default
function SearchSelect({ items, onSelect, placeholder = "搜索卡片标题…" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 表示焦点在 input 上或未激活
  const inputRef = useRef(null);
  const optionRefs = useRef([]); // 存每个结果项的 DOM 引用

  // 过滤结果：按 title 模糊匹配
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, query]);

  // 每次过滤结果变化时，重置 activeIndex，并修正 refs 数组长度
  useEffect(() => {
    setActiveIndex(-1);
    optionRefs.current = optionRefs.current.slice(0, filtered.length);
  }, [filtered.length]);

  // 选择某一项
  const selectItem = (item) => {
    onSelect?.(item);
    setQuery(item.title); // 常见交互：选中后把标题填回输入框
    setOpen(false);
    setActiveIndex(-1);
    // 选择后回到 input，便于继续输入/修改
    inputRef.current?.focus();
  };

  // Tab 循环逻辑：从 input -> 第一个结果；在结果内循环
  const moveFocusByTab = (shiftKey) => {
    if (!open || filtered.length === 0) return;

    // shift+tab：反向循环（可选但很实用）
    if (shiftKey) {
      // 如果在 input，反向 tab 就让它去最后一个结果（也可以选择不拦截）
      if (activeIndex === -1) {
        setActiveIndex(filtered.length - 1);
        requestAnimationFrame(() =>
          optionRefs.current[filtered.length - 1]?.focus(),
        );
        return;
      }
      // 在结果中：往上移动，超出回到 input
      const prev = activeIndex - 1;
      if (prev < 0) {
        setActiveIndex(-1);
        requestAnimationFrame(() => inputRef.current?.focus());
      } else {
        setActiveIndex(prev);
        requestAnimationFrame(() => optionRefs.current[prev]?.focus());
      }
      return;
    }

    // tab：正向循环
    // 如果当前在 input（activeIndex=-1），tab 进入第一个结果
    if (activeIndex === -1) {
      setActiveIndex(0);
      requestAnimationFrame(() => optionRefs.current[0]?.focus());
      return;
    }

    // 如果在结果中，tab 往下走；到末尾则回到第一个结果（你要求的行为）
    const next = activeIndex + 1;
    const target = next >= filtered.length ? 0 : next;
    setActiveIndex(target);
    requestAnimationFrame(() => optionRefs.current[target]?.focus());
  };

  // input 键盘处理
  const handleInputKeyDown = (e) => {
    if (e.key === "Tab") {
      // 拦截默认 tab 行为，改为我们自己的“向下/循环”逻辑
      e.preventDefault();
      moveFocusByTab(e.shiftKey);
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    // 可选：Enter 时如果只有一个结果，直接选中
    if (e.key === "Enter") {
      if (open && filtered.length === 1) {
        selectItem(filtered[0]);
      }
    }
  };

  // 结果项键盘处理：Tab 循环、Enter 选择、Esc 关闭、（可选）Arrow 上下
  const handleOptionKeyDown = (e, index) => {
    if (e.key === "Tab") {
      e.preventDefault();
      moveFocusByTab(e.shiftKey);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectItem(filtered[index]);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
      return;
    }

    // 可选：方向键上下移动（比 Tab 更常见，但不影响你的 Tab 需求）
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = index + 1 >= filtered.length ? 0 : index + 1;
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = index - 1 < 0 ? filtered.length - 1 : index - 1;
      setActiveIndex(prev);
      optionRefs.current[prev]?.focus();
    }
  };

  return (
    <div style={styles.root}>
      <label style={styles.label}>选择卡片</label>

      <input
        ref={inputRef}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleInputKeyDown}
        style={styles.input}
        aria-expanded={open}
        aria-controls="search-results"
      />

      {open && (
        <div id="search-results" style={styles.dropdown} role="listbox">
          {filtered.length === 0 ? (
            <div style={styles.empty}>没有匹配的标题</div>
          ) : (
            filtered.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                role="option"
                aria-selected={idx === activeIndex}
                ref={(el) => (optionRefs.current[idx] = el)}
                onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                onMouseDown={(e) => {
                  // 防止 mousedown 导致 input blur 触发关闭（常见问题）
                  e.preventDefault();
                }}
                onClick={() => selectItem(it)}
                style={{
                  ...styles.option,
                  ...(idx === activeIndex ? styles.optionActive : null),
                }}
              >
                <div style={styles.optionTitle}>{it.title}</div>
                {/* 你可以把卡片更多信息也展示出来（内容摘要、标签等） */}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    width: 420,
    position: "relative",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    opacity: 0.85,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    outline: "none",
  },
  dropdown: {
    marginTop: 8,
    border: "1px solid #eee",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    maxHeight: 260,
    overflowY: "auto",
  },
  empty: {
    padding: 12,
    fontSize: 13,
    opacity: 0.75,
  },
  option: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
    cursor: "pointer",
  },
  optionActive: {
    background: "#f6f7f9",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
};
