下面给你一个在 React 项目里非常典型的「选择题问卷/小测验」组件：支持 **A/B/C/D 单选**、**提交后显示每题对错**、**显示正确率**、并且可 **重新作答**。代码可直接复制使用（纯 React，不依赖外部库）。

---

## 1) 组件目标与数据结构

### 题目数据（数组 + 正确答案）

每道题包含：题干、选项、正确答案（A/B/C/D）。

```jsx
const QUESTIONS = [
  {
    id: 1,
    title: "1. React 中用于保存组件状态的 Hook 是？",
    options: {
      A: "useRef",
      B: "useState",
      C: "useMemo",
      D: "useEffect",
    },
    answer: "B",
    explanation: "useState 用于声明并更新组件状态。",
  },
  {
    id: 2,
    title: "2. JSX 最终会被编译成什么？",
    options: {
      A: "HTML 字符串",
      B: "CSS",
      C: "React.createElement 调用",
      D: "JSON",
    },
    answer: "C",
    explanation: "JSX 会被编译为 React.createElement(...) 调用。",
  },
  {
    id: 3,
    title: "3. 以下哪项可以避免组件每次渲染都创建新函数（在部分场景下）？",
    options: {
      A: "useCallback",
      B: "useEffect",
      C: "useLayoutEffect",
      D: "useId",
    },
    answer: "A",
    explanation: "useCallback 用于缓存函数引用（依赖不变时复用）。",
  },
];
```

---

## 2) Quiz 组件（完整可用代码 + 注释）

```jsx
import { useMemo, useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    title: "1. React 中用于保存组件状态的 Hook 是？",
    options: { A: "useRef", B: "useState", C: "useMemo", D: "useEffect" },
    answer: "B",
    explanation: "useState 用于声明并更新组件状态。",
  },
  {
    id: 2,
    title: "2. JSX 最终会被编译成什么？",
    options: {
      A: "HTML 字符串",
      B: "CSS",
      C: "React.createElement 调用",
      D: "JSON",
    },
    answer: "C",
    explanation: "JSX 会被编译为 React.createElement(...) 调用。",
  },
  {
    id: 3,
    title: "3. 以下哪项可以避免组件每次渲染都创建新函数（在部分场景下）？",
    options: { A: "useCallback", B: "useEffect", C: "useLayoutEffect", D: "useId" },
    answer: "A",
    explanation: "useCallback 用于缓存函数引用（依赖不变时复用）。",
  },
];

export default function Quiz() {
  // answers: { [questionId]: "A" | "B" | "C" | "D" }
  const [answers, setAnswers] = useState({});
  // 是否已提交：提交后显示对错、正确答案、解析、准确率
  const [submitted, setSubmitted] = useState(false);

  // 选择某题选项
  const handleSelect = (questionId, optionKey) => {
    // 如果已经提交，通常不允许再改答案（更符合测验逻辑）
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  // 是否所有题都已作答
  const allAnswered = useMemo(() => {
    return QUESTIONS.every((q) => answers[q.id]);
  }, [answers]);

  // 计算得分与正确率（提交后也能复用展示）
  const result = useMemo(() => {
    const total = QUESTIONS.length;
    let correctCount = 0;

    const detail = QUESTIONS.map((q) => {
      const user = answers[q.id]; // 用户选择
      const correct = q.answer;   // 正确答案
      const isCorrect = user === correct;
      if (isCorrect) correctCount += 1;

      return {
        id: q.id,
        user,
        correct,
        isCorrect,
      };
    });

    const accuracy = total === 0 ? 0 : (correctCount / total) * 100;

    return { total, correctCount, accuracy, detail };
  }, [answers]);

  // 提交
  const handleSubmit = () => {
    // 未答完不允许提交（避免准确率误导）
    if (!allAnswered) return;
    setSubmitted(true);
  };

  // 重新作答
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={{ marginBottom: 12 }}>问卷小测验（单选题）</h2>

      {/* 提交后显示总览：正确率/分数 */}
      {submitted && (
        <div style={styles.summary}>
          <div>
            <strong>得分：</strong>
            {result.correctCount} / {result.total}
          </div>
          <div>
            <strong>正确率：</strong>
            {result.accuracy.toFixed(0)}%
          </div>
        </div>
      )}

      {/* 题目列表 */}
      <div style={{ display: "grid", gap: 12 }}>
        {QUESTIONS.map((q) => {
          const userChoice = answers[q.id];
          const isAnswered = !!userChoice;

          // 提交后：确定该题对错
          const isCorrect = submitted ? userChoice === q.answer : null;

          return (
            <div key={q.id} style={styles.card}>
              <div style={styles.titleRow}>
                <div style={styles.title}>{q.title}</div>

                {/* 提交后右侧显示对错标签 */}
                {submitted && (
                  <span
                    style={{
                      ...styles.badge,
                      ...(isCorrect ? styles.badgeCorrect : styles.badgeWrong),
                    }}
                  >
                    {isCorrect ? "正确" : "错误"}
                  </span>
                )}
              </div>

              {/* 选项 */}
              <div style={styles.options}>
                {Object.entries(q.options).map(([key, text]) => {
                  const selected = userChoice === key;

                  // 提交后：高亮正确答案、以及用户选错的选项
                  let optionStyle = { ...styles.option };
                  if (selected) optionStyle = { ...optionStyle, ...styles.optionSelected };

                  if (submitted) {
                    // 正确选项高亮
                    if (key === q.answer) optionStyle = { ...optionStyle, ...styles.optionCorrect };

                    // 用户选错：对用户选项标红（但不能覆盖正确选项高亮）
                    if (selected && key !== q.answer) optionStyle = { ...optionStyle, ...styles.optionWrong };
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelect(q.id, key)}
                      style={optionStyle}
                      aria-pressed={selected}
                    >
                      <strong style={{ width: 24, display: "inline-block" }}>{key}.</strong>
                      <span>{text}</span>
                    </button>
                  );
                })}
              </div>

              {/* 提交后显示：用户答案 / 正确答案 / 解析 */}
              {submitted && (
                <div style={styles.explain}>
                  <div>
                    你的答案：<strong>{userChoice}</strong>；正确答案：<strong>{q.answer}</strong>
                  </div>
                  {q.explanation && <div style={{ marginTop: 6, opacity: 0.85 }}>解析：{q.explanation}</div>}
                </div>
              )}

              {/* 未提交时：提示是否已作答 */}
              {!submitted && (
                <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
                  {isAnswered ? `已选择：${userChoice}` : "未作答"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div style={styles.actions}>
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              style={{
                ...styles.actionBtn,
                ...(allAnswered ? styles.primaryBtn : styles.disabledBtn),
              }}
            >
              提交
            </button>
            <button type="button" onClick={handleReset} style={styles.actionBtn}>
              清空重做
            </button>
            {!allAnswered && (
              <span style={{ fontSize: 13, opacity: 0.75 }}>请先完成全部题目后再提交</span>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={handleReset} style={{ ...styles.actionBtn, ...styles.primaryBtn }}>
              重新作答
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** 简单样式：可替换为 Tailwind / CSS Modules / styled-components */
const styles = {
  wrapper: {
    maxWidth: 720,
    margin: "24px auto",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  summary: {
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 10,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid transparent",
    flexShrink: 0,
  },
  badgeCorrect: {
    background: "#EAF7EE",
    borderColor: "#BFE8CA",
  },
  badgeWrong: {
    background: "#FDECEC",
    borderColor: "#F6B8B8",
  },
  options: {
    marginTop: 10,
    display: "grid",
    gap: 8,
  },
  option: {
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
  },
  optionSelected: {
    borderColor: "#888",
  },
  optionCorrect: {
    borderColor: "#2f9e44",
    background: "#EAF7EE",
  },
  optionWrong: {
    borderColor: "#e03131",
    background: "#FDECEC",
  },
  explain: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "#fafafa",
    border: "1px solid #eee",
    fontSize: 14,
  },
  actions: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
  },
  primaryBtn: {
    borderColor: "#1677ff",
    background: "#1677ff",
    color: "#fff",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
```

---

## 3) 组件讲解（你必须掌握的关键点）

### A. 为什么用 `answers` 存答案？

```js
const [answers, setAnswers] = useState({});
// answers = { 1: "B", 2: "C", ... }
```

好处：

* 能快速知道某题答了没：`answers[q.id]`
* 提交时能统一计算：遍历 `QUESTIONS`

---

### B. 为什么选择用「函数式 setState」

```js
setAnswers(prev => ({ ...prev, [questionId]: optionKey }))
```

因为你更新答案依赖旧值，函数式写法能避免并发更新时的旧状态问题（React 常见最佳实践）。

---

### C. 如何计算对错和准确率？

用 `useMemo` 做派生计算（避免每次 render 反复算）：

* 每题是否正确：`answers[q.id] === q.answer`
* 正确数量：累加
* 准确率：`correctCount / total * 100`

---

### D. 为什么提交后不允许改答案？

这是典型测验逻辑：

```js
if (submitted) return;
```

你也可以改成“提交后仍可改，但实时更新对错与准确率”，我也可以给你改版本。

---

## 4) 常见升级方向（真实项目会用）

1. **支持多选题**（answers 改成数组：`{ [id]: ["A","C"] }`）
2. **倒计时 + 自动提交**
3. **分页（一次只显示一题）**
4. **接入后端保存答题记录**
5. **题库随机抽题**（从题库中抽 N 道）

---

如果你告诉我你想要哪一种交互：

* “一次显示全部题”还是“每页一题（上一题/下一题）”
* “提交后禁止修改”还是“提交后仍可修改并实时更新正确率”

我可以把组件改成更贴合你项目的版本。
