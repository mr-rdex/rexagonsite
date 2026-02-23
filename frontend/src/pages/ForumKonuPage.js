import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { ArrowLeft, Send, Clock } from 'lucide-react';

const ForumKonuPage = () => {
  const { id } = useParams();
  const { API, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchTopic();
  }, [id, API]);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`${API}/forum/konu/${id}`);
      setData(response.data);
    } catch (error) {
      console.error('Konu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/giris');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/forum/konu/${id}/cevap`,
        { icerik: newReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReply('');
      fetchTopic();
    } catch (error) {
      console.error('Cevap eklenemedi:', error);
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

  if (!data) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center text-zinc-400">Konu bulunamadı</div>
        </div>
      </div>
    );
  }

  const { konu, cevaplar } = data;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="topic-page">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            to={`/forum/${konu.kategori}`}
            className="inline-flex items-center space-x-2 text-zinc-400 hover:text-[#FDD500] transition-colors mb-4"
            data-testid="back-to-category"
          >
            <ArrowLeft size={20} />
            <span>{konu.kategori}</span>
          </Link>
        </div>

        {/* Topic */}
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 mb-6" data-testid="topic-content">
          <h1 className="text-3xl font-bold text-white mb-4">{konu.baslik}</h1>
          <div className="flex items-center space-x-4 mb-6">
            <Link to={`/profil/${konu.yazar_adi}`} className="flex items-center space-x-2">
              <img
<<<<<<< HEAD
                src={`https://cravatar.eu/helmavatar/${konu.yazar_adi}/48`}
=======
                src={`https://mc-heads.net/avatar/${konu.yazar_adi}/48`}
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                alt={konu.yazar_adi}
                className="w-12 h-12 rounded"
              />
              <div>
                <p className="text-white font-medium">{konu.yazar_adi}</p>
                <p className="text-xs text-zinc-500 flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDate(konu.tarih)}</span>
                </p>
              </div>
            </Link>
          </div>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{konu.icerik}</div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          {cevaplar.map((cevap) => (
            <div
              key={cevap.id}
              className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6"
              data-testid="reply-card"
            >
              <div className="flex items-start space-x-4">
                <Link to={`/profil/${cevap.yazar_adi}`}>
                  <img
<<<<<<< HEAD
                    src={`https://cravatar.eu/helmavatar/${cevap.yazar_adi}/40`}
=======
                    src={`https://mc-heads.net/avatar/${cevap.yazar_adi}/40`}
>>>>>>> 6612e1a (Veritabanı ve API ayarları düzeltildi)
                    alt={cevap.yazar_adi}
                    className="w-10 h-10 rounded"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      to={`/profil/${cevap.yazar_adi}`}
                      className="text-white font-medium hover:text-[#FDD500] transition-colors"
                    >
                      {cevap.yazar_adi}
                    </Link>
                    <p className="text-xs text-zinc-500 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatDate(cevap.tarih)}</span>
                    </p>
                  </div>
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{cevap.icerik}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="reply-form">
            <h3 className="text-xl font-bold text-white mb-4">Cevap Yaz</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                required
                rows={4}
                className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                placeholder="Cevabınızı yazın..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                data-testid="reply-input"
              ></textarea>
              <button
                type="submit"
                className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#E6C200] transition-all btn-3d flex items-center space-x-2"
                data-testid="submit-reply-button"
              >
                <Send size={20} />
                <span>Cevapla</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-400 mb-4">Cevap yazmak için giriş yapmalısınız</p>
            <Link
              to="/giris"
              className="inline-block bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#E6C200] transition-all btn-3d"
            >
              Giriş Yap
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumKonuPage;
