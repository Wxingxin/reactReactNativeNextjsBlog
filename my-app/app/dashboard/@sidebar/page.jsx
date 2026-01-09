// app/dashboard/@sidebar/page.tsx
import Link from "next/link";
export default function Sidebar() {
  return (
    <nav>
      <Link href="/dashboard">概览</Link><br/>
      <Link href="/dashboard/settings">设置</Link><br/>
      <Link href="/dashboard/notifications">通知</Link>
    </nav>
  );
}
