import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Trophy, Clock, ShoppingBag, Coins, Mountain, CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const SiralamaPage = () => {
  const { API } = useAuth();
  const [activeTab, setActiveTab] = useState('kredi');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      // Sekmeye göre hangi adrese gideceğimizi seçiyoruz
      if (activeTab === 'kredi') endpoint = `${API}/leaderboard/kredi`;
      else if (activeTab === 'ada-seviyesi') endpoint = `${API}/leaderboard/ada-seviyesi`;
      else if (activeTab === 'dinar') endpoint = `${API}/leaderboard/dinar`;
      else if (activeTab === 'son-kayitlar') endpoint = `${API}/leaderboard/son-kayitlar`;
      else if (activeTab === 'son-alisverisler') endpoint = `${API}/leaderboard/son-alisverisler`;
      else if (activeTab === 'son-kredi-yuklemeler') endpoint = `${API}/leaderboard/son-kredi-yuklemeler`;

      if (endpoint) {
        const res = await axios.get(endpoint);
        setData(res.data); // Gelen veriyi ekrana basılacak olan 'data' içine atar
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  fetchLeaderboardData();
}, [activeTab, API]);

  const formatDate = (dateString) => {
  if (!dateString) return "Bilinmiyor"; // Boş veri gelirse hata verme
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
};

  const tabs = [
    { id: 'kredi', label: 'En Çok Kredi', icon: Trophy },
    { id: 'ada-seviyesi', label: 'En Çok Ada Seviyesi', icon: Mountain },
    { id: 'dinar', label: 'En Çok Dinar', icon: CircleDollarSign },
    { id: 'son-kayitlar', label: 'Son Kayıtlar', icon: Clock },
    { id: 'son-alisverisler', label: 'Son Alışverişler', icon: ShoppingBag },
    { id: 'son-kredi-yuklemeler', label: 'Son Kredi Yüklemeler', icon: Coins }
  ];

  const getRankColor = (index) => {
    if (index === 0) return 'text-[#FDD500]';
    if (index === 1) return 'text-zinc-400';
    if (index === 2) return 'text-[#CD7F32]';
    return 'text-zinc-600';
  };

  const renderUserRow = (user, index, valueKey, valueSuffix) => (
  <Link
    key={index} // user.id yerine index kullanıyoruz çünkü her oyuncu kayıtlı olmayabilir
    to={`/profil/${user.kullanici_adi}`}
    className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors gap-4"
  >
    <div className="flex items-center space-x-4">
      <span className={`text-xl md:text-2xl font-black w-8 md:w-12 text-center ${getRankColor(index)}`}>#{index + 1}</span>
      {/* Kafa resmi her zaman kullanici_adi üzerinden gelir */}
      <img src={`https://mc-heads.net/avatar/${user.kullanici_adi}`} alt={user.kullanici_adi} className="w-10 h-10 md:w-12 md:h-12 rounded" />
      <div className="overflow-hidden">
        <p className="text-white font-bold truncate">{user.kullanici_adi}</p>
        {/* SADECE kayıtlı kullanıcılar için kayıt tarihini gösterir */}
        {user.kayit_tarihi ? (
          <p className="text-xs text-zinc-500 truncate">Kayıt: {formatDate(user.kayit_tarihi)}</p>
        ) : (
          <p className="text-xs text-zinc-600 italic truncate">Siteye henüz kayıt olmamış</p>
        )}
      </div>
    </div>
    {/* Sayıları 1.500 şeklinde noktalı ve okunaklı yazar */}
    <span className="text-lg md:text-2xl font-black text-[#FDD500] self-end md:self-auto">
      {valueKey === 'dinar'
        ? user[valueKey] || "0"
        : Number(user[valueKey] || 0).toLocaleString('tr-TR')} {valueSuffix}
    </span>
  </Link>
);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="leaderboard-page">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="minecraft-font text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">Sıralama</h1>
          <p className="text-lg text-zinc-400">Topluluktaki en iyi oyuncuları keşfet</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-all ${
                  activeTab === tab.id ? 'bg-[#FDD500] text-black btn-3d' : 'bg-[#1E1E1E] border border-zinc-800 text-zinc-400 hover:border-[#FDD500]/50'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-zinc-400">Yükleniyor...</div>
        ) : (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
            {activeTab === 'kredi' && (
              <div className="divide-y divide-zinc-800" data-testid="kredi-list">
                {data.map((user, index) => renderUserRow(user, index, 'kredi', 'Kredi'))}
              </div>
            )}

            {/* Ada Seviyesi Listesi */}
{activeTab === 'ada-seviyesi' && (
  <div className="divide-y divide-zinc-800" data-testid="ada-seviyesi-list">
    {data.length > 0 ? (
      data.map((island, index) => (
        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors gap-4">
          <div className="flex items-center space-x-4">
            <span className={`text-xl md:text-2xl font-black w-8 md:w-12 text-center ${getRankColor(island.sira - 1)}`}>#{island.sira}</span>
            <img src={`https://mc-heads.net/avatar/${island.ada_lideri}`} alt={island.ada_lideri} className="w-10 h-10 md:w-12 md:h-12 rounded" />
            <div className="overflow-hidden">
              <p className="text-white font-bold truncate">{island.ada_adi}</p>
              <p className="text-xs text-zinc-500 truncate" title={island.uyeler || 'Yok'}>Ada Üyeleri: {island.uyeler || 'Yok'}</p>
            </div>
          </div>
          <span className="text-lg md:text-2xl font-black text-[#FDD500] self-end md:self-auto">
            {island.ada_seviyesi} Seviye
          </span>
        </div>
      ))
    ) : (
      <div className="p-12 text-center text-zinc-400">Veriler senkronize ediliyor, lütfen bekleyin...</div>
    )}
  </div>
)}

{/* Dinar Listesi */}
{activeTab === 'dinar' && (
  <div className="divide-y divide-zinc-800" data-testid="dinar-list">
    {data.length > 0 ? (
      data.map((user, index) => (
        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors gap-4">
          <div className="flex items-center space-x-4">
            <span className={`text-xl md:text-2xl font-black w-8 md:w-12 text-center ${getRankColor(user.sira - 1)}`}>#{user.sira}</span>
            <img src={`https://mc-heads.net/avatar/${user.oyuncu}`} alt={user.oyuncu} className="w-10 h-10 md:w-12 md:h-12 rounded" />
            <div className="overflow-hidden">
              <p className="text-white font-bold truncate">{user.oyuncu}</p>
            </div>
          </div>
          <span className="text-lg md:text-2xl font-black text-[#FDD500] self-end md:self-auto">
            {user.dinar} Dinar
          </span>
        </div>
      ))
    ) : (
      <div className="p-12 text-center text-zinc-400">Veriler senkronize ediliyor, lütfen bekleyin...</div>
    )}
  </div>
)}

            {activeTab === 'son-kayitlar' && (
              <div className="divide-y divide-zinc-800" data-testid="kayit-list">
                {data.map((user) => (
                  <Link key={user.id} to={`/profil/${user.kullanici_adi}`} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors gap-4">
                    <div className="flex items-center space-x-4">
                      <img src={`https://mc-heads.net/avatar/${user.kullanici_adi}`} alt={user.kullanici_adi} className="w-10 h-10 md:w-12 md:h-12 rounded" />
                      <div className="overflow-hidden">
                        <p className="text-white font-bold truncate">{user.kullanici_adi}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400 self-end md:self-auto">{formatDate(user.kayit_tarihi)}</span>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'son-alisverisler' && (
              <div className="divide-y divide-zinc-800" data-testid="alisveris-list">
                {data.length > 0 ? (
                  data.map((purchase, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                      <div className="flex items-center space-x-4">
                        <span className={`text-xl md:text-2xl font-black w-8 md:w-12 text-center ${getRankColor(index)}`}>#{index + 1}</span>
                        <ShoppingBag className="text-[#FDD500] hidden md:block" size={24} />
                        <div className="overflow-hidden">
                          <div className="flex items-center">
                            <img
                                src={`https://mc-heads.net/avatar/${purchase.kullanici_adi}`}
                                alt={purchase.kullanici_adi}
                                className="w-8 h-8 rounded mr-3"
                            />
                            <div className="overflow-hidden">
                                <p className="text-white font-bold truncate">{purchase.kullanici_adi}</p>
                                <p className="text-xs text-zinc-500 truncate">{purchase.urun_adi}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#FDD500] self-end md:self-auto">{purchase.toplam_fiyat} Kredi</span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-400">Henüz alışveriş yok</div>
                )}
              </div>
            )}

            {activeTab === 'son-kredi-yuklemeler' && (
              <div className="divide-y divide-zinc-800" data-testid="kredi-yukleme-list">
                {data.length > 0 ? (
                  data.map((transaction, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                      <div className="flex items-center space-x-4">
                        <span className={`text-xl md:text-2xl font-black w-8 md:w-12 text-center ${getRankColor(index)}`}>#{index + 1}</span>
                        <Coins className="text-[#FDD500] hidden md:block" size={24} />
                        <div className="flex items-center overflow-hidden">
                            <img
                                src={`https://mc-heads.net/avatar/${transaction.kullanici_adi}`}
                                alt={transaction.kullanici_adi}
                                className="w-8 h-8 rounded mr-3"
                            />
                            <p className="text-white font-bold truncate">{transaction.kullanici_adi}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-500 self-end md:self-auto">+{transaction.tutar} Kredi</span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-400">Henüz kredi yükleme yok</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiralamaPage;
