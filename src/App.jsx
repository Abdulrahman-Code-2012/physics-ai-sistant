import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Tutor from "./pages/Tutor.jsx";
import MarkMyWork from "./pages/MarkMyWork.jsx";
import Nav from "./components/Nav.jsx";

function Protected({ session, children }) {
  return session ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data }) => {
        if (mounted) setSession(data?.session ?? null);
      })
      .catch((error) => {
        console.error("Supabase session initialization failed:", error);
        if (mounted) setSession(null);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <Nav session={session} />
      <Routes>
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/auth" element={session ? <Navigate to="/tutor" replace /> : <Auth />} />
        <Route path="/tutor" element={<Protected session={session}><Tutor session={session} /></Protected>} />
        <Route path="/mark" element={<Protected session={session}><MarkMyWork session={session} /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
