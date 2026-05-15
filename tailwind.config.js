import { initializeApp, getApps } from "firebase/app";
import { getAuth }      from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ SUBSTITUA pelos seus dados do Firebase Console
// (o guia abaixo mostra exatamente onde copiar cada valor)
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FB_API_KEY      || "COLE_AQUI",
  authDomain:        process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN  || "COLE_AQUI",
  projectId:         process.env.NEXT_PUBLIC_FB_PROJECT_ID   || "COLE_AQUI",
  storageBucket:     process.env.NEXT_PUBLIC_FB_BUCKET       || "COLE_AQUI",
  messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER_ID    || "COLE_AQUI",
  appId:             process.env.NEXT_PUBLIC_FB_APP_ID       || "COLE_AQUI",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
