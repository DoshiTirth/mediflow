import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Anomalies from './pages/Anomalies';
import PatientDetail from './pages/PatientDetail';
import Login from './pages/Login';
import './styles/globals.css';
import ModelManagement from './pages/ModelManagement';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function ProtectedLayout({ theme, onThemeToggle }) {
  const { user, logout, loading } = useAuth();

  if (loading) return (
    <div style={{
      height:         '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     'var(--font-mono)',
      fontSize:       12,
      color:          'var(--text-muted)',
    }}>Loading...</div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar theme={theme} onThemeToggle={onThemeToggle} user={user} onLogout={logout} />
      <main style={{
        marginLeft:    'var(--sidebar-width)',
        flex:          1,
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
      }}>
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/patients"       element={<Patients />} />
          <Route path="/patients/:id"   element={<PatientDetail />} />
          <Route path="/anomalies"      element={<Anomalies />} />
          <Route path="/model"          element={<ModelManagement />} />
          <Route path="/reports"        element={<Reports />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes({ theme, onThemeToggle }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*"     element={<ProtectedLayout theme={theme} onThemeToggle={onThemeToggle} />} />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes theme={theme} onThemeToggle={toggleTheme} />
      </AuthProvider>
    </BrowserRouter>
  );
}