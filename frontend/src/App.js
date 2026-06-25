import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import KayitPage from './pages/KayitPage';
import GirisPage from './pages/GirisPage';
import ForumPage from './pages/ForumPage';
import ForumKategoriPage from './pages/ForumKategoriPage';
import ForumKonuPage from './pages/ForumKonuPage';
import MarketPage from './pages/MarketPage';
import ProfilPage from './pages/ProfilPage';
import SiralamaPage from './pages/SiralamaPage';
import AdminPage from './pages/AdminPage';
import CuzdanPage from './pages/CuzdanPage';
import HakkimizdaPage from './pages/HakkimizdaPage';
import HaberDetayPage from './pages/HaberDetayPage';
import WikiPage from './pages/WikiPage';
import Snowfall from 'react-snowfall';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const GlobalAmbiance = ({ siteAmbiance }) => {
  const location = useLocation();
  const [particlesInit, setParticlesInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  if (location.pathname.startsWith('/profil')) return null;

  if (siteAmbiance === 'kar') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, pointerEvents: 'none' }}>
        <Snowfall snowflakeCount={150} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      </div>
    );
  }
  if (siteAmbiance === 'ilkbahar') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, pointerEvents: 'none' }}>
        <Snowfall
          snowflakeCount={80}
          color="#ffb7c5"
          radius={[5, 12]}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        />
      </div>
    );
  }
  if (siteAmbiance === 'yaz' && particlesInit) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, pointerEvents: 'none' }}>
        <Particles
          id="tsparticles-fireflies"
          options={{
            fullScreen: { enable: false, zIndex: 9998 },
            particles: {
              number: { value: 30, density: { enable: true, area: 800 } },
              color: { value: ["#fadb5f", "#f7b733", "#fc4a1a"] },
              shape: { type: "circle" },
              opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1, sync: false } },
              size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, sync: false } },
              move: { enable: true, speed: 0.5, direction: "top", random: true, straight: false, outModes: { default: "out" } }
            },
            interactivity: { events: { onHover: { enable: true, mode: "bubble" } }, modes: { bubble: { distance: 250, size: 4, duration: 2, opacity: 1 } } }
          }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <Particles
          id="tsparticles-leaves"
          options={{
            fullScreen: { enable: false, zIndex: 9998 },
            particles: {
              number: { value: 15, density: { enable: true, area: 800 } },
              color: { value: ["#2e7d32", "#4caf50", "#81c784"] },
              shape: { type: "polygon", polygon: { sides: 5 } },
              opacity: { value: 0.6 },
              size: { value: { min: 5, max: 10 } },
              move: { enable: true, speed: 1.5, direction: "bottom", random: false, straight: false, outModes: { default: "out" }, wobble: { enable: true, distance: 10, speed: 10 } },
              rotate: { value: { min: 0, max: 360 }, direction: "random", animation: { enable: true, speed: 5, sync: false } }
            }
          }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </div>
    );
  }
  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteAmbiance, setSiteAmbiance] = useState('yok');

  useEffect(() => {
    // Fetch settings
    axios.get(`${API}/settings`).then(res => {
      setSiteAmbiance(res.data.site_ambiyans || 'yok');
    }).catch(err => console.error("Ayarlar çekilemedi", err));

    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setUser(response.data);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center">
        <div className="text-[#FDD500] text-2xl font-bold">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, API, BACKEND_URL }}>
      <BrowserRouter>
        <GlobalAmbiance siteAmbiance={siteAmbiance} />
        <Toaster position="bottom-right" />
        <div className="App relative">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/kayit" element={<KayitPage />} />
            <Route path="/giris" element={<GirisPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:kategori" element={<ForumKategoriPage />} />
            <Route path="/forum/konu/:id" element={<ForumKonuPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/market/:kategori" element={<MarketPage />} />
            <Route path="/profil" element={user ? <ProfilPage /> : <Navigate to="/giris" />} />
            <Route path="/profil/:kullanici_adi" element={<ProfilPage />} />
            <Route path="/cuzdan" element={user ? <CuzdanPage /> : <Navigate to="/giris" />} />
            <Route path="/siralama" element={<SiralamaPage />} />
            <Route path="/hakkimizda" element={<HakkimizdaPage />} />
            <Route path="/haber/:id" element={<HaberDetayPage />} />
            <Route path="/wiki/:slug" element={<WikiPage />} />
            <Route path="/admin" element={user?.rol === 'admin' ? <AdminPage /> : <Navigate to="/" />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
