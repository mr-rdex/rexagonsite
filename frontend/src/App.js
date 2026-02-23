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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="App">
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
            <Route path="/admin" element={user?.rol === 'admin' ? <AdminPage /> : <Navigate to="/" />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
