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
    fetchData();
  }, [activeTab, API]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/leaderboard/${activeTab}`);
      setData(response.data);
    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
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
      key={user.id}
      to={`/profil/${user.kullanici_adi}`}
      className="flex items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors"
    >
      <div className="flex items-center space-x-4">
        <span className={`text-2xl font-black w-12 text-center ${getRankColor(index)}`}>#{index + 1}</span>
<<<<<<< HEAD
        <img src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/48`} alt={user.kullanici_adi} className="w-12 h-12 rounded" />
=======
        <img src={`https://mc-heads.net/avatar/${user.kullanici_adi}`} alt={user.kullanici_adi} className="w-12 h-12 rounded" />
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
        <div>
          <p className="text-white font-bold">{user.kullanici_adi}</p>
          <p className="text-xs text-zinc-500">Kayıt: {formatDate(user.kayit_tarihi)}</p>
        </div>
      </div>
      <span className="text-2xl font-black text-[#FDD500]">{(user[valueKey] || 0).toFixed ? (user[valueKey] || 0).toFixed(0) : (user[valueKey] || 0)} {valueSuffix}</span>
    </Link>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="leaderboard-page">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">Sıralama</h1>
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

            {activeTab === 'ada-seviyesi' && (
              <div className="divide-y divide-zinc-800" data-testid="ada-seviyesi-list">
                {data.length > 0 ? (
                  data.map((user, index) => renderUserRow(user, index, 'ada_seviyesi', 'Seviye'))
                ) : (
                  <div className="p-12 text-center text-zinc-400">Henüz veri yok</div>
                )}
              </div>
            )}

            {activeTab === 'dinar' && (
              <div className="divide-y divide-zinc-800" data-testid="dinar-list">
                {data.length > 0 ? (
                  data.map((user, index) => renderUserRow(user, index, 'dinar', 'Dinar'))
                ) : (
                  <div className="p-12 text-center text-zinc-400">Henüz veri yok</div>
                )}
              </div>
            )}

            {activeTab === 'son-kayitlar' && (
              <div className="divide-y divide-zinc-800" data-testid="kayit-list">
                {data.map((user) => (
                  <Link key={user.id} to={`/profil/${user.kullanici_adi}`} className="flex items-center justify-between p-6 hover:bg-[#2A2A2A] transition-colors">
                    <div className="flex items-center space-x-4">
<<<<<<< HEAD
                      <img src={`https://cravatar.eu/helmavatar/${user.kullanici_adi}/48`} alt={user.kullanici_adi} className="w-12 h-12 rounded" />
=======
                      <img src={`https://mc-heads.net/avatar/${user.kullanici_adi}/48`} alt={user.kullanici_adi} className="w-12 h-12 rounded" />
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                      <div>
                        <p className="text-white font-bold">{user.kullanici_adi}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400">{formatDate(user.kayit_tarihi)}</span>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'son-alisverisler' && (
              <div className="divide-y divide-zinc-800" data-testid="alisveris-list">
                {data.length > 0 ? (
                  data.map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <ShoppingBag className="text-[#FDD500]" size={24} />
                        <div>
                          <p className="text-white font-bold">{purchase.kullanici_adi}</p>
                          <p className="text-xs text-zinc-500">{purchase.urun_adi}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#FDD500]">{purchase.toplam_fiyat} Kredi</span>
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
                    <div key={index} className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <Coins className="text-[#FDD500]" size={24} />
                        <p className="text-white font-bold">{transaction.kullanici_adi}</p>
                      </div>
                      <span className="text-lg font-bold text-green-500">+{transaction.tutar} Kredi</span>
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
