import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Calendar, Coins, Shield, Lock, Check, User as UserIcon } from 'lucide-react';
import Snowfall from 'react-snowfall';
import { FaDiscord, FaInstagram } from 'react-icons/fa';
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ProfilPage = () => {
  const { kullanici_adi } = useParams();
  const { API, user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  const [fireflies, setFireflies] = useState([]);

  const particlesInit = useCallback(async (engine) => {
      await loadSlim(engine);
    }, []);

  const isOwnProfile = !kullanici_adi || (currentUser && currentUser.kullanici_adi === kullanici_adi);

  useEffect(() => {
    const particleCount = 35; 
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      size: `${Math.random() * 3 + 2}px`,
      duration: `${Math.random() * 15 + 10}s`,
      delay: `${Math.random() * 5}s`,
      blinkDuration: `${Math.random() * 2 + 2}s`
    }));
    
    setFireflies(particles);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanici_adi, currentUser, API])

  const fetchProfile = async () => {
    try {
      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
      } else if (kullanici_adi) {
        const response = await axios.get(`${API}/users/${kullanici_adi}`);
        setProfileUser(response.data);
      }
    } catch (error) {
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await axios.get(`${API}/themes`);
      setThemes(response.data);
    } catch (error) {}
  };

  const handlePurchaseTheme = async (themeId) => {
    setPurchasing(themeId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/themes/${themeId}/satin-al`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.detail || 'Tema açılamadı');
    } finally { setPurchasing(null); }
  };

  const handleSetActiveTheme = async (themeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/themes/aktif/${themeId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (error) { alert(error.response?.data?.detail || 'Tema aktifleştirilemedi'); }
  };

  const handleRemoveTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/themes/kaldir`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (error) { alert('Tema kaldırılamadı'); }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-16 px-4"><div className="container mx-auto max-w-7xl"><div className="text-center text-zinc-400">Yükleniyor...</div></div></div>;
  }

  if (!profileUser) {
    return <div className="min-h-screen pt-24 pb-16 px-4"><div className="container mx-auto max-w-7xl"><div className="text-center text-zinc-400">Kullanıcı bulunamadı</div></div></div>;
  }

  const userThemes = profileUser.acik_temalar || [];
  const displayName = profileUser.kullanici_adi;

  return (
    <div className="min-h-screen" data-testid="profile-page">
      <div className='profil-mc'></div>
      {/* Mevcut kar efekti */}
      {profileUser.aktif_tema_ambiyans === 'kar' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <Snowfall snowflakeCount={150} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        </div>
      )}

      {/* Mevcut ilkbahar efekti */}
      {profileUser.aktif_tema_ambiyans && profileUser.aktif_tema_ambiyans.toLowerCase().includes('ilkbahar') && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <Particles
            id="profil-tsparticles-ilkbahar"
            init={particlesInit} 
            options={{
              fullScreen: { enable: false, zIndex: 9998 },
              particles: {
                number: { value: 30, density: { enable: true, area: 800 } },
                shape: {
                  type: "image",
                  options: {
                    image: [
                      { src: "/images/sakuraleaf.png", width: 15, height: 15 },
                      { src: "/images/sakuraleaf1.png", width: 15, height: 15 },
                      { src: "/images/sakuraleaf2.png", width: 15, height: 15 },
                    ]
                  }
                },
                opacity: { value: 0.8 },
                size: { value: { min: 5, max: 15 } },
                move: {
                  enable: true,
                  speed: 2,
                  direction: "bottom",
                  outModes: { default: "out" },
                  wobble: { enable: true, distance: 20, speed: 1.5 } // Daha doğal süzülme için bunu da ekledim
                },
                rotate: {
                  value: { min: 0, max: 360 },
                  direction: "random",
                  animation: { enable: true, speed: { min: 2, max: 5 }, sync: false }
                }
              }
            }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* YENİ: Yaz (Ateş Böceği) Efekti */}
      {profileUser.aktif_tema_ambiyans === 'yaz' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, pointerEvents: 'none' }}>
                <Particles
                          id="tsparticles-fireflies"
                          init={particlesInit}
                          options={{
                            fullScreen: { enable: false, zIndex: 9998 },
                            particles: {
                              number: { value: 30, density: { enable: true, area: 800 } },
                              color: { value: ["#fadb5f", "#f7b733", "#fc4a1a"] },
                              shape: { type: "circle" },
                              opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1, sync: false } },
                              size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, sync: false } },
                              move: { enable: true, speed: 1, direction: "top", random: true, straight: false, outModes: { default: "out" } }
                            },
                            interactivity: { events: { onHover: { enable: true, mode: "bubble" } }, modes: { bubble: { distance: 250, size: 4, duration: 2, opacity: 1 } } }
                          }}
                          style={{ position: 'absolute', width: '100%', height: '100%' }}
                        />
                <Particles
                                          id="tsparticles-leaves"
                                          init={particlesInit}
                                          options={{
                                            fullScreen: { enable: false, zIndex: 9998 },
                                            particles: {
                                              number: { value: 15, density: { enable: true, area: 800 } },
                                              
                                              // Gerçekçilik için "image" kullanıyoruz.
                                              // Projendeki /public/images/ klasörüne leaf1.png, leaf2.png gibi arka planı saydam görseller eklemelisin.
                                              // Eğer görselle uğraşmak istemezsen şunu kullan:
                                              // type: "char", options: { char: { value: ["🍃", "🌿", "🍂"] } }
                                              shape: {
                                                type: "image",
                                                options: {
                                                  image: [
                                                    { src: "https://static.vecteezy.com/system/resources/thumbnails/071/881/121/small/cute-pixel-art-green-tea-matcha-leaf-icon-illustration-png.png", width: 32, height: 32 }
                                                  ]
                                                }
                                              },
                                              
                                              opacity: { value: { min: 0.5, max: 0.8 }, animation: { enable: true, speed: 0.5, sync: false } },
                                              size: { value: { min: 10, max: 15 } }, // Görsellerin ekrandaki boyutu
                                              
                                              move: {
                                                enable: true,
                                                speed: 1.5, // Hızı sabitledik (min-max kaldırdık)
                                                direction: "bottom",
                                                random: false,
                                                straight: false,
                                                outModes: { default: "out" },
                                                gravity: { enable: false, acceleration: 0 }, // Hızlanmaya sebep olan ivmeyi kapattık
                                                wobble: { enable: true, distance: 20, speed: 1.5 }, // Dalgalanmayı daha tutarlı hale getirdik
                                                drift: 0 // Sağa sola kayarak hızlanmayı önlemek için sıfırladık
                                              },
                                              
                                              rotate: {
                                                value: { min: 0, max: 360 },
                                                direction: "random",
                                                animation: { enable: true, speed: { min: 2, max: 5 }, sync: false } // Kendi etrafında doğal dönüş
                                              }
                                            }
                                          }}
                                          style={{ position: 'absolute', width: '100%', height: '100%' }}
                                        />
              </div>
      )}
      {/* Full-width Hero Banner - Taller */}
      <div
        className="relative"
        style={{
          backgroundImage: profileUser.aktif_tema_gorsel
            ? `url(${profileUser.aktif_tema_gorsel})`
            : 'url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#222222]"></div>
        <div className="relative container mx-auto max-w-7xl px-4 flex items-end pb-2" style={{ minHeight: '600px' }}>
          <div className="flex items-center space-x-5">
            <img
              src={profileUser.yetki_gorseli || `https://mc-heads.net/avatar/${displayName}`}
              alt={displayName}
              className="w-20 h-20 rounded-lg border-2 border-[#FDD500] shadow-lg"
              data-testid="profile-avatar"
            />
            <div>
              <h1 className="minecraft-font text-3xl font-black uppercase text-white leading-tight" data-testid="profile-username">
                {displayName}
              </h1>
              <span className="inline-block mt-1 bg-[#FDD500] text-black text-xs font-bold uppercase px-3 py-1 rounded" data-testid="profile-rank">
                {profileUser.yetki || 'Oyuncu'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content: Three Column Layout */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Biyografi */}
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="bio-section">
              <h3 className="text-zinc-500 text-sm uppercase tracking-wider mb-3">Biyografi</h3>
              <p className="text-zinc-300 text-sm mb-4">{profileUser.biyografi || 'Henüz bir biyografi eklenmemiş.'}</p>

              {(profileUser.discord || profileUser.instagram) && (
                <>
                  <h3 className="text-zinc-500 text-sm uppercase tracking-wider mb-3 mt-4">Sosyal Medya</h3>
                  <div className="space-y-3">
                    {profileUser.discord && (
                      <div className="flex items-center space-x-3 text-sm">
                        <FaDiscord className="text-blue-500 text-xl" />
                        <span className="text-zinc-300 font-medium">{profileUser.discord}</span>
                      </div>
                    )}
                    {profileUser.instagram && (
                      <div className="flex items-center space-x-3 text-sm">
                        <FaInstagram className="text-pink-500 text-xl" />
                        <a href={`https://instagram.com/${profileUser.instagram}`} target="_blank" rel="noreferrer" className="text-zinc-300 font-medium hover:text-white transition-colors">
                          {profileUser.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-5" data-testid="stat-credit">
                <div className="flex items-center space-x-3 mb-2">
                  <Coins className="text-[#FDD500]" size={20} />
                  <span className="text-zinc-500 text-sm uppercase tracking-wider">Kredi</span>
                </div>
                <p className="text-2xl font-black text-white">{(profileUser.kredi || 0).toFixed(0)}</p>
              </div>
              <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-5" data-testid="stat-topics">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-zinc-500 text-sm uppercase tracking-wider">Açılan Konu</span>
                </div>
                <p className="text-2xl font-black text-white">{profileUser.acilan_konu_sayisi || 0}</p>
              </div>
              <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-5" data-testid="stat-messages">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-zinc-500 text-sm uppercase tracking-wider">Gönderilen Mesaj</span>
                </div>
                <p className="text-2xl font-black text-white">{profileUser.gonderilen_mesaj_sayisi || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-5" data-testid="stat-spending">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-sm uppercase tracking-wider">Toplam Harcama</span>
                  <Coins className="text-[#FDD500]" size={20} />
                </div>
                <p className="text-3xl font-black text-[#FDD500]">{profileUser.toplam_harcama ? profileUser.toplam_harcama.toFixed(2) : "0.00"} ₺</p>
              </div>
            </div>

            {/* Hesap Oluşturma Tarihi */}
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="account-date-section">
              <h3 className="text-zinc-500 text-sm uppercase tracking-wider mb-3">Hesap Oluşturma Tarihi</h3>
              <p className="text-zinc-300 text-sm">{formatDate(profileUser.kayit_tarihi)}</p>
            </div>
          </div>

          

          {/* Right Column - Full Body Skin */}
          <div className="lg:col-span-3">
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 flex flex-col items-center" data-testid="skin-section">
              <h3 className="text-zinc-500 text-sm uppercase tracking-wider mb-4">Oyuncu Görünümü</h3>
              <img
                src={`https://mc-heads.net/body/${displayName}`}
                alt={`${displayName} skin`}
                className="max-w-[140px] w-full h-auto"
                data-testid="profile-skin"
              />
              <p className="text-zinc-400 text-xs mt-4 text-center">{displayName}</p>
            </div>
          </div>


          {/* Middle Column - Themes */}
          <div className="lg:col-span-4">
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="themes-section">
              <h3 className="text-white font-bold uppercase tracking-wider text-center mb-6">Temalar</h3>
              {profileUser.aktif_tema_id && isOwnProfile && (
                <button onClick={handleRemoveTheme} className="w-full mb-4 text-sm text-zinc-400 hover:text-red-400 transition-colors text-center underline" data-testid="remove-theme-button">
                  Mevcut temayı kaldır
                </button>
              )}
              {themes.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center">Henüz tema eklenmemiş.</p>
              ) : (
                <div className="space-y-5">
                  {themes.map((theme) => {
                    const isUnlocked = userThemes.includes(theme.id);
                    const isActive = profileUser.aktif_tema_id === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className={`relative mb-4 rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[#FDD500]' : 'border-zinc-700'}`}
                        data-testid={`theme-card-${theme.id}`}
                      >
                        <div className="aspect-video bg-cover bg-center bg-[#2A2A2A] rounded-t-xl" style={{ backgroundImage: `url(${theme.gorsel_url})` }} />
                        <div className="absolute top-2 right-2">
                          {isActive ? (
                            <div className="w-7 h-7 bg-[#FDD500] rounded-full flex items-center justify-center"><Check size={14} className="text-black" /></div>
                          ) : isUnlocked ? (
                            <div className="w-7 h-7 bg-[#FDD500]/20 border border-[#FDD500] rounded-full flex items-center justify-center"><Check size={14} className="text-[#FDD500]" /></div>
                          ) : (
                            <div className="w-7 h-7 bg-zinc-800/80 border border-zinc-600 rounded-full flex items-center justify-center"><Lock size={12} className="text-zinc-400" /></div>
                          )}
                        </div>
                        <div className="p-3 bg-[#2A2A2A] rounded-b-xl">
                          <p className="text-white font-medium text-sm">{theme.isim}</p>
                          {isOwnProfile && (
                            <div className="mt-2">
                              {isActive ? (
                                <span className="text-xs text-[#FDD500] font-bold">Aktif</span>
                              ) : isUnlocked ? (
                                <button onClick={() => handleSetActiveTheme(theme.id)} className="text-xs bg-[#FDD500] text-black font-bold px-3 py-1 rounded-lg hover:bg-[#E6C200] transition-colors" data-testid={`activate-theme-${theme.id}`}>Kullan</button>
                              ) : (
                                <button onClick={() => handlePurchaseTheme(theme.id)} disabled={purchasing === theme.id} className="text-xs bg-zinc-700 text-white font-bold px-3 py-1 rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50" data-testid={`buy-theme-${theme.id}`}>{theme.fiyat > 0 ? `${theme.fiyat} Kredi` : 'Ücretsiz Aç'}</button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;
