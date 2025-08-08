import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';
import Auth from './Auth';
import { useState, useEffect } from 'react';
import { supabase } from './supabase-client';
import type { Session } from '@supabase/supabase-js';
import Room from './pages/Room';

// Protected Route Component
const ProtectedRoute = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={
          <ProtectedRoute session={session}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/room/:roomId" element={
          <ProtectedRoute session={session}>
            <Room />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
