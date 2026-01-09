// app/dashboard/@activity/notifications/page.tsx
const notifications = [
  { title: "Payment received", time: "2m ago", tag: "Billing" },
  { title: "New comment on PR #42", time: "1h ago", tag: "Dev" },
  { title: "Weekly report generated", time: "Yesterday", tag: "Reports" },
  { title: "New signup: acme.io", time: "2 days ago", tag: "Growth" },
];

export default function ActivityNotifications() {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <button
          type="button"
          style={{
            fontSize: 12,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          Mark all read
        </button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {notifications.map((item) => (
          <div
            key={item.title}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #f3f4f6",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>{item.time}</div>
            <span
              style={{
                display: "inline-block",
                marginTop: 6,
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 999,
                background: "#e5e7eb",
                color: "#374151",
              }}
            >
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
