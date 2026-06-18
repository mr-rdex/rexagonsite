import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { ArrowLeft, MessageSquare, Clock, Plus, Heart, Image as ImageIcon, Bold, Italic, Link as LinkIcon, List, Heading1 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ForumKategoriPage = () => {
  const { kategori } = useParams();
  const { API, user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ baslik: '', icerik: '' });

  useEffect(() => {
    fetchTopics();
  }, [kategori, API]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API}/forum/${kategori}/konular`);
      setTopics(response.data);
    } catch (error) {
      console.error('Konular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('topic-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newTopic.icerik || '';

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const insertedText = prefix + selection + suffix;
    setNewTopic(prev => ({ ...prev, icerik: before + insertedText + after }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    }, 0);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/giris');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/forum/konu`,
        { ...newTopic, kategori },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTopic({ baslik: '', icerik: '' });
      setShowNewTopic(false);
      fetchTopics();
      toast.success("Konu başarıyla oluşturuldu.");
    } catch (error) {
      toast.error('Konu oluşturulamadı.');
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
      setNewTopic(prev => ({ ...prev, icerik: prev.icerik ? prev.icerik + '\n' + imageMarkdown : imageMarkdown }));
      toast.success('Resim yüklendi', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Resim yüklenemedi', { id: toastId });
    }
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="forum-category-page">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/forum"
              className="p-2 text-zinc-400 hover:text-[#FDD500] transition-colors"
              data-testid="back-to-forum"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className=" text-4xl md:text-5xl font-black uppercase text-white">{kategori}</h1>
              <p className="text-zinc-400 mt-1">{topics.length} konu</p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setShowNewTopic(!showNewTopic)}
              className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#E6C200] transition-all btn-3d flex items-center space-x-2"
              data-testid="new-topic-button"
            >
              <Plus size={20} />
              <span>Yeni Konu</span>
            </button>
          )}
        </div>

        {showNewTopic && (
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 mb-8" data-testid="new-topic-form">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Konu Oluştur</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  placeholder="Konu başlığı..."
                  value={newTopic.baslik}
                  onChange={(e) => setNewTopic({ ...newTopic, baslik: e.target.value })}
                  data-testid="topic-title-input"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-400">İçerik</label>
                </div>
                <div className="border border-zinc-700 rounded-md overflow-hidden bg-[#2A2A2A]">
                  <div className="bg-[#1E1E1E] border-b border-zinc-700 p-2 flex items-center space-x-2">
                    <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Kalın"><Bold size={16} /></button>
                    <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="İtalik"><Italic size={16} /></button>
                    <button type="button" onClick={() => insertMarkdown('# ', '')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Başlık"><Heading1 size={16} /></button>
                    <div className="w-px h-5 bg-zinc-700 mx-1"></div>
                    <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Link Ekle"><LinkIcon size={16} /></button>
                    <button type="button" onClick={() => insertMarkdown('- ', '')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Liste"><List size={16} /></button>
                    <div className="w-px h-5 bg-zinc-700 mx-1"></div>
                    <label className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors cursor-pointer flex items-center space-x-1" title="Resim Yükle (Max 3MB)">
                      <ImageIcon size={16} />
                      <span className="text-xs ml-1 hidden sm:inline">Resim Yükle</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <textarea
                    id="topic-textarea"
                    required
                    rows={6}
                    className="w-full bg-[#2A2A2A] border-none text-white px-4 py-3 focus:outline-none focus:ring-0 resize-y"
                    placeholder="Konu içeriği... Markdown desteklenir."
                    value={newTopic.icerik}
                    onChange={(e) => setNewTopic({ ...newTopic, icerik: e.target.value })}
                    data-testid="topic-content-input"
                  ></textarea>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#E6C200] transition-all btn-3d"
                  data-testid="submit-topic-button"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTopic(false)}
                  className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase tracking-wide px-6 py-3 rounded-sm hover:border-zinc-600 transition-all"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <Link
                key={topic.id}
                to={`/forum/konu/${topic.id}`}
                className="block bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 hover:border-[#FDD500]/50 transition-colors group"
                data-testid="topic-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FDD500] transition-colors mb-2">
                      {topic.baslik}
                    </h3>
                    <div className="text-sm text-zinc-400 line-clamp-2 mb-3 prose prose-invert max-w-none prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.icerik}</ReactMarkdown>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-zinc-500">
                      <span className="flex items-center space-x-1">
                        <img
                          src={`https://mc-heads.net/avatar/${topic.yazar_adi}/24`}
                          alt={topic.yazar_adi}
                          className="w-4 h-4 rounded"
                        />
                        <span>{topic.yazar_adi}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDate(topic.tarih)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare size={14} />
                        <span>{topic.cevap_sayisi} cevap</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{topic.begenenler?.length || 0} beğeni</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-zinc-600 mb-4" size={48} />
              <p className="text-zinc-400">Bu kategoride henüz konu yok</p>
              {user && (
                <button
                  onClick={() => setShowNewTopic(true)}
                  className="mt-4 text-[#FDD500] hover:text-[#E6C200] font-medium"
                >
                  İlk konuyu sen aç
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumKategoriPage;
