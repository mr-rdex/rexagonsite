import React from 'react';
import { 
  Shield, Wrench, Users, Zap, Database, Lock, MessageCircle, ShoppingBag, 
  PackagePlus, Swords, Bot, Dices, Sparkles, Flame, Landmark, FlaskConical, 
  Hexagon, VenetianMask, Hammer, Fish 
} from 'lucide-react';

const HakkimizdaPage = () => {
  const yetkililer = [
    {
      isim: 'rdex',
      yetki: 'Yönetici',
      gorev: 'Teknik Yönetim',
      avatar: 'byrdex_',
      renk: 'from-red-500 to-orange-500'
    },
    {
      isim: 'Nesh',
      yetki: 'Yönetici',
      gorev: 'Teknik Geliştirme',
      avatar: 'NeshxD_',
      renk: 'from-red-500 to-orange-500'
    },
    {
      isim: 'qwzoen',
      yetki: 'Moderatör',
      gorev: 'Forum & Destek Yönetimi',
      avatar: 'qwzoen',
      renk: 'from-purple-500 to-pink-500'
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
      icon: MessageCircle,
      baslik: 'Destek Sistemi',
      aciklama: '7/24 aktif destek ekibi ve ticket sistemi.',
      renk: 'text-cyan-500'
    },
    {
      icon: PackagePlus,
      baslik: 'Sipariş Sistemi',
      aciklama: 'İhtiyacın olan eşyaları kolayca sipariş verebileceğin sistem.',
      renk: 'text-emerald-400'
    },
    {
      icon: Swords,
      baslik: 'Epik Bosslar',
      aciklama: 'Alışılmışın dışında, zorlu ve benzersiz boss savaşları.',
      renk: 'text-red-600'
    },
    {
      icon: Bot,
      baslik: 'Minyonlar',
      aciklama: 'Senin yerine çalışan ve kaynak toplayan sadık yardımcılar.',
      renk: 'text-amber-500'
    },
    {
      icon: Dices,
      baslik: 'Şanslı Tüccar',
      aciklama: 'Para karşılığı çark çevirerek özel büyüler ve zırh süslemeleri kazan.',
      renk: 'text-fuchsia-500'
    },
    {
      icon: Sparkles,
      baslik: 'Özel Büyüler',
      aciklama: 'Oyunun orijinalinde bulunmayan sıradışı ve güçlü büyüler.',
      renk: 'text-violet-400'
    },
    {
      icon: Flame,
      baslik: 'Sıradışı Etkinlikler',
      aciklama: 'Nether, End ve Balıkçılık gibi düzenli ve heyecanlı etkinlikler.',
      renk: 'text-orange-400'
    },
    {
      icon: Landmark,
      baslik: 'Banka Sistemi',
      aciklama: 'Faiz kazanabileceğin ve hesap seviyeni yükseltebileceğin bankacılık.',
      renk: 'text-emerald-500'
    },
    {
      icon: FlaskConical,
      baslik: 'Cadı Sistemi',
      aciklama: 'Tecrübe puanlarını şişeleme ve paralarını çek defterine dönüştürme.',
      renk: 'text-purple-400'
    },
    {
      icon: Hexagon,
      baslik: 'Arıcılık Sistemi',
      aciklama: 'Özel panel üzerinden kolayca yönetilebilir, toplanabilir arıcılık.',
      renk: 'text-yellow-400'
    },
    {
      icon: VenetianMask,
      baslik: 'Karaborsa',
      aciklama: 'Belirli zamanlarda gelen sınırlı stoklarla nadir eşyalar satan tüccar.',
      renk: 'text-zinc-400'
    },
    {
      icon: Hammer,
      baslik: 'Demirci Sistemi',
      aciklama: 'Kitap, para ve tecrübe puanı ile eşyalarını bir üst seviyeye yükselt.',
      renk: 'text-stone-400'
    },
    {
      icon: Fish,
      baslik: 'Gelişmiş Balıkçılık',
      aciklama: 'Farklı nadirlik, tür ve uzunluklarda balıklar tutabileceğin gelişmiş sistem.',
      renk: 'text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="about-page">
      <div className='hakkimizda-mc'></div>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="minecraft-font text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-6">
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
            <h2 className="minecraft-font text-3xl font-bold uppercase text-[#FDD500] mb-4">Misyonumuz</h2>
            <p className="text-zinc-300 leading-relaxed">
              Türk Minecraft topluluğuna en iyi oyun deneyimini sunmak, adil ve eğlenceli bir ortam oluşturmak.
              Her oyuncunun kendini özel hissettiği, güvenli ve aktif bir topluluk yaratmak temel hedefimizdir.
            </p>
          </div>
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300">
            <h2 className="minecraft-font text-3xl font-bold uppercase text-[#FDD500] mb-4">Vizyonumuz</h2>
            <p className="text-zinc-300 leading-relaxed">
              Türkiye'nin en büyük ve en kaliteli Minecraft sunucusu olmak. Sürekli yenilikler ve güncellemeler ile
              oyuncularımıza her zaman en iyi içeriği sunmak ve lider konumumuzu korumak.
            </p>
          </div>
        </div>

        {/* Yetkili Kadro */}
        <div className="mb-20">
          <h2 className="minecraft-font text-4xl md:text-5xl font-black uppercase text-white mb-12 text-center">
            Yetkili Kadromuz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {yetkililer.map((yetkili, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-6 text-center hover:border-[#FDD500]/50 hover:shadow-[0_0_30px_rgba(255,213,0,0.2)] transition-all duration-300 group"
                data-testid="staff-card"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={`https://mc-heads.net/avatar/${yetkili.avatar}`}
                    alt={yetkili.isim}
                    className="w-24 h-24 rounded-xl mx-auto group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${yetkili.renk} px-4 py-1 rounded-full`}>
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
          <h2 className="minecraft-font text-4xl md:text-5xl font-black uppercase text-white mb-12 text-center">
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
        <div className="bg-gradient-to-r from-[#FDD500]/15 to-transparent border border-[#FDD500]/30 rounded-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-black text-[#FDD500] mb-2">4+</p>
              <p className="text-zinc-400 uppercase tracking-wider text-sm">Yıl Tecrübe</p>
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
