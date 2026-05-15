"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [alerts,   setAlerts]   = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [trial,    setTrial]    = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    // Dados do usuário e trial
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setUserData(d);
      const trialEnd = d.trialEndsAt?.toDate?.() ?? new Date(d.trialEndsAt);
      const days = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000));
      setTrial(days);
    });

    // Filhos em tempo real
    const qc = query(collection(db, "children"), where("parentUid", "==", user.uid), where("active", "==", true));
    const unsub1 = onSnapshot(qc, snap => setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // Alertas em tempo real
    const qa = query(collection(db, "alerts"), where("parentUid", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
    const unsub2 = onSnapshot(qa, snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsub1(); unsub2(); };
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-teal sora text-lg animate-pulse">Carregando...</div>
    </div>
  );

  const unread = alerts.filter(a => !a.read).length;
  const planOk  = userData?.plan === "pro" || userData?.plan === "family";

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="sora font-extrabold text-xl flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal inline-block"/>SafeKid
        </div>
        {trial !== null && trial <= 3 && !planOk && (
          <Link href="/dashboard/settings" className="text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-full">
            ⚠️ {trial === 0 ? "Trial expirado" : `${trial}d restantes`}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: "👧", val: children.length, label: "Filhos" },
          { icon: "🔔", val: unread,          label: "Alertas" },
          { icon: "📍", val: children.filter(c=>c.lastSeen).length, label: "Online" },
          { icon: "🛡️", val: "Ativo",         label: "Proteção" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-bdr rounded-2xl p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="sora font-extrabold text-xl text-teal">{s.val}</div>
            <div className="text-muted text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filhos */}
      <div className="bg-card border border-bdr rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="sora font-bold text-white">Filhos monitorados</h2>
          <Link href="/dashboard/settings" className="text-xs text-teal">+ Adicionar</Link>
        </div>
        {children.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted text-sm mb-3">Nenhum filho cadastrado.</p>
            <Link href="/dashboard/settings"
              className="bg-teal text-black sora font-bold px-4 py-2 rounded-xl text-sm">
              Cadastrar agora
            </Link>
          </div>
        ) : children.map(c => (
          <div key={c.id} className="flex items-center gap-3 py-2.5 border-b border-bdr last:border-0">
            <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center sora font-bold text-teal text-sm">
              {c.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">{c.name}</div>
              <div className="text-xs text-muted">{c.age} anos</div>
            </div>
            <Link href={"/dashboard/location?id="+c.id} className="text-xs text-teal border border-teal/30 px-2 py-1 rounded-lg">
              Ver GPS
            </Link>
          </div>
        ))}
      </div>

      {/* Alertas */}
      <div className="bg-card border border-bdr rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="sora font-bold text-white">Alertas recentes</h2>
          <Link href="/dashboard/alerts" className="text-xs text-teal">Ver todos</Link>
        </div>
        {alerts.length === 0 ? (
          <p className="text-center text-muted text-sm py-4">Nenhum alerta. Tudo tranquilo! ✅</p>
        ) : alerts.map(a => (
          <div key={a.id} className={`flex items-start gap-3 py-2.5 border-b border-bdr last:border-0 ${!a.read?"opacity-100":"opacity-60"}`}>
            <span className="text-xl">{a.type==="sos"?"🆘":a.type==="geofence"?"📍":"⏱️"}</span>
            <div className="flex-1">
              <p className="text-sm text-white">{a.message}</p>
              {!a.read && <span className="text-xs text-teal">Novo</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <BottomNav active="home"/>
    </div>
  );
}

