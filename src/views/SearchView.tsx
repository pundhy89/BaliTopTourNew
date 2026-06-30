import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { Search, MapPin, Star, Sparkles, Clock, Trash2 } from 'lucide-react';

export default function SearchView({ navigate }: { navigate: (to: string | number) => void }) {
  const { settings, language, tourPackages, activities } = useApp();
  
  // Load last query term safely
  const [query, setQuery] = useState('');

  // Load complete search history array from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('bali_search_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (newHistory: string[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem('bali_search_history', JSON.stringify(newHistory));
  };

  const addToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const filtered = searchHistory.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
    const nextHistory = [trimmed, ...filtered].slice(0, 8); // Hold up to 8 queries
    saveHistory(nextHistory);
  };

  const deleteHistoryItem = (termToDelete: string) => {
    const updated = searchHistory.filter(h => h !== termToDelete);
    saveHistory(updated);
  };

  const clearAllHistory = () => {
    saveHistory([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query.trim());
    }
  };

  const getEntityName = (item: any) => {
    if (language === 'en') return item.name_en || item.name_id;
    if (language === 'zh') return item.name_zh || item.name_id;
    return item.name_id;
  };

  const getEntityDesc = (item: any) => {
    if (language === 'en') return item.description_en || item.description_id;
    if (language === 'zh') return item.description_zh || item.description_id;
    return item.description_id;
  };

  const results = [
    ...tourPackages.map(p => ({ ...p, type: 'paket' })),
    ...activities.map(a => ({ ...a, type: 'activity' }))
  ].filter(item => {
    if (!item.is_active) return false;
    const s = query.trim().toLowerCase();
    if (!s) return false; // Exclude unless search query has been typed
    const name = getEntityName(item).toLowerCase();
    const desc = getEntityDesc(item).toLowerCase();
    const loc = (item.location_name || '').toLowerCase();
    return name.includes(s) || desc.includes(s) || loc.includes(s);
  });

  const handleItemClick = (item: any, isPaket: boolean) => {
    if (query.trim()) {
      addToHistory(query.trim());
    }
    navigate(isPaket ? `/package/${item.id}` : `/activity/${item.id}`);
  };

  const pColor = { color: settings.theme_color };
  const pBg = { backgroundColor: settings.theme_color };

  return (
    <div className="flex-1 pb-24 overflow-y-auto px-5 pt-6 bg-slate-50/50">
      {/* Header Title */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-slate-950 font-bold text-xl tracking-tight">
            {translate('search_title', language)}
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            {language === 'id' ? 'Temukan tempat impianmu di Bali' : 'Find your dream places in Bali'}
          </p>
        </div>
        <Sparkles size={18} style={pColor} className="opacity-80" />
      </div>

      {/* Interactive Search Input inside a form wrapper */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center">
          <Search size={18} className="text-slate-400 ml-3" />
          <input
            type="text"
            className="flex-1 bg-transparent py-2.5 px-3 outline-none text-slate-800 text-sm font-semibold"
            placeholder={translate('search_placeholder', language)}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1 mr-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-xs font-black uppercase text-white rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            style={pBg}
          >
            {language === 'id' ? 'Cari' : 'Search'}
          </button>
        </div>
      </form>

      {/* Conditionally display only the search history (empty query state) OR filtered list */}
      {!query.trim() ? (
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              {language === 'id' ? 'Riwayat Pencarian' : 'Search History'}
            </h3>
            {searchHistory.length > 0 && (
              <button
                type="button"
                onClick={clearAllHistory}
                className="text-red-500 hover:text-red-600 font-bold text-[10px] transition-colors flex items-center gap-1 active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                <Trash2 size={12} />
                {language === 'id' ? 'Hapus Semua' : 'Clear All'}
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <div className="bg-white rounded-[28px] p-10 text-center border border-slate-100 shadow-sm">
              <div className="text-3xl mb-3">🕒</div>
              <h4 className="text-slate-800 font-bold text-xs mb-1">
                {language === 'id' ? 'Belum Ada Riwayat' : 'No Search History'}
              </h4>
              <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
                {language === 'id' 
                  ? 'Temukan pencarian Anda sebelumnya atau mulai mengetik untuk menyimpan pencarian baru.'
                  : 'Start searching to save your previous query terms here for fast retrieval.'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
              {searchHistory.map((historyItem, idx) => (
                <div 
                  key={idx}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 group transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(historyItem);
                      addToHistory(historyItem); // slide to top
                    }}
                    className="flex-1 text-left flex items-center gap-3 text-slate-700 font-bold text-xs cursor-pointer active:scale-[0.99]"
                  >
                    <Clock size={13} className="text-slate-400 shrink-0" />
                    <span>{historyItem}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteHistoryItem(historyItem)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title={language === 'id' ? 'Hapus' : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Results Count & Cards */}
          <div className="mb-4">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
              {language === 'id' ? 'Hasil Pencarian' : 'Search Results'} ({results.length})
            </p>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-sm mt-4">
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="text-slate-800 font-bold text-sm mb-1">
                {translate('search_no_result', language)}
              </h4>
              <p className="text-slate-400 text-xs font-semibold">
                {translate('search_try_different', language)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map(item => {
                const isPaket = item.type === 'paket';
                const price = isPaket ? item.price_idr : item.price_per_person_idr;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item, isPaket)}
                    className="flex bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-2.5 gap-4 hover:shadow-md transition-all active:scale-[0.99] text-left cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      <img
                        src={item.cover_image_url}
                        alt={getEntityName(item)}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded-md text-white text-[8px] font-bold uppercase tracking-wider">
                        {isPaket ? (language === 'id' ? 'Paket' : 'Tour') : (language === 'id' ? 'Aktivitas' : 'Activity')}
                      </div>
                    </div>

                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">
                          {getEntityName(item)}
                        </h4>
                        <p className="text-slate-400 text-[10px] line-clamp-2 mt-1 font-semibold leading-relaxed">
                          {getEntityDesc(item)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                          {isPaket ? (
                            <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {item.duration_hours} Hours
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-100">
                              <Star size={10} fill="#F59E0B" className="text-amber-500" />
                              <span className="text-amber-700 text-[9px] font-bold">
                                {item.rating || '5.0'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block">
                            {translate('starting_from_label', language)}
                          </span>
                          <span 
                            style={{ color: settings.theme_color }} 
                            className="font-bold text-xs"
                          >
                            Rp {price?.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
