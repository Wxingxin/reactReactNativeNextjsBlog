// app/dashboard/layout.tsx
export default function DashboardLayout({ sidebar, main, activity }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr 320px",
        gap: 16,
      }}
    >
      <aside>{sidebar}</aside>
      <section>{main}</section>
      <aside>{activity}</aside>
    </div>
  );
}
