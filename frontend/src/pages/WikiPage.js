import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const WikiPage = () => {
  const { slug } = useParams();
  const { API } = useAuth();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const res = await axios.get(`${API}/wiki/${slug}`);
        setPageData(res.data);
      } catch (err) {
        toast.error("Wiki sayfası bulunamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchWiki();
  }, [slug, API]);

  if (loading) {
    return <div className="min-h-screen pt-24 pb-16 px-4 text-center text-zinc-400">Yükleniyor...</div>;
  }

  if (!pageData) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center">
        <BookOpen className="text-zinc-600 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Sayfa Bulunamadı</h2>
        <p className="text-zinc-400">Bu URL'ye ait bir wiki sayfası henüz oluşturulmamış.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="wiki-page">
      <div className="container mx-auto max-w-8xl">
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-zinc-800">
            <BookOpen className="text-[#FDD500]" size={36} />
            <h1 className="text-4xl font-black uppercase text-white tracking-wide">{pageData.baslik}</h1>
          </div>
          <div
            className="prose prose-invert prose-yellow max-w-none prose-headings:text-[#FDD500] prose-a:text-[#FDD500] hover:prose-a:text-[#E6C200]"
            dangerouslySetInnerHTML={{ __html: pageData.icerik }}
          />
          <div className="mt-12 pt-6 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
            <span>Son Güncelleme: {new Date(pageData.son_guncelleme).toLocaleString('tr-TR')}</span>
            <span className="">Geliştirici: <span className="text-[#FDD500] font-bold">{pageData.guncelleyen}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiPage;
