"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, writeBatch, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { BottomNav } from "@/components/BottomNav";

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "alerts"), where("parentUid","==",user.uid), orderBy("createdAt","desc"), limit(50));
    return onSnapshot(q, snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  async function markAllRead() {
    const batch = writeBatch(db);
    alerts.filter(a => !a.read).forEach(a => batch.update(doc(db,"alerts",a.id), { read: true }));
    await batch.commit();
  }

  const icons: Record<string,string> = { sos: "🆘", geofence: "📍", screentime: "⏱️" };
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="sora font-extrabold text-xl text-white">🔔 Alertas</h1>
          <p className="text-muted text-xs mt-0.5">{unread} não lidos</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-xs text-teal border border-teal/30 px-3 py-1.5 rounded-xl">
            Marcar todos lidos
          </button>
        )}
      </div>

      <div className="bg-card border border-bdr rounded-2xl divide-y divide-bdr">
        {alerts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-muted text-sm">Nenhum alerta. Tudo tranquilo!</p>
          </div>
        ) : alerts.map(a => {
          const ts = a.createdAt?.toDate?.() ?? new Date(a.createdAt?.seconds*1000);
          return (
            <div key={a.id} className={`flex items-start gap-3 p-4 ${!a.read?"bg-teal/5":""}`}>
              <span className="text-2xl">{icons[a.type]||"🔔"}</span>
              <div className="flex-1">
                <p className={`text-sm ${!a.read?"text-white font-medium":"text-muted"}`}>{a.message}</p>
                <p className="text-xs text-muted mt-0.5">{ts.toLocaleString("pt-BR")}</p>
                {a.lat && a.lng && (
                  <a href={`https://maps.google.com/?q=${a.lat},${a.lng}`}
                    target="_blank" className="text-xs text-teal underline">Ver no mapa</a>
                )}
              </div>
              {!a.read && <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 mt-1"/>}
            </div>
          );
        })}
      </div>
      <BottomNav active="alertas"/>
    </div>
  );
}
