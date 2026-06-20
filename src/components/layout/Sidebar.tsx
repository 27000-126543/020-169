import { NavLink } from "react-router-dom";
import { ClipboardList, FolderOpen, BarChart3, Cross } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "今日待办", icon: ClipboardList, to: "/" },
  { label: "病例管理", icon: FolderOpen, to: "/cases" },
  { label: "数据总览", icon: BarChart3, to: "/stats" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-primary-800">
      <div className="flex items-center gap-2 px-5 py-6">
        <Cross className="h-5 w-5 text-primary-200" />
        <span className="text-lg font-bold text-white">根管复诊通</span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-primary-200 hover:bg-primary-700 hover:text-white"
              )
            }
          >
            <Icon className="h-4.5 w-4.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-4">
        <p className="text-xs text-primary-400">数据存于本地浏览器</p>
      </div>
    </aside>
  );
}
