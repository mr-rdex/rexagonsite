import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Trophy, Clock, ShoppingBag, Coins, Copy, Check } from 'lucide-react';

const HomePage = () => {
  const { API } = useAuth();
  const [topKredi, setTopKredi] = useState([]);
  const [sonKayitlar, setSonKayitlar] = useState([]);
  const [sonAlisverisler, setSonAlisverisler] = useState([]);
  const [sonKrediYuklemeler, setSonKrediYuklemeler] = useState([]);
  const [haberler, setHaberler] = useState([]);
  const [stats, setStats] = useState({ kayitli_oyuncu: 0, aktif_oyuncu: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyIP = () => {
    navigator.clipboard.writeText('play.rexagon.com.tr');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [krediRes, kayitRes, alisverisRes, yukleRes, haberRes, statsRes] = await Promise.all([
          axios.get(`${API}/leaderboard/kredi`),
          axios.get(`${API}/leaderboard/son-kayitlar`),
          axios.get(`${API}/leaderboard/son-alisverisler`),
          axios.get(`${API}/leaderboard/son-kredi-yuklemeler`),
          axios.get(`${API}/haberler?limit=3`),
          axios.get(`${API}/stats`)
        ]);

        setTopKredi(krediRes.data.slice(0, 5));
        setSonKayitlar(kayitRes.data.slice(0, 5));
        setSonAlisverisler(alisverisRes.data.slice(0, 5));
        setSonKrediYuklemeler(yukleRes.data.slice(0, 5));
        setHaberler(haberRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Veri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center text-zinc-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="home-page">
      {/* Hero Section */}
      <div className="relative mb-16 overflow-hidden rounded-xl" style={{
        backgroundImage: 'url(/images/hero-bg.jpg)',
=======
    <div className="min-h-screen " data-testid="home-page">
      {/* Hero Section */}
      <div className="relative mb-16 overflow-hidden rounded-xl" style={{
        backgroundImage: 'url(/images/manzara.jpg)',
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px'
      }}>
<<<<<<< HEAD
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#222222]"></div>
=======
        <div className="absolute inset-0 bg-gradient-to-b via-black/30 to-[#222222]"></div>
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
        <div className="relative container mx-auto max-w-7xl px-6 py-20 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-6" data-testid="hero-title">
            Rexagon'a <span className="text-[#FDD500]">Hoş Geldin</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto">
            Türkiye'nin en büyük Minecraft sunucu topluluğuna katıl ve maceraya atıl!
          </p>

          {/* Server Stats */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6">
<<<<<<< HEAD
              <div className="bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300">
=======
              <div className="bg-[#1E1E1E]/50 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300">
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                <div className="text-center">
                  <p className="text-4xl font-black text-[#FDD500] mb-2">{stats.aktif_oyuncu}</p>
                  <p className="text-sm text-zinc-400 uppercase tracking-wider">Aktif Oyuncu</p>
                </div>
              </div>
<<<<<<< HEAD
              <div className="bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300">
=======
              <div className="bg-[#1E1E1E]/50 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300">
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                <div className="text-center">
                  <p className="text-4xl font-black text-[#FDD500] mb-2">{stats.kayitli_oyuncu}</p>
                  <p className="text-sm text-zinc-400 uppercase tracking-wider">Kayıtlı Oyuncu</p>
                </div>
              </div>
            </div>
            {/* IP Address */}
            <div className="w-full max-w-md">
              <button
                onClick={handleCopyIP}
<<<<<<< HEAD
                className="w-full bg-[#1E1E1E]/90 backdrop-blur-md border-2 border-[#FDD500] rounded-xl px-8 py-4 hover:bg-[#FDD500]/10 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300 flex items-center justify-center space-x-3"
=======
                className="w-full bg-[#1E1E1E]/50 backdrop-blur-md border-2 border-[#FDD500] rounded-xl px-8 py-4 hover:bg-[#FDD500]/10 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300 flex items-center justify-center space-x-3"
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                data-testid="copy-ip-button"
              >
                <span className="text-[#FDD500] font-bold text-xl">play.rexagon.com.tr</span>
                {copied ? <Check className="text-[#FDD500]" size={24} /> : <Copy className="text-[#FDD500]" size={24} />}
              </button>
              {copied && (
                <p className="text-center text-green-500 text-sm mt-2">IP adresi kopyalandı!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Haberler */}
        {haberler.length > 0 && (
          <div className="mb-16" data-testid="news-section">
<<<<<<< HEAD
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase text-white mb-8">Son Haberler</h2>
=======
            <h2 className="text-4xl md:text-5xl pl-4 font-bold tracking-tight uppercase text-white mb-8">Son Haberler</h2>
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {haberler.map((haber) => (
                <div
                  key={haber.id}
                  className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all group"
                  data-testid="news-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-zinc-500">{formatDate(haber.tarih)}</span>
                    <span className="text-xs text-[#FDD500]">{haber.yazar_adi}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FDD500] transition-colors">
                    {haber.baslik}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-3">{haber.icerik}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* En Çok Kredi */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="top-credits">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">En Çok Kredi</h3>
            </div>
            <div className="space-y-3">
              {topKredi.map((user, index) => (
                <Link
                  key={user.id}
                  to={`/profil/${user.kullanici_adi}`}
                  className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded hover:bg-[#333333] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[#FDD500] font-bold w-6">#{index + 1}</span>
                    <img
<<<<<<< HEAD
                      src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/32`}
=======
                      src={`https://mc-heads.net/avatar/${user.kullanici_adi}/32`}
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                      alt={user.kullanici_adi}
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-white font-medium">{user.kullanici_adi}</span>
                  </div>
                  <span className="text-[#FDD500] font-bold">{user.kredi.toFixed(0)} Kredi</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Son Kayıtlar */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="latest-users">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">Son Kayıtlar</h3>
            </div>
            <div className="space-y-3">
              {sonKayitlar.map((user) => (
                <Link
                  key={user.id}
                  to={`/profil/${user.kullanici_adi}`}
                  className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded hover:bg-[#333333] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
<<<<<<< HEAD
                      src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/32`}
=======
                      src={`https://mc-heads.net/avatar/${user.kullanici_adi}/32`}
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                      alt={user.kullanici_adi}
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-white font-medium">{user.kullanici_adi}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{formatDate(user.kayit_tarihi)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Son Alışverişler */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="latest-purchases">
            <div className="flex items-center space-x-3 mb-6">
              <ShoppingBag className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">Son Alışverişler</h3>
            </div>
            <div className="space-y-3">
              {sonAlisverisler.length > 0 ? (
                sonAlisverisler.map((purchase, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{purchase.kullanici_adi}</span>
                      <span className="text-xs text-zinc-500">{purchase.urun_adi}</span>
                    </div>
                    <span className="text-[#FDD500] font-bold">{purchase.toplam_fiyat} Kredi</span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">Henüz alışveriş yok</p>
              )}
            </div>
          </div>

          {/* Son Kredi Yüklemeler */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="latest-credit-loads">
            <div className="flex items-center space-x-3 mb-6">
              <Coins className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">Son Kredi Yüklemeler</h3>
            </div>
            <div className="space-y-3">
              {sonKrediYuklemeler.length > 0 ? (
                sonKrediYuklemeler.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
                    <span className="text-white font-medium">{transaction.kullanici_adi}</span>
                    <span className="text-[#FDD500] font-bold">+{transaction.tutar} Kredi</span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">Henüz kredi yükleme yok</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
