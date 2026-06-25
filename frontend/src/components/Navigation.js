import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Menu, X as XIcon, User, LogOut, Shield, Wallet, Settings, Copy, Check, Home, ShoppingCart, MessageSquare, Trophy, Info } from 'lucide-react';

const Navigation = () => {
  const { user, logout, API } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('bio');
  const [bio, setBio] = useState('');
  const [discordHandle, setDiscordHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
  };

  const handleCopyIP = () => {
    navigator.clipboard.writeText('play.rexagon.com.tr');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { to: '/', label: 'Ana Sayfa', icon: <Home size={20} /> },
    { to: '/market', label: 'Market', icon: <ShoppingCart size={20} /> },
    { to: '/forum', label: 'Forum', icon: <MessageSquare size={20} /> },
    { to: '/siralama', label: 'Sıralama', icon: <Trophy size={20} /> },
    { to: '/hakkimizda', label: 'Hakkımızda', icon: <Info size={20} /> }
  ];

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#222222]/20 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <img 
              src="/images/rexanewlogo.png" 
              alt="Rexagon" 
              className="h-20 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {navLinks.map(link => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
              return (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors px-3 button-nav uppercase tracking-wider text-sm whitespace-nowrap ${isActive ? 'text-[#FDD500] [text-shadow:0_0_5px_#FDD500]' : 'text-zinc-400 hover:text-[#FDD500]'}`}
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            )})}
            <Link
              to="/cuzdan"
              className="ml-4 button-card"
            >
              Kredi Yükle
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 px-4 py-2 bg-[#1E1E1E] border border-zinc-800 rounded-xl hover:border-[#FDD500]/50 transition-all shadow-lg"
                  data-testid="profile-menu-button"
                >
                  <img
                    src={`https://mc-heads.net/avatar/${user.kullanici_adi}`}
                    alt={user.kullanici_adi}
                    className="w-8 h-8 rounded"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-white">{user.kullanici_adi}</span>
                    <span className="text-xs text-[#FDD500] font-bold">{user.kredi.toFixed(0)} ₺</span>
                  </div>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-[#1E1E1E] border border-zinc-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                    data-testid="profile-dropdown"
                  >
                    <Link
                      to="/profil"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={18} />
                      <span>Profil</span>
                    </Link>
                    <button
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-white"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setBio(user?.biyografi || '');
                        setDiscordHandle(user?.discord || '');
                        setInstagramHandle(user?.instagram || '');
                        setShowSettings(true);
                        setSettingsTab('bio');
                      }}
                      data-testid="profile-settings-button"
                    >
                      <Settings size={18} />
                      <span>Profil Ayarları</span>
                    </button>
                    <Link
                      to="/cuzdan"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-white"
                      onClick={() => setShowProfileMenu(false)}
                      data-testid="wallet-link"
                    >
                      <Wallet size={18} />
                      <div className="flex flex-col">
                        <span>Cüzdan</span>
                        <span className="text-xs text-[#FDD500]">{user.kredi.toFixed(0)} ₺</span>
                      </div>
                    </Link>
                    {user.rol === 'admin' && (
                      <>
                        <div className="border-t border-zinc-800"></div>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-[#FDD500]"
                          onClick={() => setShowProfileMenu(false)}
                          data-testid="admin-link"
                        >
                          <Shield size={18} />
                          <span>Yönetim</span>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-zinc-800"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-red-400"
                      data-testid="logout-button"
                    >
                      <LogOut size={18} />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/giris"
                  className="text-zinc-400 px-5 hover:text-white font-medium transition-colors uppercase tracking-wider text-sm"
                  data-testid="login-link"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-2 rounded-lg hover:bg-[#E6C200] transition-all btn-3d shadow-lg"
                  data-testid="register-link"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>

    {/* Modern Mobile Bottom Navbar */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/90 backdrop-blur-xl border-t border-white/10 z-50 px-2 pb-safe pt-2">
      <div className="flex justify-around items-center">
        {navLinks.map(link => {
          const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-[#FDD500]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                {link.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}
        {user ? (
          <Link
            to="/profil"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${location.pathname.startsWith('/profil') ? 'text-[#FDD500]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <div className={`mb-1 transition-transform duration-300 ${location.pathname.startsWith('/profil') ? '-translate-y-1' : ''}`}>
              <User size={20} />
            </div>
            <span className="text-[10px] font-semibold tracking-wider">
              Profil
            </span>
          </Link>
        ) : (
          <Link
            to="/giris"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${location.pathname === '/giris' ? 'text-[#FDD500]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <div className={`mb-1 transition-transform duration-300 ${location.pathname === '/giris' ? '-translate-y-1' : ''}`}>
              <User size={20} />
            </div>
            <span className="text-[10px] font-semibold tracking-wider">
              Giriş
            </span>
          </Link>
        )}
      </div>
    </div>

    {/* Profile Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="settings-modal">
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-lg w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Profil Ayarları</h3>
            <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white" data-testid="close-settings-modal"><XIcon size={24} /></button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-3 mb-6">
            <button onClick={() => setSettingsTab('bio')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${settingsTab === 'bio' ? 'bg-[#FDD500] text-black' : 'bg-[#2A2A2A] text-zinc-400 hover:text-white'}`} data-testid="settings-tab-bio">Profil Bilgileri</button>
            <button onClick={() => setSettingsTab('password')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${settingsTab === 'password' ? 'bg-[#FDD500] text-black' : 'bg-[#2A2A2A] text-zinc-400 hover:text-white'}`} data-testid="settings-tab-password">Şifre Değiştir</button>
          </div>

          {settingsTab === 'bio' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const token = localStorage.getItem('token');
                await axios.put(`${API}/users/biyografi`, { biyografi: bio, discord: discordHandle, instagram: instagramHandle }, { headers: { Authorization: `Bearer ${token}` } });
                alert('Profil bilgileri güncellendi!');
                setShowSettings(false);
                window.location.reload();
              } catch (err) { alert('Güncelleme başarısız'); } finally { setSaving(false); }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Biyografi</label>
                <textarea rows={3} className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-2 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kendiniz hakkında bir şeyler yazın..." data-testid="bio-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Discord Kullanıcı Adı</label>
                <input type="text" className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={discordHandle} onChange={(e) => setDiscordHandle(e.target.value)} placeholder="Örn: kullanici#1234 veya kullanici" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram Kullanıcı Adı</label>
                <input type="text" className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="Örn: kullaniciadi" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 mt-4 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50" data-testid="save-bio-button">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </form>
          )}

          {settingsTab === 'password' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newPassword.length < 6) { alert('Yeni şifre en az 6 karakter olmalıdır'); return; }
              setSaving(true);
              try {
                const token = localStorage.getItem('token');
                await axios.put(`${API}/users/sifre`, { eski_sifre: oldPassword, yeni_sifre: newPassword }, { headers: { Authorization: `Bearer ${token}` } });
                alert('Şifre başarıyla değiştirildi!');
                setOldPassword(''); setNewPassword(''); setShowSettings(false);
              } catch (err) { alert(err.response?.data?.detail || 'Şifre değiştirilemedi'); } finally { setSaving(false); }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Mevcut Şifre</label>
                <input type="password" required className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} data-testid="old-password-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Yeni Şifre</label>
                <input type="password" required minLength={6} className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} data-testid="new-password-input" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50" data-testid="change-password-button">{saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}</button>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Navigation;
