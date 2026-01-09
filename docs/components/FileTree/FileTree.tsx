import React, { useMemo, useState } from "react";

type FileKind = "file" | "dir";

export type FileNode = {
  name: string;
  kind: FileKind;
  /** 仅当 kind === 'dir' 时使用 */
  children?: FileNode[];
  /** 可选：给文件额外说明，比如用途 */
  note?: string;
};

type Props = {
  /** 树数据 */
  data: FileNode;
  /** 根路径前缀：如 "apps/web" 或 "" */
  basePath?: string;
  /** 默认展开到第几层（根=0） */
  defaultExpandDepth?: number;
  /** 是否默认全部展开（优先级高于 defaultExpandDepth） */
  expandAll?: boolean;
  /** 视觉宽度限制 */
  maxWidth?: number | string;
};

function joinPath(...parts: string[]) {
  const cleaned = parts
    .filter(Boolean)
    .map((p) => p.replace(/^\/*/, "").replace(/\/*$/, ""));
  return cleaned.join("/");
}

function isDir(node: FileNode) {
  return node.kind === "dir";
}

export default function FileTree({
  data,
  basePath = "",
  defaultExpandDepth = 2,
  expandAll = false,
  maxWidth = "100%",
}: Props) {
  // 用 path 作为 id
  const rootPath = useMemo(
    () => joinPath(basePath, data.name),
    [basePath, data.name]
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};

    const walk = (node: FileNode, parentPath: string, depth: number) => {
      const path = joinPath(parentPath, node.name);

      if (isDir(node)) {
        map[path] = expandAll ? true : depth <= defaultExpandDepth;
        node.children?.forEach((c) => walk(c, path, depth + 1));
      }
    };

    // root 节点如果是 dir，也允许折叠
    walk(data, basePath, 0);
    return map;
  });

  const [selectedPath, setSelectedPath] = useState<string>(rootPath);

  const breadcrumb = useMemo(() => {
    const p = selectedPath.replace(/^\/*/, "");
    return p ? p.split("/") : [];
  }, [selectedPath]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 文档组件里不建议 alert，给个轻量反馈
      console.log("Copied:", text);
    } catch {
      // 兼容老环境：降级方案
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const NodeRow = ({
    node,
    parentPath,
    depth,
    isLast,
    parentLastFlags,
  }: {
    node: FileNode;
    parentPath: string;
    depth: number;
    isLast: boolean;
    parentLastFlags: boolean[];
  }) => {
    const path = joinPath(parentPath, node.name);
    const dir = isDir(node);
    const open = expanded[path] ?? false;
    const selected = path === selectedPath;

    // 画“树枝”连接线：用字符更稳（不用复杂 CSS）
    const prefix = parentLastFlags
      .map((last) => (last ? "   " : "│  "))
      .join("");
    const branch = depth === 0 ? "" : isLast ? "└─ " : "├─ ";

    return (
      <div
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 8px",
            borderRadius: 10,
            background: selected ? "rgba(99,102,241,0.12)" : "transparent",
            cursor: "pointer",
          }}
          onClick={() => setSelectedPath(path)}
          title={path}
        >
          <span style={{ whiteSpace: "pre", color: "#94a3b8" }}>
            {prefix}
            {branch}
          </span>

          {/* 折叠按钮（目录才显示） */}
          {dir ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(path);
              }}
              aria-label={open ? "Collapse folder" : "Expand folder"}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(15,23,42,0.02)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: open ? "rotate(90deg)" : "none",
                }}
              >
                ▶
              </span>
            </button>
          ) : (
            <span style={{ width: 26, height: 26, display: "inline-block" }} />
          )}

          {/* 图标 */}
          <span style={{ width: 18, textAlign: "center" }} aria-hidden>
            {dir ? "📁" : "📄"}
          </span>

          {/* 名称 */}
          <span style={{ fontWeight: 600 }}>{node.name}</span>

          {/* note */}
          {node.note ? (
            <span style={{ marginLeft: 8, color: "#64748b", fontSize: 12 }}>
              {node.note}
            </span>
          ) : null}

          <span style={{ flex: 1 }} />

          {/* 复制按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copy(path);
            }}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(15,23,42,0.02)",
              cursor: "pointer",
            }}
          >
            Copy path
          </button>
        </div>

        {/* children */}
        {dir && open && node.children?.length ? (
          <div style={{ marginLeft: 0 }}>
            {node.children.map((child, idx) => (
              <NodeRow
                key={joinPath(path, child.name)}
                node={child}
                parentPath={path}
                depth={depth + 1}
                isLast={idx === node.children!.length - 1}
                parentLastFlags={[...parentLastFlags, isLast]}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth,
        border: "1px solid rgba(148,163,184,0.28)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(2,6,23,0.02)",
      }}
    >
      {/* Header: breadcrumb + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          <span style={{ color: "#64748b", marginRight: 8 }}>Selected:</span>
          <span style={{ fontWeight: 700 }}>{selectedPath}</span>
        </div>

        <span style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => copy(selectedPath)}
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.02)",
            cursor: "pointer",
          }}
        >
          Copy selected
        </button>

        <button
          type="button"
          onClick={() => {
            // 全部展开/折叠：根据当前是否“几乎全展开”来切换
            const next: Record<string, boolean> = {};
            const walk = (node: FileNode, parentPath: string) => {
              const path = joinPath(parentPath, node.name);
              if (isDir(node)) {
                next[path] = true;
                node.children?.forEach((c) => walk(c, path));
              }
            };
            const allTrue = Object.values(expanded).every(Boolean);
            if (allTrue) {
              // 折叠到 defaultExpandDepth
              const map: Record<string, boolean> = {};
              const walk2 = (
                node: FileNode,
                parentPath: string,
                depth: number
              ) => {
                const path = joinPath(parentPath, node.name);
                if (isDir(node)) {
                  map[path] = depth <= defaultExpandDepth;
                  node.children?.forEach((c) => walk2(c, path, depth + 1));
                }
              };
              walk2(data, basePath, 0);
              setExpanded(map);
            } else {
              walk(data, basePath);
              setExpanded(next);
            }
          }}
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.02)",
            cursor: "pointer",
          }}
        >
          Toggle all
        </button>
      </div>

      {/* Breadcrumb */}
      <div
        style={{
          marginBottom: 12,
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px dashed rgba(148,163,184,0.35)",
          color: "#475569",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 12,
        }}
      >
        {breadcrumb.length ? (
          breadcrumb.map((seg, i) => (
            <span key={i}>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>{seg}</span>
              {i !== breadcrumb.length - 1 ? (
                <span style={{ margin: "0 6px", color: "#94a3b8" }}>/</span>
              ) : null}
            </span>
          ))
        ) : (
          <span>—</span>
        )}
      </div>

      {/* Tree */}
      <NodeRow
        node={data}
        parentPath={basePath}
        depth={0}
        isLast={true}
        parentLastFlags={[]}
      />
    </div>
  );
}
