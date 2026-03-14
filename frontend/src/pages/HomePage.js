import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Trophy, Clock, ShoppingBag, Coins, Copy, Check, Eye, Mountain, CircleDollarSign } from 'lucide-react';

const HomePage = () => {
  const { API } = useAuth();
  const [topKredi, setTopKredi] = useState([]);
  const [topIslands, setTopIslands] = useState([]);
  const [topDinar, setTopDinar] = useState([]);
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
      const [krediRes, islandRes, dinarRes, kayitRes, alisverisRes, yukleRes, haberRes, statsRes, mcRes] = await Promise.all([
        axios.get(`${API}/leaderboard/kredi`).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard/ada-seviyesi`).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard/dinar`).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard/son-kayitlar`).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard/son-alisverisler`).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard/son-kredi-yuklemeler`).catch(() => ({ data: [] })),
        axios.get(`${API}/haberler?limit=3`).catch(() => ({ data: [] })),
        axios.get(`${API}/stats`).catch(() => ({ data: { kayitli_oyuncu: 0, aktif_oyuncu: 0 } })),
        // Minecraft API isteği (Ücretsiz ve güvenilir bir servistir)
        axios.get("https://api.mcsrvstat.us/3/play.rexagon.com.tr").catch(() => ({ data: { online: false } }))
      ]);

        setTopKredi(Array.isArray(krediRes.data) ? krediRes.data.slice(0, 5) : []);
        setTopIslands(Array.isArray(islandRes.data) ? islandRes.data.slice(0, 5) : []);
        setTopDinar(Array.isArray(dinarRes.data) ? dinarRes.data.slice(0, 5) : []);
        setSonKayitlar(Array.isArray(kayitRes.data) ? kayitRes.data.slice(0, 5) : []);
        setSonAlisverisler(Array.isArray(alisverisRes.data) ? alisverisRes.data.slice(0, 5) : []);
        setSonKrediYuklemeler(Array.isArray(yukleRes.data) ? yukleRes.data.slice(0, 5) : []);
        setHaberler(Array.isArray(haberRes.data) ? haberRes.data : []);
        // Stats verisini düzenle
      const realTimePlayers = mcRes.data.online ? mcRes.data.players.online : 0;
      setStats({
        kayitli_oyuncu: statsRes.data.kayitli_oyuncu || 0,
        aktif_oyuncu: realTimePlayers // Burası artık Minecraft'tan geliyor
      });

    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, [API]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
    } catch {
      return '';
    }
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
    <div className="min-h-screen" data-testid="home-page">
      <div className='anasayfa-mc'></div>
      {/* Hero Section */}
      <div className="relative mb-16 overflow-hidden rounded-xl" style={{
        backgroundImage: 'url(/images/manzara.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '900px'
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#222222]"></div>
        <div className="relative container mx-auto max-w-7xl px-6 pt-52 text-center z-10">
          <img 
              src="/images/logo.png" 
              alt="Rexagon" 
              className="h-64 md:h-64 w-auto object-contain mx-auto block"
            />
          <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto">
            Türkiye'nin en büyük Minecraft sunucu topluluğuna katıl ve maceraya atıl!
          </p>

          {/* Server Stats */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-[#1E1E1E]/50 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300 w-72">
                <div className="text-center">
                  <p className="text-4xl font-black text-[#FDD500] mb-2">{stats.aktif_oyuncu}</p>
                  <p className="text-sm text-zinc-400 uppercase tracking-wider">Aktif Oyuncu</p>
                </div>
              </div>
              <div className="bg-[#1E1E1E]/50 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300 w-72">
                <div className="text-center">
                  <p className="text-4xl font-black text-[#FDD500] mb-2">{stats.kayitli_oyuncu}</p>
                  <p className="text-sm text-zinc-400 uppercase tracking-wider">Kayıtlı Oyuncu</p>
                </div>
              </div>
            </div>
            {/* IP Address */}
            <div className="w-full max-w-[39.5rem] px-4">
              <button
                onClick={handleCopyIP}
                className="w-full bg-[#1E1E1E]/50 backdrop-blur-md border-2 border-[#FDD500] rounded-xl px-8 py-4 hover:bg-[#FDD500]/10 hover:shadow-[0_0_30px_rgba(255,213,0,0.3)] transition-all duration-300 flex items-center justify-center space-x-3"
                data-testid="copy-ip-button"
              >
                <span className="text-[#FDD500] font-bold text-lg md:text-xl">play.rexagon.com.tr</span>
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
            <h2 className="text-4xl md:text-5xl pl-4 font-bold tracking-tight uppercase text-white mb-8">Son Haberler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {haberler.map((haber) => (
                <Link
                  key={haber.id}
                  to={`/haber/${haber.id}`}
                  className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all group flex flex-col cursor-pointer"
                  data-testid="news-card"
                >
                  {haber.gorsel_url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={haber.gorsel_url}
                        alt={haber.baslik}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-zinc-500">{formatDate(haber.tarih)}</span>
                      <span className="text-xs text-[#FDD500]">{haber.yazar_adi}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FDD500] transition-colors">
                      {haber.baslik}
                    </h3>
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-1">{haber.icerik}</p>
                    <div className="flex items-center justify-end text-zinc-500 text-xs mt-auto space-x-1">
                      <Eye size={14} />
                      <span>{haber.goruntulenme || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* En Çok Ada Seviyesi */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="top-islands">
            <div className="flex items-center space-x-3 mb-6">
              <Mountain className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">En Çok Ada Seviyesi</h3>
            </div>
            <div className="space-y-3">
              {topIslands.length > 0 ? topIslands.map((island, index) => {
                let rankClass = "bg-[#2A2A2A]";
                let rankTextClass = "text-[#FDD500]";
                if (index === 0) { rankClass = "bg-yellow-500/20 border border-yellow-500/50"; rankTextClass = "text-yellow-500"; }
                else if (index === 1) { rankClass = "bg-gray-400/20 border border-gray-400/50"; rankTextClass = "text-gray-400"; }
                else if (index === 2) { rankClass = "bg-orange-600/20 border border-orange-600/50"; rankTextClass = "text-orange-500"; }

                return (
                  <Link to={`/profil/${island.ada_lideri}`} key={index} className={`mt-2 flex items-center justify-between p-3 rounded transition-colors cursor-pointer hover:bg-[#333333] ${rankClass}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold w-6 ${rankTextClass}`}>#{island.sira}</span>
                      <img src={`https://mc-heads.net/avatar/${island.ada_lideri}`} alt={island.ada_lideri} className="w-8 h-8 rounded" />
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{island.ada_adi}</span>
                        <span className="text-xs text-zinc-500 truncate max-w-[120px]">{island.uyeler}</span>
                      </div>
                    </div>
                    <span className={`font-bold ${rankTextClass}`}>{island.ada_seviyesi} Seviye</span>
                  </Link>
                )
              }) : <p className="text-zinc-500 text-sm">Veri bulunamadı</p>}
            </div>
          </div>

          {/* En Çok Dinar */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="top-dinar">
            <div className="flex items-center space-x-3 mb-6">
              <CircleDollarSign className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">En Çok Dinar</h3>
            </div>
            <div className="space-y-3">
              {topDinar.length > 0 ? topDinar.map((user, index) => {
                let rankClass = "bg-[#2A2A2A]";
                let rankTextClass = "text-[#FDD500]";
                if (index === 0) { rankClass = "bg-yellow-500/20 border border-yellow-500/50"; rankTextClass = "text-yellow-500"; }
                else if (index === 1) { rankClass = "bg-gray-400/20 border border-gray-400/50"; rankTextClass = "text-gray-400"; }
                else if (index === 2) { rankClass = "bg-orange-600/20 border border-orange-600/50"; rankTextClass = "text-orange-500"; }

                return (
                  <Link to={`/profil/${user.oyuncu}`} key={index} className={`mt-2 flex items-center justify-between p-3 rounded transition-colors cursor-pointer hover:bg-[#333333] ${rankClass}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold w-6 ${rankTextClass}`}>#{user.sira}</span>
                      <img src={`https://mc-heads.net/avatar/${user.oyuncu}`} alt={user.oyuncu} className="w-8 h-8 rounded" />
                      <span className="text-white font-medium">{user.oyuncu}</span>
                    </div>
                    <span className={`font-bold ${rankTextClass}`}>{user.dinar} Dinar</span>
                  </Link>
                )
              }) : <p className="text-zinc-500 text-sm">Veri bulunamadı</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* En Çok Kredi */}
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="top-credits">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="text-[#FDD500]" size={28} />
              <h3 className="text-2xl font-bold uppercase text-white">En Çok Kredi Yükleyenler</h3>
            </div>
            <div className="space-y-3">
              {topKredi.map((user, index) => {
                let rankClass = "bg-[#2A2A2A] hover:bg-[#333333]";
                let rankTextClass = "text-[#FDD500]";
                if (index === 0) {
                  rankClass = "bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30";
                  rankTextClass = "text-yellow-500";
                } else if (index === 1) {
                  rankClass = "bg-gray-400/20 border border-gray-400/50 hover:bg-gray-400/30";
                  rankTextClass = "text-gray-400";
                } else if (index === 2) {
                  rankClass = "bg-orange-600/20 border border-orange-600/50 hover:bg-orange-600/30";
                  rankTextClass = "text-orange-500";
                }

                return (
                <Link
                  key={user.id}
                  to={`/profil/${user.kullanici_adi}`}
                  className={`mt-2 flex items-center justify-between p-3 rounded transition-colors ${rankClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold w-6 ${rankTextClass}`}>#{index + 1}</span>
                    <img
                      src={`https://mc-heads.net/avatar/${user.kullanici_adi}`}
                      alt={user.kullanici_adi}
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-white font-medium">{user.kullanici_adi}</span>
                  </div>
                  <span className={`font-bold ${rankTextClass}`}>{user.kredi.toFixed(0)} Kredi</span>
                </Link>
              )})}
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
                  className="mt-2 flex items-center justify-between p-3 bg-[#2A2A2A] rounded hover:bg-[#333333] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://mc-heads.net/avatar/${user.kullanici_adi}`}
                      alt={user.kullanici_adi}
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-white font-medium">{user.kullanici_adi}</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-400">{formatDate(user.kayit_tarihi)}</span>
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
                  <Link key={index} to={`/profil/${purchase.kullanici_adi}`} className="mt-2 flex items-center justify-between p-3 bg-[#2A2A2A] rounded hover:bg-[#333333] transition-colors cursor-pointer">
                    <div className="flex items-center">
                        <img
                            src={`https://mc-heads.net/avatar/${purchase.kullanici_adi}`}
                            alt={purchase.kullanici_adi}
                            className="w-8 h-8 rounded mr-3"
                        />
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{purchase.kullanici_adi}</span>
                          <span className="text-[#FDD500] font-bold text-xs">{purchase.toplam_fiyat} Kredi</span>
                        </div>
                    </div>
                    <span className="text-zinc-500 text-sm font-medium">{purchase.urun_adi}</span>
                  </Link>
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
                  <Link key={index} to={`/profil/${transaction.kullanici_adi}`} className="mt-2 flex items-center justify-between p-3 bg-[#2A2A2A] rounded hover:bg-[#333333] transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                        <img
                            src={`https://mc-heads.net/avatar/${transaction.kullanici_adi}`}
                            alt={transaction.kullanici_adi}
                            className="w-8 h-8 rounded"
                        />
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{transaction.kullanici_adi}</span>
                          <span className="text-xs text-zinc-500">{formatDate(transaction.tarih)}</span>
                        </div>
                    </div>
                    <span className="text-[#FDD500] font-bold">+{transaction.tutar} Kredi</span>
                  </Link>
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
