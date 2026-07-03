import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Wallet, Plus, Clock, TrendingUp, CreditCard, Package, X, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const CuzdanPage = () => {
  const { API, user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [paketler, setPaketler] = useState([]);
  const [selectedTutar, setSelectedTutar] = useState(null);
  const [starting, setStarting] = useState(false);
  const [pendingTx, setPendingTx] = useState(null); // { transaction_id, tutar, payment_url }
  const [autoRefresh, setAutoRefresh] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
    fetchPaketler();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [API]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/cuzdan/gecmis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('İşlem geçmişi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaketler = async () => {
    try {
      const response = await axios.get(`${API}/shopier/paketler`);
      setPaketler(response.data);
    } catch (error) {
      console.error('Paketler yüklenemedi:', error);
    }
  };

  const startPayment = async (tutar) => {
    if (starting) return;
    setStarting(true);
    setSelectedTutar(tutar);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/shopier/odeme-baslat?tutar=${tutar}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tx = response.data;
      setPendingTx(tx);
      // Yeni sekmede ödemeyi aç
      window.open(tx.payment_url, '_blank', 'noopener,noreferrer');
      // Bekleyen ödemeyi izlemeye başla
      startPolling(tx.transaction_id);
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.detail || 'Ödeme başlatılamadı'));
      setSelectedTutar(null);
    } finally {
      setStarting(false);
    }
  };

  const startPolling = (transactionId) => {
    setAutoRefresh(true);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/shopier/transaction/${transactionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.durum === 'onaylandi') {
          clearInterval(pollRef.current);
          setAutoRefresh(false);
          setPendingTx((prev) => prev ? { ...prev, durum: 'onaylandi' } : prev);
          await fetchTransactions();
          if (refreshUser) await refreshUser();
        } else if (res.data.durum === 'incelemede') {
          clearInterval(pollRef.current);
          setAutoRefresh(false);
          setPendingTx((prev) => prev ? { ...prev, durum: 'incelemede' } : prev);
          await fetchTransactions();
        }
      } catch (e) {
        // sessizce dene
      }
    }, 4000);
  };

  const closeModal = () => {
    setShowLoadModal(false);
    setSelectedTutar(null);
    setPendingTx(null);
    setAutoRefresh(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  };

  const getDurumBadge = (durum) => {
    switch ((durum || '').toLowerCase()) {
      case 'onaylandi':
      case 'tamamlandi':
        return { label: 'Onaylandı', color: 'text-green-500' };
      case 'beklemede':
        return { label: 'Beklemede', color: 'text-yellow-400' };
      case 'incelemede':
        return { label: 'İncelemede', color: 'text-orange-400' };
      default:
        return { label: durum || 'Tamamlandı', color: 'text-zinc-400' };
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
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="wallet-page">
      <div className='cuzdan-mc'></div>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="minecraft-font text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">
            Cuzdan
          </h1>
          <p className="text-lg text-zinc-200">
            Bakiye yükle ve işlem geçmişini görüntüle
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#FDD500] to-[#E6C200] rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute top-64 right-160 w-72 h-72 bg-white/30 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Wallet className="text-black" size={32} />
                <span className="text-black font-bold uppercase tracking-wider">Bakiye</span>
              </div>
              <button
                onClick={() => setShowLoadModal(true)}
                className="bg-black text-[#FDD500] rounded-2xl font-bold uppercase tracking-wide px-6 py-3 button-czdn transition-all flex items-center space-x-2"
                data-testid="load-credit-button"
              >
                <Plus size={20} />
                <span>Bakiye Yükle</span>
              </button>
            </div>
            <div>
              <p className="text-6xl font-black text-black mb-2">{user?.kredi.toFixed(2)} ₺</p>
              <p className="text-black/70 text-sm uppercase tracking-wider">Kullanılabilir Bakiye</p>
            </div>
          </div>
        </div>

        {/* Transaction History - Tabs */}
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-2xl font-bold uppercase text-white flex items-center space-x-3">
              <Clock size={24} className="text-[#FDD500]" />
              <span>İşlem Geçmişi (Yüklemeler)</span>
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {transactions.filter(t => t.tip === 'yukleme').length > 0 ? (
              transactions.filter(t => t.tip === 'yukleme').map((transaction, index) => {
                const badge = getDurumBadge(transaction.durum);
                return (
                  <div
                    key={index}
                    className="p-6 hover:bg-[#2A2A2A] transition-colors"
                    data-testid="transaction-item"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10">
                          <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-bold">Bakiye Yükleme</p>
                          <p className="text-sm text-zinc-500">{formatDate(transaction.tarih)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-500">+{transaction.tutar} ₺</p>
                        <p className={`text-xs uppercase ${badge.color}`}>{badge.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Clock className="mx-auto text-zinc-600 mb-4" size={48} />
                <p className="text-zinc-400">Henüz bir bakiye yükleme işlemi bulunmuyor.</p>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="mt-4 text-[#FDD500] hover:text-[#E6C200] font-medium"
                >
                  İlk yüklemeyi yap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History */}
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-2xl font-bold uppercase text-white flex items-center space-x-3">
              <Package size={24} className="text-[#FDD500]" />
              <span>Satın Alma Geçmişi</span>
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {transactions.filter(t => t.tip === 'harcama').length > 0 ? (
              transactions.filter(t => t.tip === 'harcama').map((transaction, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-[#2A2A2A] transition-colors"
                  data-testid="purchase-item"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
                        <CreditCard className="text-red-500" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{transaction.urun_adi || 'Satın Alma'}</p>
                        <p className="text-sm text-zinc-500">{formatDate(transaction.tarih)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-500">-{transaction.tutar} Kredi</p>
                      <p className="text-xs text-zinc-500 uppercase">Tamamlandı</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Package className="mx-auto text-zinc-600 mb-4" size={48} />
                <p className="text-zinc-400">Henüz bir satın alma işlemi bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Load Credit Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="load-modal" onClick={closeModal}>
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Bakiye Yükle</h3>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X size={24} />
              </button>
            </div>

            {!pendingTx ? (
              <>
                {/* Kullanıcı adı uyarısı */}
                <div className="bg-[#FDD500]/10 border border-[#FDD500]/30 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <AlertCircle className="text-[#FDD500] flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-zinc-200">
                    <p className="mb-1">
                      <strong className="text-[#FDD500]">Önemli:</strong> Shopier ödeme ekranında <strong>&quot;Sipariş Notu&quot;</strong> alanına aşağıdaki kullanıcı adınızı <strong>aynen yazın</strong>. Bu kontrol, ödemenin doğru hesabınıza tanımlanması için gereklidir.
                    </p>
                    <div className="mt-2 bg-black/40 border border-[#FDD500]/40 rounded px-3 py-2 font-mono text-[#FDD500] select-all">
                      {user?.kullanici_adi}
                    </div>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm mb-4 uppercase tracking-wider">Bir paket seçin</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {paketler.map((paket) => (
                    <button
                      key={paket.tutar}
                      disabled={!paket.aktif || starting}
                      onClick={() => startPayment(paket.tutar)}
                      className={`relative rounded-xl p-5 border-2 transition-all text-left group ${
                        paket.aktif
                          ? 'bg-[#2A2A2A] border-zinc-700 hover:border-[#FDD500] hover:bg-[#2A2A2A]/80 cursor-pointer'
                          : 'bg-[#2A2A2A]/40 border-zinc-800 cursor-not-allowed opacity-50'
                      } ${selectedTutar === paket.tutar && starting ? 'border-[#FDD500]' : ''}`}
                      data-testid={`paket-${paket.tutar}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-black text-white group-hover:text-[#FDD500] transition-colors">
                          {paket.tutar}₺
                        </span>
                        {selectedTutar === paket.tutar && starting && (
                          <Loader2 className="animate-spin text-[#FDD500]" size={20} />
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        {paket.aktif ? 'Bakiye Yükle' : 'Yakında'}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                  Ödemeler Shopier üzerinden güvenli şekilde alınır. Ödeme onaylandığında bakiyeniz otomatik olarak hesabınıza eklenir.
                </div>
              </>
            ) : (
              /* Pending / Result State */
              <div className="text-center py-6">
                {pendingTx.durum === 'onaylandi' ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="text-green-500" size={48} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h4>
                    <p className="text-zinc-400 mb-6">
                      <span className="text-[#FDD500] font-bold">{pendingTx.tutar}₺</span> bakiye hesabınıza eklendi.
                    </p>
                    <button
                      onClick={closeModal}
                      className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-8 py-3 rounded-lg hover:bg-[#E6C200] transition-all"
                    >
                      Tamam
                    </button>
                  </>
                ) : pendingTx.durum === 'incelemede' ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <AlertCircle className="text-orange-400" size={48} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">İşlem İncelemede</h4>
                    <p className="text-zinc-400 mb-6">
                      Ödemeniz alındı ancak sipariş notundaki kullanıcı adı eşleşmedi. En kısa sürede yönetici tarafından kontrol edilip hesabınıza yansıtılacaktır.
                    </p>
                    <button
                      onClick={closeModal}
                      className="bg-zinc-700 text-white font-bold uppercase tracking-wide px-8 py-3 rounded-lg hover:bg-zinc-600 transition-all"
                    >
                      Kapat
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FDD500]/10 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#FDD500]" size={48} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Ödeme Bekleniyor</h4>
                    <p className="text-zinc-400 mb-2">
                      Shopier ödeme sayfası yeni sekmede açıldı.
                    </p>
                    <p className="text-zinc-500 text-sm mb-6">
                      Ödemeyi tamamladığınızda bakiye otomatik olarak hesabınıza eklenecek. Bu ekranı kapatabilirsiniz.
                    </p>

                    <div className="bg-[#2A2A2A] border border-zinc-700 rounded-lg p-4 mb-6 text-left space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Tutar:</span>
                        <span className="text-white font-bold">{pendingTx.tutar}₺</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Kullanıcı Adı:</span>
                        <span className="text-[#FDD500] font-mono">{pendingTx.kullanici_adi || user?.kullanici_adi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Durum:</span>
                        <span className="text-yellow-400">Beklemede {autoRefresh && '(kontrol ediliyor...)'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={pendingTx.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Ödeme Sayfasını Tekrar Aç</span>
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={closeModal}
                        className="flex-1 sm:flex-none bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:border-zinc-600 transition-all"
                      >
                        Kapat
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuzdanPage;
