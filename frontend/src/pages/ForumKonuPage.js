import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { ArrowLeft, Send, Clock, Lock, CheckCircle, Trash2, Heart, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.success("Yanıt eklendi.");
    } catch (error) {
      toast.error('Cevap eklenemedi.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Dosya boyutu 3MB'dan büyük olamaz!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem('token');
    const toastId = toast.loading('Resim yükleniyor...');

    try {
      const response = await axios.post(`${API}/forum/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const imageUrl = response.data.gorsel_url;
      const imageMarkdown = `![Resim](${imageUrl})`;
      setNewReply(prev => prev ? prev + '\n' + imageMarkdown : imageMarkdown);
      toast.success('Resim yüklendi', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Resim yüklenemedi', { id: toastId });
    }
  };

  const handleDeleteReply = async (cevapId) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/forum/cevap/${cevapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTopic();
    } catch (error) {
      alert('Yorum silinemedi.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/giris');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/forum/konu/${id}/begen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTopic();
    } catch (error) {
      console.error('Beğeni işlemi başarısız', error);
    }
  };

  const handleReplyLike = async (cevapId) => {
    if (!user) {
      navigate('/giris');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/forum/cevap/${cevapId}/begen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTopic();
    } catch (error) {
      console.error('Beğeni işlemi başarısız', error);
    }
  };

  const handleQuote = (yazarAdi, icerik) => {
    setNewReply(`> ${yazarAdi} dedi ki:\n> ${icerik}\n\n`);
    document.getElementById('reply-textarea')?.focus();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
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
          <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            {konu.baslik}
            {konu.kapali && <span className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full flex items-center gap-1"><Lock size={14} /> Kapalı</span>}
            {konu.cozuldu && <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={14} /> Çözüldü</span>}
          </h3>
          <div className="flex items-center space-x-4 mb-6">
            <Link to={`/profil/${konu.yazar_adi}`} className="flex items-center space-x-2">
              <img
                src={`https://mc-heads.net/avatar/${konu.yazar_adi}`}
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
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-6">{konu.icerik}</div>
          <div className="flex items-center justify-end border-t border-zinc-800 pt-4">
            <button onClick={handleLike} className={`flex items-center space-x-2 transition-colors ${user && konu.begenenler?.includes(user.id) ? 'text-pink-500' : 'text-zinc-400 hover:text-pink-500'}`}>
              <Heart size={20} className={user && konu.begenenler?.includes(user.id) ? 'fill-current' : ''} />
              <span className="font-bold">{konu.begenenler?.length || 0} Beğeni</span>
            </button>
          </div>
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
                    src={`https://mc-heads.net/avatar/${cevap.yazar_adi}/40`}
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
                    <div className="flex items-center space-x-4">
                      <p className="text-xs text-zinc-500 flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{formatDate(cevap.tarih)}</span>
                      </p>
                      {user && user.rol === 'admin' && (
                        <button onClick={() => handleDeleteReply(cevap.id)} className="text-red-500 hover:text-red-400" title="Yorumu Sil">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{cevap.icerik}</div>
                  <div className="flex items-center space-x-4 mt-4 text-sm">
                    <button
                      onClick={() => handleReplyLike(cevap.id)}
                      className={`flex items-center space-x-1 ${user && (cevap.begenenler || []).includes(user.id) ? 'text-red-500' : 'text-zinc-400 hover:text-red-400'}`}
                    >
                      <Heart size={16} className={user && (cevap.begenenler || []).includes(user.id) ? 'fill-current' : ''} />
                      <span>{(cevap.begenenler || []).length}</span>
                    </button>
                    {!konu.kapali && (
                      <button onClick={() => handleQuote(cevap.yazar_adi, cevap.icerik)} className="text-zinc-400 hover:text-[#FDD500] flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span>Alıntıla</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {konu.kapali ? (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 text-center text-red-500 font-bold flex flex-col items-center justify-center">
            <Lock size={32} className="mb-4" />
            Bu konu yorumlara kapatılmıştır.
          </div>
        ) : user ? (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6" data-testid="reply-form">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Cevap Yaz</h3>
              <label className="text-sm font-medium text-[#FDD500] cursor-pointer hover:text-[#E6C200] transition-colors flex items-center space-x-1">
                <ImageIcon size={16} />
                <span>Resim Ekle (Max 3MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                id="reply-textarea"
                required
                rows={4}
                className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                placeholder="Cevabınızı yazın... Resim eklemek için 'Resim Ekle' butonunu kullanabilirsiniz."
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
