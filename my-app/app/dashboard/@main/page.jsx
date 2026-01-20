// app/dashboard/@main/page.tsx
const stats = [
  { label: "Active users", value: "1,284", delta: "+6.2%" },
  { label: "New signups", value: "312", delta: "+3.1%" },
  { label: "Errors", value: "7", delta: "-1.4%" },
];

const tasks = [
  { title: "Review new comments", due: "Today 16:00" },
  { title: "Update release notes", due: "Tomorrow" },
  { title: "Triage support tickets", due: "Fri" },
];

const updates = [
  { title: "v2.4.0 shipped", note: "Perf improvements and new billing flow" },
  { title: "New integrations", note: "Slack, Jira, Notion" },
  { title: "Incident report", note: "All services back to normal" },
];

export default function DashboardMain() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            Overview of your workspace status.
          </p>
        </div>
        <button
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create report
        </button>
      </header>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: 12 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                {item.value}
              </div>
              <div style={{ color: "#10b981", marginTop: 4 }}>{item.delta}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1.4fr 1fr",
        }}
      >
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
          }}
        >
          <h2 style={{ margin: "0 0 10px" }}>Tasks</h2>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {tasks.map((task) => (
              <li key={task.title} style={{ marginBottom: 8 }}>
                <strong>{task.title}</strong>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{task.due}</div>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
          }}
        >
          <h2 style={{ margin: "0 0 10px" }}>Updates</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {updates.map((item) => (
              <div key={item.title}>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

