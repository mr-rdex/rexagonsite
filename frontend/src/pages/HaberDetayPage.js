import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Calendar, User, Eye, ArrowLeft } from 'lucide-react';

const HaberDetayPage = () => {
  const { id } = useParams();
  const { API } = useAuth();
  const [haber, setHaber] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchHaber = async () => {
      try {
        const response = await axios.get(`${API}/haber/${id}`);
        setHaber(response.data);
      } catch (error) {
        console.error('Haber yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHaber();
  }, [API, id]);

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
        <div className="container mx-auto max-w-4xl">
          <div className="text-center text-zinc-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!haber) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center text-red-500 text-xl">Haber bulunamadı.</div>
          <Link to="/" className="text-[#FDD500] hover:underline mt-4 block text-center">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="haber-detay-page">
      <div className="container mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-[#FDD500] mb-8 transition-colors group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Ana Sayfaya Dön
        </Link>

        <article className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden">
          {haber.gorsel_url && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={haber.gorsel_url}
                alt={haber.baslik}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              {haber.baslik}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800">
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-[#FDD500]" />
                {formatDate(haber.tarih)}
              </div>
              <div className="flex items-center">
                <User size={18} className="mr-2 text-[#FDD500]" />
                <span className="text-white">{haber.yazar_adi}</span>
              </div>
              <div className="flex items-center">
                <Eye size={18} className="mr-2 text-[#FDD500]" />
                <span>{haber.goruntulenme || 0} Görüntülenme</span>
              </div>
            </div>

            <div className="prose prose-invert prose-yellow max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {haber.icerik}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default HaberDetayPage;
