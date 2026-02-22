import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Wallet, Plus, Clock, TrendingUp, CreditCard } from 'lucide-react';

const CuzdanPage = () => {
  const { API, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchTransactions();
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

  const handleLoadCredit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cuzdan/yukle?tutar=${parseFloat(amount)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }  }
      );
      alert('Ödeme başlatıldı. PayTR/Shopier entegrasyonu tamamlandığında aktif olacak.');
      setShowLoadModal(false);
      setAmount('');
      fetchTransactions();
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.detail || 'Bir hata oluştu'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">
            Cüzdan
          </h1>
          <p className="text-lg text-zinc-400">
            Bakiyeni yönet ve işlem geçmişini görüntüle
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#FDD500] to-[#E6C200] rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Wallet className="text-black" size={32} />
                <span className="text-black font-bold uppercase tracking-wider">Bakiye</span>
              </div>
              <button
                onClick={() => setShowLoadModal(true)}
                className="bg-black text-[#FDD500] font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-zinc-900 transition-all flex items-center space-x-2"
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

        {/* Transaction History */}
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-bold uppercase text-white flex items-center space-x-3">
              <Clock size={24} className="text-[#FDD500]" />
              <span>İşlem Geçmişi</span>
            </h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-[#2A2A2A] transition-colors"
                  data-testid="transaction-item"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.tip === 'yukleme' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {transaction.tip === 'yukleme' ? (
                          <TrendingUp className="text-green-500" size={24} />
                        ) : (
                          <CreditCard className="text-red-500" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold">
                          {transaction.tip === 'yukleme' ? 'Bakiye Yükleme' : 'Satın Alma'}
                        </p>
                        <p className="text-sm text-zinc-500">{formatDate(transaction.tarih)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.tip === 'yukleme' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.tip === 'yukleme' ? '+' : '-'}{transaction.tutar} ₺
                      </p>
                      <p className="text-xs text-zinc-500 uppercase">
                        {transaction.durum || 'Tamamlandı'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Wallet className="mx-auto text-zinc-600 mb-4" size={48} />
                <p className="text-zinc-400">Henüz işlem geçmişi yok</p>
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
      </div>

      {/* Load Credit Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" data-testid="load-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-6">Bakiye Yükle</h3>
            <form onSubmit={handleLoadCredit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yüklenecek Tutar (₺)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="0.01"
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="amount-input"
                />
              </div>
              <div className="bg-[#FDD500]/10 border border-[#FDD500]/30 rounded-lg p-4">
                <p className="text-sm text-zinc-300">
                  <strong className="text-[#FDD500]">Not:</strong> PayTR/Shopier entegrasyonu aktif edildiğinde ödeme işlemi başlatılacaktır.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d"
                  data-testid="submit-load-button"
                >
                  Yükle
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoadModal(false)}
                  className="flex-1 bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:border-zinc-600 transition-all"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuzdanPage;
