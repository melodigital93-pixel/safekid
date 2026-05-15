"use client";
import Link from "next/link";
export function BottomNav({ active }: { active: string }) {
  const links = [
    { href: "/dashboard",          icon: "⊞",  label: "Painel",  k: "home"    },
    { href: "/dashboard/location", icon: "📍", label: "GPS",     k: "gps"     },
    { href: "/dashboard/alerts",   icon: "🔔", label: "Alertas", k: "alertas" },
    { href: "/dashboard/settings", icon: "⚙️", label: "Config",  k: "config"  },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy2 border-t border-bdr flex z-50">
      {links.map(l => (
        <Link key={l.href} href={l.href}
          className={["flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors",
            active === l.k ? "text-teal" : "text-muted"].join(" ")}>
          <span className="text-lg">{l.icon}</span>{l.label}
        </Link>
      ))}
    </nav>
  );
}
