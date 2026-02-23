import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Menu, X as XIcon, User, LogOut, Shield, Wallet, Settings, Copy, Check } from 'lucide-react';

const Navigation = () => {
  const { user, logout, API } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('bio');
  const [bio, setBio] = useState('');
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
    { to: '/', label: 'Ana Sayfa' },
    { to: '/market', label: 'Market' },
    { to: '/forum', label: 'Forum' },
    { to: '/siralama', label: 'Sıralama' },
    { to: '/hakkimizda', label: 'Hakkımızda' }
  ];

  return (
    <>
<<<<<<< HEAD
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#222222]/95 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <img 
              src="/images/logo.png" 
              alt="Rexagon" 
              className="h-12 md:h-14 w-auto object-contain"
=======
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#222222]/70 border-b border-white/5">
      <div className="container mx-auto md:px-6 max-w-8xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex pl-4 items-center" data-testid="logo-link">
            <img 
              src="/images/logo.png" 
              alt="Rexagon" 
              className="h-20 md:h-40 w-auto object-contain"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-14">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
<<<<<<< HEAD
                className="text-zinc-400 hover:text-[#FDD500] font-medium transition-colors uppercase tracking-wider text-sm whitespace-nowrap"
=======
                className="text-zinc-400 hover:text-[#FDD500] font-medium transition-colors uppercase px-3 tracking-wider text-sm whitespace-nowrap"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 px-4 py-2 bg-[#1E1E1E] border border-zinc-800 rounded-xl hover:border-[#FDD500]/50 transition-all"
                  data-testid="profile-menu-button"
                >
                  <img
<<<<<<< HEAD
                    src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/32`}
=======
                    src={`https://mc-heads.net/avatar/${user.kullanici_adi}/32`}
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
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
                    className="absolute right-0 top-full mt-2 w-56 bg-[#1E1E1E] border border-zinc-800 rounded-xl shadow-lg overflow-hidden transition-all duration-200"
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
                      onClick={() => { setShowProfileMenu(false); setBio(user?.biyografi || ''); setShowSettings(true); setSettingsTab('bio'); }}
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
<<<<<<< HEAD
                  className="text-zinc-400 hover:text-white font-medium transition-colors uppercase tracking-wider text-sm"
=======
                  className="text-zinc-400 hover:text-white font-medium transition-colors px-6 uppercase tracking-wider text-sm"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                  data-testid="login-link"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-2 rounded-lg hover:bg-[#E6C200] transition-all btn-3d"
                  data-testid="register-link"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
<<<<<<< HEAD
            className="md:hidden p-2 text-white"
=======
            className="md:hidden pr-4 p-2 text-white"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
<<<<<<< HEAD
          <div className="md:hidden py-4 border-t border-white/5">
=======
          <div className="md:hidden py-4 px-4 border-t bg-[#222222]/80 border-white/5">
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 text-zinc-400 hover:text-[#FDD500] font-medium transition-colors uppercase tracking-wider text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 mt-4 pt-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
<<<<<<< HEAD
                      src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/32`}
                      alt={user.kullanici_adi}
                      className="w-8 h-8 rounded"
=======
                      src={`https://mc-heads.net/avatar/${user.kullanici_adi}`}
                      alt={user.kullanici_adi}
                      className="w-12 h-12 rounded"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{user.kullanici_adi}</span>
                      <span className="text-xs text-[#FDD500] font-bold">{user.kredi.toFixed(0)} ₺</span>
                    </div>
                  </div>
                  <Link
                    to="/profil"
                    className="block py-2 text-zinc-400 hover:text-[#FDD500]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link
                    to="/cuzdan"
                    className="block py-2 text-zinc-400 hover:text-[#FDD500]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cüzdan
                  </Link>
                  {user.rol === 'admin' && (
                    <Link
                      to="/admin"
                      className="block py-2 text-zinc-400 hover:text-[#FDD500]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-zinc-400 hover:text-red-500"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/giris"
                    className="block py-2 text-zinc-400 hover:text-[#FDD500]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/kayit"
                    className="block py-2 text-[#FDD500] hover:text-[#E6C200] font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

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
            <button onClick={() => setSettingsTab('bio')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${settingsTab === 'bio' ? 'bg-[#FDD500] text-black' : 'bg-[#2A2A2A] text-zinc-400 hover:text-white'}`} data-testid="settings-tab-bio">Biyografi</button>
            <button onClick={() => setSettingsTab('password')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${settingsTab === 'password' ? 'bg-[#FDD500] text-black' : 'bg-[#2A2A2A] text-zinc-400 hover:text-white'}`} data-testid="settings-tab-password">Şifre Değiştir</button>
          </div>

          {settingsTab === 'bio' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const token = localStorage.getItem('token');
                await axios.put(`${API}/users/biyografi`, { biyografi: bio }, { headers: { Authorization: `Bearer ${token}` } });
                alert('Biyografi güncellendi!');
                setShowSettings(false);
                window.location.reload();
              } catch (err) { alert('Güncelleme başarısız'); } finally { setSaving(false); }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Biyografi</label>
                <textarea rows={4} className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kendiniz hakkında bir şeyler yazın..." data-testid="bio-input" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50" data-testid="save-bio-button">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
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
