import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { LogIn, User, Lock } from 'lucide-react';

const GirisPage = () => {
  const { API, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kullanici_adi: '',
    sifre: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/giris`, formData);
      login(response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="login-page">
      <div className="container mx-auto max-w-md">
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDD500]/10 rounded-full mb-4">
              <LogIn className="text-[#FDD500]" size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase text-white mb-2">Giriş Yap</h1>
            <p className="text-zinc-400">Hesabınıza giriş yapın</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 mb-6" data-testid="error-message">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="kullanici_adi">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600" size={20} />
                <input
                  id="kullanici_adi"
                  type="text"
                  required
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  placeholder="Kullanıcı adınız"
                  value={formData.kullanici_adi}
                  onChange={(e) => setFormData({ ...formData, kullanici_adi: e.target.value })}
                  data-testid="username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="sifre">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600" size={20} />
                <input
                  id="sifre"
                  type="password"
                  required
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  placeholder="••••••••"
                  value={formData.sifre}
                  onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FDD500] text-black font-bold uppercase tracking-wide px-8 py-4 rounded-sm hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-button"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="text-[#FDD500] hover:text-[#E6C200] font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GirisPage;
