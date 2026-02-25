import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Users, Package, Newspaper, Trash2, Edit, Plus, AlertCircle, Palette, X } from 'lucide-react';

const AdminPage = () => {
  const { API } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [news, setNews] = useState([]);
  const [reports, setReports] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create forms
  const [showNewItem, setShowNewItem] = useState(false);
  const [showNewNews, setShowNewNews] = useState(false);
  const [showNewTheme, setShowNewTheme] = useState(false);
  const [newItem, setNewItem] = useState({ isim: '', aciklama: '', fiyat: 0, kategori: "VIP'ler", stok: 100, gorsel: '', indirim: 0 });
  const [newNews, setNewNews] = useState({ baslik: '', icerik: '' });
  const [newTheme, setNewTheme] = useState({ isim: '', gorsel_url: '', fiyat: 0 });

  // Edit modals
  const [editItem, setEditItem] = useState(null);
  const [editNews, setEditNews] = useState(null);
  const [editTheme, setEditTheme] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'market') fetchMarketItems();
    if (activeTab === 'news') fetchNews();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'themes') fetchThemes();
  }, [activeTab]);

  const fetchUsers = async () => { setLoading(true); try { const r = await axios.get(`${API}/admin/kullanicilar`, { headers }); setUsers(r.data); } catch(e) {} finally { setLoading(false); } };
  const fetchMarketItems = async () => { setLoading(true); try { const r = await axios.get(`${API}/market/urunler`); setMarketItems(r.data); } catch(e) {} finally { setLoading(false); } };
  const fetchNews = async () => { setLoading(true); try { const r = await axios.get(`${API}/haberler?limit=50`); setNews(r.data); } catch(e) {} finally { setLoading(false); } };
  const fetchReports = async () => { setLoading(true); try { const r = await axios.get(`${API}/admin/reports`, { headers }); setReports(r.data); } catch(e) {} finally { setLoading(false); } };
  const fetchThemes = async () => { setLoading(true); try { const r = await axios.get(`${API}/themes`); setThemes(r.data); } catch(e) {} finally { setLoading(false); } };

  // User actions
  const handleUpdateUser = async (userId, field, value) => {
    try {
      await axios.put(`${API}/admin/kullanici/${userId}?${field}=${encodeURIComponent(value)}`, {}, { headers });
      alert('Kullanıcı güncellendi');
      fetchUsers();
    } catch(e) { alert('Güncelleme başarısız'); }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`${API}/admin/kullanici/${userId}`, { headers }); fetchUsers(); } catch(e) { alert('Silme başarısız'); }
  };

  // Market actions
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/admin/market/urun`, newItem, { headers }); setShowNewItem(false); setNewItem({ isim: '', aciklama: '', fiyat: 0, kategori: "VIP'ler", stok: 100, gorsel: '', indirim: 0 }); fetchMarketItems(); } catch(e) { alert('Ürün oluşturulamadı'); }
  };
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/market/urun/${editItem.id}`, {
        isim: editItem.isim, aciklama: editItem.aciklama, fiyat: editItem.fiyat,
        kategori: editItem.kategori, stok: editItem.stok, gorsel: editItem.gorsel, indirim: editItem.indirim
      }, { headers });
      setEditItem(null); fetchMarketItems();
    } catch(e) { alert('Güncelleme başarısız'); }
  };
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`${API}/admin/market/urun/${id}`, { headers }); fetchMarketItems(); } catch(e) { alert('Silme başarısız'); }
  };

  // News actions
  const handleCreateNews = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/admin/haber`, newNews, { headers }); setShowNewNews(false); setNewNews({ baslik: '', icerik: '' }); fetchNews(); } catch(e) { alert('Haber oluşturulamadı'); }
  };
  const handleUpdateNews = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/haber/${editNews.id}`, { baslik: editNews.baslik, icerik: editNews.icerik }, { headers });
      setEditNews(null); fetchNews();
    } catch(e) { alert('Güncelleme başarısız'); }
  };
  const handleDeleteNews = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`${API}/admin/haber/${id}`, { headers }); fetchNews(); } catch(e) { alert('Silme başarısız'); }
  };

  // Report actions
  const handleDeleteReport = async (id) => {
    if (!window.confirm('Bu raporu silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`${API}/admin/reports/${id}`, { headers }); fetchReports(); } catch(e) { alert('Silme başarısız'); }
  };

  // Theme actions
  const handleCreateTheme = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/admin/themes`, newTheme, { headers }); setShowNewTheme(false); setNewTheme({ isim: '', gorsel_url: '', fiyat: 0 }); fetchThemes(); } catch(e) { alert('Tema oluşturulamadı'); }
  };
  const handleUpdateTheme = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/themes/${editTheme.id}`, { isim: editTheme.isim, gorsel_url: editTheme.gorsel_url, fiyat: editTheme.fiyat }, { headers });
      setEditTheme(null); fetchThemes();
    } catch(e) { alert('Güncelleme başarısız'); }
  };
  const handleDeleteTheme = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try { await axios.delete(`${API}/admin/themes/${id}`, { headers }); fetchThemes(); } catch(e) { alert('Silme başarısız'); }
  };

  const tabs = [
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'market', label: 'Market', icon: Package },
    { id: 'news', label: 'Haberler', icon: Newspaper },
    { id: 'reports', label: 'Raporlar', icon: AlertCircle },
    { id: 'themes', label: 'Temalar', icon: Palette }
  ];

  const inputCls = "w-full bg-[#2A2A2A] border border-zinc-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#FDD500] focus:ring-1 focus:ring-[#FDD500] transition-all";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-testid="admin-page">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-4">Admin Panel</h1>
          <p className="text-lg text-zinc-400">Sistemi yönet ve içerikleri düzenle</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-all ${activeTab === tab.id ? 'bg-[#FDD500] text-black btn-3d' : 'bg-[#1E1E1E] border border-zinc-800 text-zinc-400 hover:border-[#FDD500]/50'}`} data-testid={`admin-tab-${tab.id}`}>
                <Icon size={18} /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? <div className="text-center text-zinc-400">Yükleniyor...</div> : (
          <>
            {/* ===== USERS TAB ===== */}
            {activeTab === 'users' && (
              <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden" data-testid="users-section">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-zinc-400 text-sm uppercase tracking-wider">Kullanıcı</th>
                      <th className="text-left p-4 text-zinc-400 text-sm uppercase tracking-wider">Email</th>
                      <th className="text-left p-4 text-zinc-400 text-sm uppercase tracking-wider">Kredi</th>
                      <th className="text-left p-4 text-zinc-400 text-sm uppercase tracking-wider">Yetki</th>
                      <th className="text-left p-4 text-zinc-400 text-sm uppercase tracking-wider">Rol</th>
                      <th className="text-right p-4 text-zinc-400 text-sm uppercase tracking-wider">İşlemler</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-zinc-800 hover:bg-[#2A2A2A] transition-colors">
                          <td className="p-4"><div className="flex items-center space-x-3"><img src={`https://cravatar.eu/helmavatar/${u.kullanici_adi}/32`} alt={u.kullanici_adi} className="w-8 h-8 rounded" /><span className="text-white font-medium">{u.kullanici_adi}</span></div></td>
                          <td className="p-4 text-zinc-400">{u.email}</td>
                          <td className="p-4"><span className="text-[#FDD500] font-bold">{u.kredi.toFixed(0)} Kredi</span></td>
                          <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-zinc-800 text-zinc-300">{u.yetki || 'Oyuncu'}</span></td>
                          <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.rol === 'admin' ? 'bg-[#FDD500]/10 text-[#FDD500]' : 'bg-zinc-800 text-zinc-400'}`}>{u.rol}</span></td>
                          <td className="p-4 text-right">
                            <button onClick={() => { const c = prompt('Düzenle:\n1. Kredi\n2. Yetki\n3. Yetki Görseli URL'); if(c==='1'){const v=prompt('Yeni kredi:',u.kredi);if(v!==null)handleUpdateUser(u.id,'kredi',parseFloat(v));}else if(c==='2'){const v=prompt('Yeni yetki (Oyuncu/VIP/Moderatör/Yönetici):',u.yetki);if(v)handleUpdateUser(u.id,'yetki',v);}else if(c==='3'){const v=prompt('Yetki görseli URL:',u.yetki_gorseli||'');if(v!==null)handleUpdateUser(u.id,'yetki_gorseli',v);}}} className="text-[#FDD500] hover:text-[#E6C200] mr-3" data-testid={`edit-user-${u.kullanici_adi}`}><Edit size={18} /></button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-400" data-testid={`delete-user-${u.kullanici_adi}`}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== MARKET TAB ===== */}
            {activeTab === 'market' && (
              <div data-testid="market-section">
                <div className="mb-6">
                  <button onClick={() => setShowNewItem(!showNewItem)} className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d flex items-center space-x-2" data-testid="new-item-button"><Plus size={20} /><span>Yeni Ürün Ekle</span></button>
                </div>
                {showNewItem && <ItemForm item={newItem} setItem={setNewItem} onSubmit={handleCreateItem} onCancel={() => setShowNewItem(false)} inputCls={inputCls} title="Yeni Ürün Ekle" />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {marketItems.map((item) => (
                    <div key={item.id} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
                      {item.gorsel && <div className="aspect-video bg-[#2A2A2A] overflow-hidden"><img src={item.gorsel} alt={item.isim} className="w-full h-full object-cover" /></div>}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div><h3 className="text-lg font-bold text-white mb-1">{item.isim}</h3><p className="text-xs text-zinc-500">{item.kategori}</p></div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => setEditItem({...item})} className="text-[#FDD500] hover:text-[#E6C200]" data-testid={`edit-item-${item.id}`}><Edit size={16} /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400" data-testid={`delete-item-${item.id}`}><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{item.aciklama}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {item.indirim > 0 && <><span className="text-xs text-red-500 font-bold">%{item.indirim} İNDİRİM</span><span className="text-sm text-zinc-500 line-through">{item.fiyat} Kredi</span></>}
                            <span className="text-[#FDD500] font-bold">{(item.indirim > 0 ? item.fiyat * (1 - item.indirim / 100) : item.fiyat).toFixed(2)} Kredi</span>
                          </div>
                          <span className="text-xs text-zinc-500">Stok: {item.stok}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== NEWS TAB ===== */}
            {activeTab === 'news' && (
              <div data-testid="news-admin-section">
                <div className="mb-6">
                  <button onClick={() => setShowNewNews(!showNewNews)} className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d flex items-center space-x-2" data-testid="new-news-button"><Plus size={20} /><span>Yeni Haber Ekle</span></button>
                </div>
                {showNewNews && (
                  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 mb-6" data-testid="new-news-form">
                    <h3 className="text-xl font-bold text-white mb-4">Yeni Haber Ekle</h3>
                    <form onSubmit={handleCreateNews} className="space-y-4">
                      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label><input type="text" required className={inputCls} value={newNews.baslik} onChange={(e) => setNewNews({...newNews, baslik: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-zinc-400 mb-2">İçerik</label><textarea required rows={6} className={inputCls} value={newNews.icerik} onChange={(e) => setNewNews({...newNews, icerik: e.target.value})} /></div>
                      <div className="flex space-x-4">
                        <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Oluştur</button>
                        <button type="button" onClick={() => setShowNewNews(false)} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
                      </div>
                    </form>
                  </div>
                )}
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{item.baslik}</h3>
                          <p className="text-zinc-400 mb-3 line-clamp-2">{item.icerik}</p>
                          <div className="flex items-center space-x-4 text-xs text-zinc-500">
                            <span>Yazar: {item.yazar_adi}</span>
                            <span>Tarih: {new Date(item.tarih).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button onClick={() => setEditNews({id: item.id, baslik: item.baslik, icerik: item.icerik})} className="text-[#FDD500] hover:text-[#E6C200]" data-testid={`edit-news-${item.id}`}><Edit size={18} /></button>
                          <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:text-red-400" data-testid={`delete-news-${item.id}`}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== REPORTS TAB ===== */}
            {activeTab === 'reports' && (
              <div data-testid="reports-section">
                <h2 className="text-2xl font-bold text-white mb-6">Kullanıcı Raporları</h2>
                {reports.length === 0 ? (
                  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 text-center"><AlertCircle className="mx-auto text-zinc-600 mb-4" size={48} /><p className="text-zinc-400">Henüz rapor yok</p></div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((r) => (
                      <div key={r.id} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-bold text-white">{r.baslik}</h3>
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#FDD500]/10 text-[#FDD500]">{r.konu}</span>
                            </div>
                            <p className="text-xs text-zinc-500">Gönderen: {r.yazar_adi} - {new Date(r.tarih).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <button onClick={() => handleDeleteReport(r.id)} className="text-red-500 hover:text-red-400" data-testid={`delete-report-${r.id}`}><Trash2 size={18} /></button>
                        </div>
                        <p className="text-zinc-400 text-sm">{r.aciklama}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== THEMES TAB ===== */}
            {activeTab === 'themes' && (
              <div data-testid="themes-admin-section">
                <div className="mb-6">
                  <button onClick={() => setShowNewTheme(!showNewTheme)} className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d flex items-center space-x-2" data-testid="new-theme-button"><Plus size={20} /><span>Yeni Tema Ekle</span></button>
                </div>
                {showNewTheme && <ThemeForm theme={newTheme} setTheme={setNewTheme} onSubmit={handleCreateTheme} onCancel={() => setShowNewTheme(false)} inputCls={inputCls} title="Yeni Tema Ekle" />}
                {themes.length === 0 ? (
                  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 text-center"><Palette className="mx-auto text-zinc-600 mb-4" size={48} /><p className="text-zinc-400">Henüz tema eklenmemiş</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                      <div key={theme.id} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-cover bg-center bg-[#2A2A2A]" style={{ backgroundImage: `url(${theme.gorsel_url})` }} />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div><h3 className="text-white font-bold">{theme.isim}</h3><p className="text-xs text-[#FDD500] font-bold">{theme.fiyat > 0 ? `${theme.fiyat} Kredi` : 'Ücretsiz'}</p></div>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setEditTheme({...theme})} className="text-[#FDD500] hover:text-[#E6C200]" data-testid={`edit-theme-${theme.id}`}><Edit size={16} /></button>
                              <button onClick={() => handleDeleteTheme(theme.id)} className="text-red-500 hover:text-red-400" data-testid={`delete-theme-${theme.id}`}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== EDIT MARKET ITEM MODAL ===== */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="edit-item-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Ürün Düzenle</h3>
              <button onClick={() => setEditItem(null)} className="text-zinc-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Ürün Adı</label><input type="text" required className={inputCls} value={editItem.isim} onChange={(e) => setEditItem({...editItem, isim: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Fiyat</label><input type="number" required min="0" step="0.01" className={inputCls} value={editItem.fiyat} onChange={(e) => setEditItem({...editItem, fiyat: parseFloat(e.target.value)})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Kategori</label>
                <select className={inputCls} value={editItem.kategori} onChange={(e) => setEditItem({...editItem, kategori: e.target.value})}>
                  <option value="VIP'ler">VIP'ler</option><option value="Spawnerlar">Spawnerlar</option><option value="Özel Eşyalar">Özel Eşyalar</option><option value="Paketler">Paketler</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Stok</label><input type="number" required min="0" className={inputCls} value={editItem.stok} onChange={(e) => setEditItem({...editItem, stok: parseInt(e.target.value)})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">İndirim (%)</label><input type="number" min="0" max="100" className={inputCls} value={editItem.indirim} onChange={(e) => setEditItem({...editItem, indirim: parseInt(e.target.value) || 0})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-zinc-400 mb-2">Açıklama</label><textarea required rows={3} className={inputCls} value={editItem.aciklama} onChange={(e) => setEditItem({...editItem, aciklama: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-zinc-400 mb-2">Görsel URL</label><input type="url" className={inputCls} value={editItem.gorsel || ''} onChange={(e) => setEditItem({...editItem, gorsel: e.target.value})} /></div>
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Kaydet</button>
                <button type="button" onClick={() => setEditItem(null)} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT NEWS MODAL ===== */}
      {editNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="edit-news-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Haber Düzenle</h3>
              <button onClick={() => setEditNews(null)} className="text-zinc-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateNews} className="space-y-4">
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label><input type="text" required className={inputCls} value={editNews.baslik} onChange={(e) => setEditNews({...editNews, baslik: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">İçerik</label><textarea required rows={6} className={inputCls} value={editNews.icerik} onChange={(e) => setEditNews({...editNews, icerik: e.target.value})} /></div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Kaydet</button>
                <button type="button" onClick={() => setEditNews(null)} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT THEME MODAL ===== */}
      {editTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-testid="edit-theme-modal">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Tema Düzenle</h3>
              <button onClick={() => setEditTheme(null)} className="text-zinc-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateTheme} className="space-y-4">
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Tema Adı</label><input type="text" required className={inputCls} value={editTheme.isim} onChange={(e) => setEditTheme({...editTheme, isim: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Görsel URL</label><input type="url" required className={inputCls} value={editTheme.gorsel_url} onChange={(e) => setEditTheme({...editTheme, gorsel_url: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-2">Fiyat (Kredi)</label><input type="number" min="0" className={inputCls} value={editTheme.fiyat} onChange={(e) => setEditTheme({...editTheme, fiyat: parseFloat(e.target.value) || 0})} /></div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Kaydet</button>
                <button type="button" onClick={() => setEditTheme(null)} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Market Item Form
const ItemForm = ({ item, setItem, onSubmit, onCancel, inputCls, title }) => (
  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Ürün Adı</label><input type="text" required className={inputCls} value={item.isim} onChange={(e) => setItem({...item, isim: e.target.value})} /></div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Fiyat</label><input type="number" required min="0" step="0.01" className={inputCls} value={item.fiyat} onChange={(e) => setItem({...item, fiyat: parseFloat(e.target.value)})} /></div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Kategori</label>
        <select className={inputCls} value={item.kategori} onChange={(e) => setItem({...item, kategori: e.target.value})}>
          <option value="VIP'ler">VIP'ler</option><option value="Spawnerlar">Spawnerlar</option><option value="Özel Eşyalar">Özel Eşyalar</option><option value="Paketler">Paketler</option>
        </select>
      </div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Stok</label><input type="number" required min="0" className={inputCls} value={item.stok} onChange={(e) => setItem({...item, stok: parseInt(e.target.value)})} /></div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">İndirim (%)</label><input type="number" min="0" max="100" className={inputCls} value={item.indirim} onChange={(e) => setItem({...item, indirim: parseInt(e.target.value) || 0})} /></div>
      <div className="md:col-span-2"><label className="block text-sm font-medium text-zinc-400 mb-2">Açıklama</label><textarea required rows={3} className={inputCls} value={item.aciklama} onChange={(e) => setItem({...item, aciklama: e.target.value})} /></div>
      <div className="md:col-span-2"><label className="block text-sm font-medium text-zinc-400 mb-2">Görsel URL (Opsiyonel)</label><input type="url" className={inputCls} value={item.gorsel} onChange={(e) => setItem({...item, gorsel: e.target.value})} placeholder="https://example.com/image.png" /><p className="text-xs text-zinc-500 mt-1">Önerilen boyut: 300x300 piksel</p></div>
      <div className="md:col-span-2 flex space-x-4">
        <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Oluştur</button>
        <button type="button" onClick={onCancel} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
      </div>
    </form>
  </div>
);

// Reusable Theme Form
const ThemeForm = ({ theme, setTheme, onSubmit, onCancel, inputCls, title }) => (
  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Tema Adı</label><input type="text" required className={inputCls} value={theme.isim} onChange={(e) => setTheme({...theme, isim: e.target.value})} data-testid="theme-name-input" /></div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Görsel URL</label><input type="url" required className={inputCls} value={theme.gorsel_url} onChange={(e) => setTheme({...theme, gorsel_url: e.target.value})} placeholder="https://example.com/theme.jpg" data-testid="theme-url-input" /></div>
      <div><label className="block text-sm font-medium text-zinc-400 mb-2">Fiyat (Kredi, 0 = ücretsiz)</label><input type="number" min="0" className={inputCls} value={theme.fiyat} onChange={(e) => setTheme({...theme, fiyat: parseFloat(e.target.value) || 0})} data-testid="theme-price-input" /></div>
      <div className="flex space-x-4">
        <button type="submit" className="bg-[#FDD500] text-black font-bold uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E6C200] transition-all btn-3d">Oluştur</button>
        <button type="button" onClick={onCancel} className="bg-transparent border-2 border-zinc-700 text-zinc-400 font-bold uppercase px-6 py-3 rounded-lg hover:border-zinc-600 transition-all">İptal</button>
      </div>
    </form>
  </div>
);

export default AdminPage;
