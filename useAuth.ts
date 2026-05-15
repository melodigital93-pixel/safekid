"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { BottomNav } from "@/components/BottomNav";

export function LocationInner() {
  const { user } = useAuth();
  const sp = useSearchParams();
  const childId = sp.get("id") || "";
  const [children, setChildren] = useState<any[]>([]);
  const [selId,    setSelId]    = useState(childId);
  const [history,  setHistory]  = useState<any[]>([]);
  const [current,  setCurrent]  = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "children"), where("parentUid", "==", user.uid), where("active", "==", true));
    return onSnapshot(q, snap => {
      const kids = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChildren(kids);
      if (!selId && kids.length > 0) setSelId(kids[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!selId) return;
    // Localização atual
    const unsub1 = onSnapshot(doc(db, "children", selId), snap => {
      if (snap.exists()) setCurrent(snap.data()?.lastLocation ?? null);
    });
    // Histórico últimas 24h
    const since = new Date(Date.now() - 86400000);
    const q = query(
      collection(db, "locations", selId, "history"),
      where("timestamp", ">=", since),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsub2 = onSnapshot(q, snap => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsub1(); unsub2(); };
  }, [selId]);

  const child = children.find(c => c.id === selId);

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="sora font-extrabold text-xl text-white mb-4">📍 Localização GPS</h1>

      {/* Seletor de filho */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {children.map(c => (
          <button key={c.id} onClick={() => setSelId(c.id)}
            className={`px-4 py-2 rounded-xl text-sm sora font-semibold border flex-shrink-0 transition-colors
              ${selId===c.id?"bg-teal text-black border-teal":"border-bdr text-muted"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {!selId ? (
        <div className="bg-card border border-bdr rounded-2xl p-12 text-center text-muted">
          Adicione um filho em Configurações primeiro.
        </div>
      ) : (
        <>
          {/* Status atual */}
          <div className="bg-card border border-bdr rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="sora font-bold text-white">Localização agora</h2>
              <span className={`w-2 h-2 rounded-full ${current?"bg-teal":"bg-gray-600"}`}/>
            </div>
            {current ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-navy rounded-xl p-3">
                    <div className="text-xs text-muted mb-1">Latitude</div>
                    <div className="sora font-bold text-white text-sm">{Number(current.lat).toFixed(6)}</div>
                  </div>
                  <div className="bg-navy rounded-xl p-3">
                    <div className="text-xs text-muted mb-1">Longitude</div>
                    <div className="sora font-bold text-white text-sm">{Number(current.lng).toFixed(6)}</div>
                  </div>
                </div>
                {current.battery !== undefined && (
                  <p className="text-xs text-muted mb-3">🔋 Bateria: {current.battery}%</p>
                )}
                <a
                  href={`https://maps.google.com/?q=${current.lat},${current.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-teal text-black sora font-bold py-3 rounded-xl text-sm">
                  📍 Abrir no Google Maps
                </a>
              </>
            ) : (
              <p className="text-muted text-sm text-center py-4">
                Aguardando localização do dispositivo filho...<br/>
                <span className="text-xs">O app filho precisa estar aberto com GPS ativado.</span>
              </p>
            )}
          </div>

          {/* Histórico */}
          <div className="bg-card border border-bdr rounded-2xl p-4">
            <h2 className="sora font-bold text-white mb-3">Histórico (últimas 24h)</h2>
            {history.length === 0 ? (
              <p className="text-muted text-sm text-center py-4">Sem registros ainda.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map(h => {
                  const ts = h.timestamp?.toDate?.() ?? new Date(h.timestamp?.seconds * 1000);
                  return (
                    <a key={h.id}
                      href={`https://maps.google.com/?q=${h.lat},${h.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between py-2 border-b border-bdr last:border-0 text-sm hover:opacity-80">
                      <span className="text-muted">{ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-white font-mono text-xs">{Number(h.lat).toFixed(5)}, {Number(h.lng).toFixed(5)}</span>
                      <span className="text-teal text-xs">→ Mapa</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      <BottomNav active="gps"/>
    </div>
  );
}
