import React from 'react';
import { Shield, Wrench, Users, Zap, Database, Lock, MessageCircle, ShoppingBag } from 'lucide-react';

const HakkimizdaPage = () => {
  const yetkililer = [
    {
      isim: 'AdminKral',
      yetki: 'Yönetici',
      gorev: 'Sunucu Sahibi & Genel Yönetim',
      avatar: 'AdminKral',
      renk: 'from-red-500 to-orange-500'
    },
    {
      isim: 'ModMaster',
      yetki: 'Yönetici',
      gorev: 'Teknik Yönetim & Geliştirme',
      avatar: 'ModMaster',
      renk: 'from-purple-500 to-pink-500'
    },
    {
      isim: 'HelperPro',
      yetki: 'Moderatör',
      gorev: 'Moderasyon & Oyuncu Desteği',
      avatar: 'HelperPro',
      renk: 'from-blue-500 to-cyan-500'
    },
    {
      isim: 'SupportHero',
      yetki: 'Moderatör',
      gorev: 'Forum & Destek Yönetimi',
      avatar: 'SupportHero',
      renk: 'from-green-500 to-emerald-500'
    }
  ];

  const sistemler = [
    {
      icon: Shield,
      baslik: 'Anti-Cheat Sistemi',
      aciklama: 'Gelişmiş anti-cheat sistemi ile hilecilere karşı 7/24 koruma.',
      renk: 'text-red-500'
    },
    {
      icon: Wrench,
      baslik: 'Özel Plugin Sistemi',
      aciklama: 'Sunucumuza özel geliştirilen unique pluginler ve sistemler.',
      renk: 'text-[#FDD500]'
    },
    {
      icon: Users,
      baslik: 'Topluluk Sistemi',
      aciklama: 'Forum, clan sistemi ve sosyal etkileşim özellikleri.',
      renk: 'text-blue-500'
    },
    {
      icon: Zap,
      baslik: 'Yüksek Performans',
      aciklama: 'Güçlü sunucu altyapısı ile lag-free oyun deneyimi.',
      renk: 'text-purple-500'
    },
    {
      icon: Database,
      baslik: 'Güvenli Veri Saklama',
      aciklama: 'Oyuncu verileriniz güvenli ve düzenli yedekleniyor.',
      renk: 'text-green-500'
    },
    {
      icon: Lock,
      baslik: 'Hesap Güvenliği',
      aciklama: '2FA ve gelişmiş güvenlik önlemleri ile hesap koruması.',
      renk: 'text-orange-500'
    },
    {
      icon: MessageCircle,
      baslik: 'Destek Sistemi',
      aciklama: '7/24 aktif destek ekibi ve ticket sistemi.',
      renk: 'text-cyan-500'
    },
    {
      icon: ShoppingBag,
      baslik: 'Market Sistemi',
      aciklama: 'Güvenli ve kolay kullanımlı market sistemi.',
      renk: 'text-pink-500'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="about-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-6">
            Hakkımızda
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
            Rexagon Minecraft Sunucusu, Türkiye'nin en kaliteli ve güvenilir Minecraft topluluk sunucularından biridir.
            2020 yılından beri binlerce oyuncuya eşsiz bir oyun deneyimi sunuyoruz.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300">
            <h2 className="text-3xl font-bold uppercase text-[#FDD500] mb-4">Misyonumuz</h2>
            <p className="text-zinc-300 leading-relaxed">
              Türk Minecraft topluluğuna en iyi oyun deneyimini sunmak, adil ve eğlenceli bir ortam oluşturmak.
              Her oyuncunun kendini özel hissettiği, güvenli ve aktif bir topluluk yaratmak temel hedefimizdir.
            </p>
          </div>
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300">
            <h2 className="text-3xl font-bold uppercase text-[#FDD500] mb-4">Vizyonumuz</h2>
            <p className="text-zinc-300 leading-relaxed">
              Türkiye'nin en büyük ve en kaliteli Minecraft sunucusu olmak. Sürekli yenilikler ve güncellemeler ile
              oyuncularımıza her zaman en iyi içeriği sunmak ve lider konumumuzu korumak.
            </p>
          </div>
        </div>

        {/* Yetkili Kadro */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-12 text-center">
            Yetkili Kadromuz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {yetkililer.map((yetkili, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 text-center hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300 group"
                data-testid="staff-card"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={`https://cravatar.eu/helmavatar/${yetkili.avatar}/128`}
                    alt={yetkili.isim}
                    className="w-24 h-24 rounded-xl mx-auto group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${yetkili.renk} px-4 py-1 rounded-full`}>
                    <span className="text-white font-bold text-xs uppercase">{yetkili.yetki}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 mt-4">{yetkili.isim}</h3>
                <p className="text-sm text-zinc-400">{yetkili.gorev}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sunucu Sistemleri */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-12 text-center">
            Sunucu Sistemlerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sistemler.map((sistem, index) => {
              const Icon = sistem.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300 group"
                  data-testid="system-card"
                >
                  <div className={`w-14 h-14 rounded-xl bg-[#2A2A2A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={sistem.renk} size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{sistem.baslik}</h3>
                  <p className="text-sm text-zinc-400">{sistem.aciklama}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="bg-gradient-to-r from-[#FDD500]/10 to-transparent border border-[#FDD500]/30 rounded-xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-black text-[#FDD500] mb-2">4+</p>
              <p className="text-zinc-400 uppercase tracking-wider text-sm">Yıl Tecrübe</p>
            </div>
            <div>
              <p className="text-5xl font-black text-[#FDD500] mb-2">50K+</p>
              <p className="text-zinc-400 uppercase tracking-wider text-sm">Kayıtlı Üye</p>
            </div>
            <div>
              <p className="text-5xl font-black text-[#FDD500] mb-2">7/24</p>
              <p className="text-zinc-400 uppercase tracking-wider text-sm">Aktif Destek</p>
            </div>
            <div>
              <p className="text-5xl font-black text-[#FDD500] mb-2">99.9%</p>
              <p className="text-zinc-400 uppercase tracking-wider text-sm">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HakkimizdaPage;
