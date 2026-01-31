"use client";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

// 静态题库 -> 组件渲染时读取，不会被修改
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

export default function AboutPage() {
  // 本组件的“源数据”：用户选择的答案，键是题目 id
  const [answers, setAnswers] = useState({});
  // 是否已经提交，影响 UI 显示和交互是否可用
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId, optionKey) => {
    // 用户点击选项 -> 更新 answers -> 触发重新渲染
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const allAnswered = useMemo(() => {
    // 派生数据：根据 answers 计算是否所有题都已回答
    return QUESTIONS.every((q) => answers[q.id]);
  }, [answers]);

  const result = useMemo(() => {
    // 派生数据：基于 answers + QUESTIONS 计算得分与对错明细
    const total = QUESTIONS.length;
    let correctCount = 0;

    const detail = QUESTIONS.map((q) => {
      const user = answers[q.id]; // 用户选择
      const correct = q.answer; // 正确答案
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

  const handleSubmit = () => {
    // 点击“提交” -> submitted 变为 true -> 展示结果和解析
    if (!allAnswered) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    // 点击“清空/重做” -> 回到初始状态
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.kicker}>React 入门小测验</p>
          <h2 className={styles.title}>问卷小测验（单选题）</h2>
          <p className={styles.subtitle}>
            做完再提交，看看你的准确率。提交后可查看解析。
          </p>
        </header>

        {submitted && (
          <div className={styles.summary} aria-live="polite">
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

        <div className={styles.list}>
          {QUESTIONS.map((q, index) => {
            const userChoice = answers[q.id];
            const isAnswered = !!userChoice;

            const isCorrect = submitted ? userChoice === q.answer : null;

            return (
              <div key={q.id} className={styles.card} style={{ "--i": index }}>
                <div className={styles.titleRow}>
                  <div className={styles.questionTitle}>{q.title}</div>

                  {submitted && (
                    <span
                      className={`${styles.badge} ${
                        isCorrect ? styles.badgeCorrect : styles.badgeWrong
                      }`}
                    >
                      {isCorrect ? "正确" : "错误"}
                    </span>
                  )}
                </div>

                <div className={styles.options}>
                  {Object.entries(q.options).map(([key, text]) => {
                    const selected = userChoice === key;
                    const optionClass = [
                      styles.option,
                      selected && styles.optionSelected,
                      submitted && key === q.answer && styles.optionCorrect,
                      submitted &&
                        selected &&
                        key !== q.answer &&
                        styles.optionWrong,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={key}
                        type="button"
                        // 把题目 id 和选项 key 传给 handleSelect
                        onClick={() => handleSelect(q.id, key)}
                        className={optionClass}
                        aria-pressed={selected}
                        // submitted = true 时禁用按钮，避免更改答案
                        disabled={submitted}
                      >
                        <strong className={styles.optionKey}>{key}.</strong>
                        <span className={styles.optionText}>{text}</span>
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className={styles.explain}>
                    <div>
                      你的答案：<strong>{userChoice}</strong>；正确答案：
                      <strong>{q.answer}</strong>
                    </div>
                    {q.explanation && (
                      <div className={styles.explainText}>
                        解析：{q.explanation}
                      </div>
                    )}
                  </div>
                )}

                {!submitted && (
                  <div className={styles.status}>
                    {isAnswered ? `已选择：${userChoice}` : "未作答"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          {!submitted ? (
            <>
              <button
                type="button"
                // 点击提交 -> submitted 变化 -> UI 从“作答态”切到“结果态”
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={`${styles.actionBtn} ${
                  allAnswered ? styles.primaryBtn : styles.disabledBtn
                }`}
              >
                提交
              </button>
              <button
                type="button"
                // 点击清空 -> answers 置空 -> 所有题目回到未作答
                onClick={handleReset}
                className={styles.actionBtn}
              >
                清空重做
              </button>
              {!allAnswered && (
                <span className={styles.hint}>请先完成全部题目后再提交</span>
              )}
            </>
          ) : (
            <button
              type="button"
              // 结果态的重做逻辑同上
              onClick={handleReset}
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
            >
              重新作答
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
