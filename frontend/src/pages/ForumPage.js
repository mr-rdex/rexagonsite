import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { MessageSquare, Users } from 'lucide-react';

const ForumPage = () => {
  const { API } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/forum/kategoriler`);
        setCategories(response.data);
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [API]);

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
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="forum-page">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">
            Forum
          </h1>
          <p className="text-lg text-zinc-400">
            Toplulukla iletişime geç, sorularını sor ve deneyimlerini paylaş
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/forum/Tümü"
            className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all group cursor-pointer"
            data-testid="forum-category-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FDD500]/10 rounded flex items-center justify-center group-hover:bg-[#FDD500]/20 transition-colors">
                  <MessageSquare className="text-[#FDD500]" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FDD500] transition-colors mb-1">
                    Tümü
                  </h3>
                  <p className="text-sm text-zinc-400">Tüm kategorilerdeki konuları gör</p>
                </div>
              </div>
            </div>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/forum/${category.isim}`}
              className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 hover:border-[#FDD500]/50 transition-colors group cursor-pointer"
              data-testid="forum-category-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FDD500]/10 rounded flex items-center justify-center group-hover:bg-[#FDD500]/20 transition-colors">
                    <MessageSquare className="text-[#FDD500]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FDD500] transition-colors mb-1">
                      {category.isim}
                    </h3>
                    <p className="text-sm text-zinc-400">{category.aciklama}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
