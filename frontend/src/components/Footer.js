import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../App';

const Footer = () => {
  const { API, user } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ baslik: '', aciklama: '', konu: 'Genel' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Rapor göndermek için giriş yapmalısınız.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/reports`, report, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Raporunuz başarıyla gönderildi!');
      setShowReport(false);
      setReport({ baslik: '', aciklama: '', konu: 'Genel' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Rapor gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <footer className="bg-[#1A1A1A] border-t border-zinc-800 mt-20">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <img 
                src="/images/footer-logo.png" 
                alt="Rexagon" 
                className="h-24 w-auto object-contain mb-4"
              />
              <p className="text-zinc-400 text-sm">
                Türkiye'nin en büyük Minecraft sunucu topluluğu. Heyecan dolu maceralar seni bekliyor!
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Hızlı Erişim</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link to="/market" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    Market
                  </Link>
                </li>
                <li>
                  <Link to="/forum" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link to="/hakkimizda" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    Hakkımızda
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Destek</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowReport(true)}
                    className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm"
                    data-testid="help-center-button"
                  >
                    Yardım Merkezi
                  </button>
                </li>
                <li>
                  <Link to="/forum/Duyurular" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    Duyurular
                  </Link>
                </li>
                <li>
                  <a href="mailto:destek@rexagon.com.tr" className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm">
                    İletişim
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="text-zinc-400 hover:text-[#FDD500] transition-colors text-sm"
                    data-testid="privacy-policy-button"
                  >
                    Gizlilik Politikası
                  </button>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Sosyal Medya</h3>
              <div className="flex space-x-4 mb-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-zinc-400 hover:text-[#FDD500] hover:bg-[#FDD500]/10 transition-all duration-300">
                  <Facebook size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-zinc-400 hover:text-[#FDD500] hover:bg-[#FDD500]/10 transition-all duration-300">
                  <Twitter size={20} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-zinc-400 hover:text-[#FDD500] hover:bg-[#FDD500]/10 transition-all duration-300">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-zinc-400 hover:text-[#FDD500] hover:bg-[#FDD500]/10 transition-all duration-300">
                  <Youtube size={20} />
                </a>
              </div>
              <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                <Mail size={16} />
                <a href="mailto:info@rexagon.com.tr" className="hover:text-[#FDD500] transition-colors">
                  info@rexagon.com.tr
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-500 text-sm mb-4 md:mb-0">
              2026 Rexagon Minecraft Server. Tüm hakları saklıdır.
            </p>
            <p className="text-zinc-500 text-xs">
              Made with <span className="text-[#FDD500]">&#9829;</span> by Rexagon Team
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="privacy-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Gizlilik Politikası</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-zinc-400 hover:text-white transition-colors" data-testid="close-privacy-modal">
                <X size={24} />
              </button>
            </div>
            <div className="text-zinc-400 text-sm space-y-4">
              <p><strong className="text-white">1. Veri Toplama</strong><br />
                Rexagon Minecraft sunucusuna kayıt olduğunuzda kullanıcı adı, e-posta adresi ve doğum tarihi bilgileriniz toplanmaktadır.</p>
              <p><strong className="text-white">2. Veri Kullanımı</strong><br />
                Toplanan veriler yalnızca sunucu hizmetlerinin sağlanması, kullanıcı deneyiminin iyileştirilmesi ve güvenlik amacıyla kullanılmaktadır.</p>
              <p><strong className="text-white">3. Veri Güvenliği</strong><br />
                Şifreleriniz şifrelenerek saklanmaktadır. Kişisel bilgileriniz üçüncü taraflarla paylaşılmamaktadır.</p>
              <p><strong className="text-white">4. Çerezler</strong><br />
                Sitemiz, oturum yönetimi için çerezler kullanmaktadır. Bu çerezler, giriş durumunuzu korumak için gereklidir.</p>
              <p><strong className="text-white">5. Kullanıcı Hakları</strong><br />
                Hesabınızı istediğiniz zaman silebilir ve verilerinizin kaldırılmasını talep edebilirsiniz.</p>
              <p><strong className="text-white">6. İletişim</strong><br />
                Gizlilik politikası hakkında sorularınız için destek@rexagon.com.tr adresinden bize ulaşabilirsiniz.</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Center / Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="report-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Yardım Merkezi</h3>
              <button onClick={() => setShowReport(false)} className="text-zinc-400 hover:text-white transition-colors" data-testid="close-report-modal">
                <X size={24} />
              </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Bir sorun bildirin veya yardım talep edin. Ekibimiz en kısa sürede size dönüş yapacaktır.</p>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Konu</label>
                <select
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  value={report.konu}
                  onChange={(e) => setReport({ ...report, konu: e.target.value })}
                  data-testid="report-topic-select"
                >
                  <option value="Genel">Genel</option>
                  <option value="Hata Bildirimi">Hata Bildirimi</option>
                  <option value="Oyuncu Şikayeti">Oyuncu Şikayeti</option>
                  <option value="Ödeme Sorunu">Ödeme Sorunu</option>
                  <option value="Öneri">Öneri</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  value={report.baslik}
                  onChange={(e) => setReport({ ...report, baslik: e.target.value })}
                  placeholder="Raporunuzun başlığı"
                  data-testid="report-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Açıklama</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all"
                  value={report.aciklama}
                  onChange={(e) => setReport({ ...report, aciklama: e.target.value })}
                  placeholder="Sorununuzu detaylı bir şekilde açıklayın"
                  data-testid="report-description-input"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="flex-1 bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d disabled:opacity-50"
                  data-testid="submit-report-button"
                >
                  {submitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="flex-1 bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:border-zinc-600 transition-all"
                >
                  İptal
                </button>
              </div>
              {!user && (
                <p className="text-red-400 text-xs text-center">Rapor göndermek için giriş yapmalısınız.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
