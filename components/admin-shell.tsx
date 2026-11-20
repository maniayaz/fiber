"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/app-shell";
import { signOutAdmin } from "@/app/admin/actions";

const navigation: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: ClipboardList },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Packages", href: "/admin/packages", icon: Package },
  { title: "Settings", href: "/admin/settings", icon: Settings },
  { title: "Audit history", href: "/admin/audit-logs", icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPage = navigation.find(({ href }) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href),
  );
  const title = currentPage?.title ?? "Overview";

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Brand compact />
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin workspace navigation">
          {navigation.map(({ title: itemTitle, href, icon: Icon }) => (
            <Link
              className={currentPage?.href === href ? "active" : ""}
              href={href}
              key={href}
              aria-current={currentPage?.href === href ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{itemTitle}</span>
              {currentPage?.href === href && <span className="nav-active-mark" />}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-avatar">FL</span>
          <span><strong>Admin account</strong><small>Authorized</small></span>
        </div>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar">
          <div className="admin-breadcrumb">Workspace <span>/</span> {title}</div>
          <div className="admin-top-actions">
            <span className="preview-chip">ADMIN ACCESS</span>
            <form action={signOutAdmin}>
              <button className="admin-profile" type="submit" aria-label="Sign out of admin workspace">
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
        <div className="admin-content">
          <div className="admin-warning">
            <ShieldAlert size={20} />
            <div>
              <strong>Admin sign-in is protected; live data is not connected</strong>
              <p>Only configured admin email accounts can enter this workspace. The screens still contain no live customer data and do not perform administrative actions.</p>
            </div>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
