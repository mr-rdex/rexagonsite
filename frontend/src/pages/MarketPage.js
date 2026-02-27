import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Package, Coins, ShoppingCart, Filter } from 'lucide-react';

const MarketPage = () => {
  const { kategori } = useParams();
  const { API, user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(kategori || null);
  const [purchasing, setPurchasing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [API]);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, API]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/market/kategoriler`);
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const fetchItems = async () => {
    try {
      let url;
      if (selectedCategory === 'En Çok Satanlar') {
        url = `${API}/market/en-cok-satanlar`;
      } else if (selectedCategory && selectedCategory !== 'Tümü') {
        url = `${API}/market/${selectedCategory}/urunler`;
      } else {
        url = `${API}/market/Tümü/urunler`;
      }
      const response = await axios.get(url);
      setItems(response.data);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId, itemPrice) => {
    if (!user) {
      navigate('/giris');
      return;
    }

    if (user.kredi < itemPrice) {
      alert('Yetersiz kredi!');
      return;
    }

    setPurchasing(itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/market/satin-al/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Satın alma başarılı! Minecraft komutu: ${response.data.minecraft_command}`);
      setShowConfirmModal(false);
      setSelectedItem(null);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.detail || 'Satın alma başarısız');
    } finally {
      setPurchasing(null);
    }
  };

  const openConfirmModal = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
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
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="market-page">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">
            Market
          </h1>
          <p className="text-lg text-zinc-400">
            Kredilerinle harika öğeler satın al ve oyun deneyimini geliştir
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory('Tümü')}
            className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
              selectedCategory === 'Tümü' || !selectedCategory
                ? 'bg-[#FDD500] text-black btn-3d'
                : 'bg-[#1E1E1E] border border-zinc-800 text-zinc-400 hover:border-[#FDD500]/50'
            }`}
            data-testid="category-all"
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedCategory('En Çok Satanlar')}
            className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
              selectedCategory === 'En Çok Satanlar'
                ? 'bg-[#FDD500] text-black btn-3d'
                : 'bg-[#1E1E1E] border border-zinc-800 text-zinc-400 hover:border-[#FDD500]/50'
            }`}
            data-testid="category-best-sellers"
          >
            En Çok Satanlar
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.isim)}
              className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === cat.isim
                  ? 'bg-[#FDD500] text-black btn-3d'
                  : 'bg-[#1E1E1E] border border-zinc-800 text-zinc-400 hover:border-[#FDD500]/50'
              }`}
              data-testid={`category-${cat.isim}`}
            >
              {cat.isim}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {items.length > 0 ? (
            items.map((item) => {
              const finalPrice = item.indirim > 0 ? item.fiyat * (1 - item.indirim / 100) : item.fiyat;
              return (
              <div
                key={item.id}
                className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all group relative"
                data-testid="market-item-card"
              >
                {item.indirim > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    %{item.indirim} İNDİRİM
                  </div>
                )}
                {item.gorsel && (
                  <div className="bg-[#2A2A2A] overflow-hidden flex items-center justify-center p-4" style={{ height: '200px' }}>
                    <img
                      src={item.gorsel}
                      alt={item.isim}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FDD500] transition-colors">
                      {item.isim}
                    </h3>
                    <span className="text-xs bg-[#2A2A2A] px-2 py-1 rounded text-zinc-400">
                      {item.kategori}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{item.aciklama}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      {item.indirim > 0 && (
                        <span className="text-sm text-zinc-500 line-through">{item.fiyat} ₺</span>
                      )}
                      <span className="text-2xl font-bold text-[#FDD500]">{finalPrice.toFixed(2)} ₺</span>
                    </div>
                    <span className="text-xs text-zinc-500">Stok: {item.stok}</span>
                  </div>
                  <button
                    onClick={() => openConfirmModal(item)}
                    disabled={item.stok <= 0}
                    className="w-full bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    data-testid="purchase-button"
                  >
                    <ShoppingCart size={20} />
                    <span>{item.stok <= 0 ? 'Stokta Yok' : 'Satın Al'}</span>
                  </button>
                </div>
              </div>
            );
            })
          ) : (
            <div className="col-span-3 text-center py-12">
              <Package className="mx-auto text-zinc-600 mb-4" size={48} />
              <p className="text-zinc-400">Bu kategoride ürün bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="purchase-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Satın Alma Onayı</h3>
            <div className="bg-[#2A2A2A] rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                {selectedItem.gorsel && (
                  <img src={selectedItem.gorsel} alt={selectedItem.isim} className="w-16 h-16 rounded object-cover" />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-bold">{selectedItem.isim}</h4>
                  <p className="text-xs text-zinc-400">{selectedItem.kategori}</p>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Fiyat:</span>
                  <span className="text-white font-bold">
                    {selectedItem.indirim > 0 && (
                      <span className="text-zinc-500 line-through mr-2">{selectedItem.fiyat} ₺</span>
                    )}
                    {(selectedItem.indirim > 0 
                      ? selectedItem.fiyat * (1 - selectedItem.indirim / 100) 
                      : selectedItem.fiyat).toFixed(2)} ₺
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Mevcut Bakiye:</span>
                  <span className="text-[#FDD500] font-bold">{user?.kredi.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-zinc-700">
                  <span className="text-zinc-400">Kalan Bakiye:</span>
                  <span className="text-green-500 font-bold">
                    {(user?.kredi - (selectedItem.indirim > 0 
                      ? selectedItem.fiyat * (1 - selectedItem.indirim / 100) 
                      : selectedItem.fiyat)).toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#FDD500]/10 border border-[#FDD500]/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-300">
                <strong className="text-[#FDD500]">Not:</strong> Satın alma işleminiz tamamlandıktan sonra ürün otomatik olarak Minecraft sunucusuna gönderilecektir.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handlePurchase(selectedItem.id, selectedItem.indirim > 0 
                  ? selectedItem.fiyat * (1 - selectedItem.indirim / 100) 
                  : selectedItem.fiyat)}
                disabled={purchasing === selectedItem.id}
                className="flex-1 bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50"
                data-testid="confirm-purchase-button"
              >
                {purchasing === selectedItem.id ? 'Satın Alınıyor...' : 'Onayla'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:border-zinc-600 transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPage;
