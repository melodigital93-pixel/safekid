"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const WA_NUMBER = "5511999999999"; // TROQUE pelo seu número com DDI+DDD
const WA_LINK   = `https://wa.me/${WA_NUMBER}?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20o%20SafeKid`;

export default function LoginPage() {
  const [tab, setTab]         = useState<"login"|"register">("register");
  const [email, setEmail]     = useState("");
  const [pass,  setPass]      = useState("");
  const [name,  setName]      = useState("");
  const [err,   setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function saveUser(uid: string, email: string, displayName: string) {
    const ref  = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await setDoc(ref, {
        uid, email, name: displayName, plan: "trial",
        trialEndsAt, planExpiresAt: null, createdAt: serverTimestamp(),
      });
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      if (tab === "register") {
        const uc = await createUserWithEmailAndPassword(auth, email, pass);
        await saveUser(uc.user.uid, email, name);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      router.push("/dashboard");
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use" ? "Este email já está cadastrado. Faça login."
        : e.code === "auth/wrong-password" ? "Senha incorreta."
        : e.code === "auth/user-not-found"  ? "Email não encontrado."
        : "Erro: " + e.message;
      setErr(msg);
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setErr(""); setLoading(true);
    try {
      const uc = await signInWithPopup(auth, new GoogleAuthProvider());
      await saveUser(uc.user.uid, uc.user.email!, uc.user.displayName || "");
      router.push("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      {/* Hero */}
      <div className="bg-gradient-to-b from-navy2 to-navy pt-10 pb-6 px-4 text-center">
        <div className="sora font-extrabold text-3xl flex items-center justify-center gap-2 mb-2">
          <span className="w-4 h-4 rounded-full bg-teal inline-block"/>SafeKid
        </div>
        <p className="text-white font-semibold text-lg mb-1">Controle parental inteligente</p>
        <p className="text-muted text-sm">GPS • Bloqueio de apps • Alertas SOS</p>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {["📍 GPS em tempo real","🔒 Bloqueio de apps","🆘 Botão SOS","⏱️ Tempo de tela"].map(f => (
            <span key={f} className="text-xs bg-teal/10 border border-teal/20 text-teal px-3 py-1 rounded-full">{f}</span>
          ))}
        </div>
      </div>

      {/* Card login */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-bdr rounded-2xl p-6 mb-4">
            <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 text-teal text-xs px-3 py-1.5 rounded-full mb-4">
              ⚡ 24 horas GRÁTIS — sem cartão de crédito
            </div>
            <div className="flex bg-navy rounded-xl p-1 mb-5">
              {(["register","login"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={["flex-1 py-2 rounded-lg text-sm font-bold sora transition-colors",
                    tab===t ? "bg-teal text-black" : "text-muted"].join(" ")}>
                  {t==="register" ? "Criar conta" : "Entrar"}
                </button>
              ))}
            </div>
            <form onSubmit={handleEmail} className="space-y-3">
              {tab==="register" && (
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" required
                  className="w-full bg-navy border border-bdr rounded-xl px-4 py-3 text-sm outline-none focus:border-teal placeholder:text-muted"/>
              )}
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required
                className="w-full bg-navy border border-bdr rounded-xl px-4 py-3 text-sm outline-none focus:border-teal placeholder:text-muted"/>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="Senha (mínimo 6 caracteres)" required minLength={6}
                className="w-full bg-navy border border-bdr rounded-xl px-4 py-3 text-sm outline-none focus:border-teal placeholder:text-muted"/>
              {err && <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg">{err}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-teal text-black sora font-bold py-3.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                {loading ? "Aguarde..." : tab==="register" ? "🚀 Começar teste grátis (24h)" : "Entrar"}
              </button>
            </form>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-bdr"/><span className="text-xs text-muted">ou</span><div className="flex-1 h-px bg-bdr"/>
            </div>
            <button onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-navy border border-bdr rounded-xl py-3 text-sm hover:border-teal transition-colors">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          {/* FAQ rápido */}
          <div className="bg-card border border-bdr rounded-2xl p-4 mb-4">
            <p className="sora font-bold text-white text-sm mb-3">❓ Dúvidas frequentes</p>
            {[
              ["Como instalo no celular do filho?","Você recebe um link/QR Code para abrir no celular do filho. Funciona pelo navegador — sem precisar instalar app."],
              ["O filho sabe que está sendo monitorado?","O dispositivo exibe um aviso de monitoramento, conforme exige a lei brasileira (ECA/LGPD)."],
              ["Funciona no iPhone?","Sim! GPS e alertas SOS funcionam no iPhone pelo navegador Safari."],
              ["Posso cancelar a qualquer momento?","Sim, sem multa ou fidelidade."],
            ].map(([q,a]) => (
              <details key={q} className="border-b border-bdr last:border-0 py-2">
                <summary className="text-sm text-white cursor-pointer">{q}</summary>
                <p className="text-xs text-muted mt-2 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>

          {/* WhatsApp */}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white sora font-bold py-3.5 rounded-xl text-sm transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
