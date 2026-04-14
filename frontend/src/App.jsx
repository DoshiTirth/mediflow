import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Anomalies from './pages/Anomalies';
import './styles/globals.css';

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar theme={theme} onThemeToggle={toggleTheme} />
        <main style={{
          marginLeft: 'var(--sidebar-width)',
          flex:       1,
          overflow:   'hidden',
          display:    'flex',
          flexDirection: 'column',
        }}>
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/patients"  element={<Patients />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}