// app/dashboard/@activity/default.tsx
export default function ActivityDefault() {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: "1px dashed #e5e7eb",
        background: "#f9fafb",
      }}
    >
      <h3 style={{ margin: 0 }}>Activity</h3>
      <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
        No activity yet. When events arrive, they will show up here.
      </p>
    </div>
  );
}
