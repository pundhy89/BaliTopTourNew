import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { Search, MapPin, Star, Calendar, ChevronRight, Globe, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeView({ navigate }: { navigate: (to: string | number) => void }) {
  const {
    settings,
    language,
    setLanguage,
    tourPackages,
    activities,
    userName,
    setUserName,
    hasSeenGreeting,
    setHasSeenGreeting,
    homeBanners,
    trackAction
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'paket' | 'activity'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Name modal state
  const [nameInput, setNameInput] = useState('');
  const [showNameModal, setShowNameModal] = useState(!userName && !hasSeenGreeting);

  // Dynamic banner carousels
  const fallbackBanners = [
    'https://mgoutxmbncyoeeisosrx.supabase.co/storage/v1/object/public/cgve9jbd8q9t_tour_images/uploads/5mzzlk1i3wa-1782030112560.jpg',
    'https://mgoutxmbncyoeeisosrx.supabase.co/storage/v1/object/public/cgve9jbd8q9t_tour_images/uploads/ybz5l9gk1nr-1782030121689.jpg'
  ];

  const bannersToUse = homeBanners.length > 0 
    ? homeBanners.map(b => b.image_url)
    : (settings.home_background_urls?.length > 0 ? settings.home_background_urls : fallbackBanners);

  useEffect(() => {
    if (bannersToUse.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannersToUse.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannersToUse]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setHasSeenGreeting(true);
      setShowNameModal(false);
      trackAction('greeting_name_set', `User set name: ${nameInput.trim()}`);
    } else {
      setUserName('Guest');
      setHasSeenGreeting(true);
      setShowNameModal(false);
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

  const getTagline = () => {
    if (language === 'en') return settings.tagline_en || settings.tagline_id;
    if (language === 'zh') return settings.tagline_zh || settings.tagline_id;
    return settings.tagline_id;
  };

  const getSubtitle = () => {
    if (language === 'en') return settings.subtitle_en || settings.subtitle_id;
    if (language === 'zh') return settings.subtitle_zh || settings.subtitle_id;
    return settings.subtitle_id;
  };

  // Filter items
  const filteredPackages = tourPackages.filter(p => {
    if (!p.is_active) return false;
    const searchLower = searchQuery.toLowerCase();
    return getEntityName(p).toLowerCase().includes(searchLower) || getEntityDesc(p).toLowerCase().includes(searchLower);
  });

  const filteredActivities = activities
    .filter(a => {
      if (!a.is_active) return false;
      const searchLower = searchQuery.toLowerCase();
      return getEntityName(a).toLowerCase().includes(searchLower) || getEntityDesc(a).toLowerCase().includes(searchLower) || (a.location_name && a.location_name.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Theme color styling helpers
  const primaryBg = { backgroundColor: settings.theme_color };
  const primaryText = { color: settings.theme_color };
  const primaryBorder = { borderColor: settings.theme_color };

  return (
    <div className="flex-1 pb-24 overflow-y-auto">
      {/* Banner Section with Carousel */}
      <div className="relative h-[290px] overflow-hidden">
        {bannersToUse.map((bannerUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={bannerUrl}
              alt="Bali Tour Background"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/80" />
          </div>
        ))}

        {/* Company Header Info & Language Selector inside Banner */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
          <div>
            <p className="text-white/90 text-sm font-semibold flex items-center gap-1">
              Hi, {userName || 'Pp'}! <span className="animate-bounce">👋</span>
            </p>
            <h2 className="text-white text-2xl font-bold tracking-tight mt-1 flex items-center gap-1.5 drop-shadow-md">
              <MapPin size={18} className="text-white fill-white/10" />
              Bali, Indonesia
            </h2>
          </div>

          {/* Lang Selector Pill styled exactly like reference image */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-full p-1 flex items-center gap-0.5 shadow-md">
            <button
              onClick={() => {
                setLanguage('en');
                trackAction('lang_changed_en', 'Language changed to English');
              }}
              className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm scale-100'
                  : 'text-white hover:text-white/95'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLanguage('id');
                trackAction('lang_changed_id', 'Language changed to Indonesian');
              }}
              className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                language === 'id'
                  ? 'bg-white text-slate-900 shadow-sm scale-100'
                  : 'text-white hover:text-white/95'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => {
                setLanguage('zh');
                trackAction('lang_changed_zh', 'Language changed to Chinese');
              }}
              className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                language === 'zh'
                  ? 'bg-white text-slate-900 shadow-sm scale-100'
                  : 'text-white hover:text-white/95'
              }`}
            >
              中
            </button>
          </div>
        </div>

        {/* Carousel pagination dots in the lower middle of the banner */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-1.5 z-10 w-full">
          {bannersToUse.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full bg-white transition-all duration-300 ${
                idx === currentBannerIndex 
                  ? 'w-5 bg-white' 
                  : 'w-1.5 bg-white/45'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modern Overlapping Floating White Card matching image details */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-[28px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-slate-100 p-5">
          {/* Inner Search Box */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-1 flex items-center hover:border-indigo-200 hover:bg-white transition-all group">
            <Search size={18} className="text-slate-400 ml-3 group-hover:text-indigo-500 transition-colors" />
            <input
              type="text"
              className="flex-1 bg-transparent py-2.5 px-3 outline-none text-slate-800 text-xs font-bold leading-none placeholder-slate-400"
              placeholder="Search destination or activity..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1 mr-1"
              >
                Clear
              </button>
            ) : (
              <div 
                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl m-0.5 flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors"
                onClick={() => navigate('/search')}
              >
                <Globe size={15} />
              </div>
            )}
          </div>

          {/* Location Badge & Destination Count subline */}
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold px-1">
            <div className="bg-indigo-50 text-indigo-600 text-[10px] px-3.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
              <MapPin size={11} className="fill-indigo-500/10" />
              Bali, Indonesia
            </div>
            <span className="text-slate-300 font-bold">•</span>
            <span className="text-slate-500 text-[10px] font-bold tracking-wide uppercase">
              {tourPackages.filter(p => p.is_active).length + activities.filter(a => a.is_active).length} Destinations & Activities
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Category Navigation */}
      <div className="px-5 mt-6 flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 px-1 rounded-2xl text-xs font-bold text-center border transition-all active:scale-95 ${
            activeTab === 'all'
              ? 'text-white border-transparent'
              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
          style={activeTab === 'all' ? primaryBg : {}}
        >
          {translate('home_filter_all', language)}
        </button>
        <button
          onClick={() => setActiveTab('paket')}
          className={`flex-1 py-3 px-1 rounded-2xl text-xs font-bold text-center border transition-all active:scale-95 ${
            activeTab === 'paket'
              ? 'text-white border-transparent'
              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
          style={activeTab === 'paket' ? primaryBg : {}}
        >
          {translate('home_filter_package', language)}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 px-1 rounded-2xl text-xs font-bold text-center border transition-all active:scale-95 ${
            activeTab === 'activity'
              ? 'text-white border-transparent'
              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
          style={activeTab === 'activity' ? primaryBg : {}}
        >
          {translate('home_filter_activity', language)}
        </button>
      </div>

      {/* RENDER TOUR PACKAGES SECTION */}
      {(activeTab === 'all' || activeTab === 'paket') && (
        <div className="mt-8 px-5">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-slate-900 font-bold text-base tracking-tight">
              {translate('home_filter_package', language)}
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {filteredPackages.length} {language === 'id' ? 'Tersedia' : 'Available'}
            </span>
          </div>

          {filteredPackages.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
              <p className="text-slate-400 text-sm font-semibold">{translate('search_no_result', language)}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {(activeTab === 'all' ? filteredPackages.slice(0, 4) : filteredPackages).map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => navigate(`/package/${pkg.id}`)}
                    className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all active:scale-[0.98] text-left"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={pkg.cover_image_url}
                        alt={getEntityName(pkg)}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md py-1 px-2.5 rounded-full text-white text-[9px] font-bold shadow-sm">
                        {pkg.duration_hours} Hrs
                      </div>
                    </div>
                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs tracking-tight line-clamp-2 min-h-[32px]">
                          {getEntityName(pkg)}
                        </h4>
                        <p className="text-slate-400 text-[10px] line-clamp-1 mt-1 font-semibold">
                          {getEntityDesc(pkg)}
                        </p>
                      </div>
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-col justify-end">
                        <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">
                          {translate('home_starting_from', language)}
                        </span>
                        <span 
                          style={{ color: settings.theme_color }} 
                          className="font-bold text-xs mt-0.5"
                        >
                          Rp {pkg.price_idr.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {activeTab === 'all' && filteredPackages.length > 4 && (
                <div className="mt-5 text-center">
                  <button
                    onClick={() => setActiveTab('paket')}
                    style={{ borderColor: settings.theme_color, color: settings.theme_color }}
                    className="inline-flex items-center gap-1.5 px-6 py-3 border hover:bg-slate-50/50 font-bold text-xs tracking-wider uppercase rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer bg-white"
                  >
                    {language === 'id' ? 'Lihat Selengkapnya' : 'View More Tour Packages'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* RENDER ACTIVITIES SECTION */}
      {(activeTab === 'all' || activeTab === 'activity') && (
        <div className="mt-8 px-5">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-slate-900 font-bold text-base tracking-tight">
              {translate('home_filter_activity', language)}
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {filteredActivities.length} {language === 'id' ? 'Tersedia' : 'Available'}
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
              <p className="text-slate-400 text-sm font-semibold">{translate('search_no_result', language)}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3.5">
                {(activeTab === 'all' ? filteredActivities.slice(0, 4) : filteredActivities).map(act => (
                  <button
                    key={act.id}
                    onClick={() => navigate(`/activity/${act.id}`)}
                    className="flex bg-white rounded-3xl overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-slate-100 p-2.5 gap-4 hover:shadow-md transition-all active:scale-[0.99] text-left"
                  >
                    <div className="w-[100px] h-[100px] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={act.cover_image_url}
                        alt={getEntityName(act)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">
                            {getEntityName(act)}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0 bg-amber-50 rounded-full px-2 py-0.5">
                            <Star size={11} fill="#F59E0B" className="text-amber-500" />
                            <span className="text-amber-700 text-[10px] font-bold">
                              {act.rating || '5.0'}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-[10px] font-semibold line-clamp-2 mt-1">
                          {getEntityDesc(act)}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1 text-slate-400">
                           <MapPin size={11} className="text-slate-400" />
                          <span className="text-slate-500 text-[10px] font-bold truncate max-w-[120px]">
                            {act.location_name || 'Bali'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block line-clamp-1">
                            {translate('home_starting_from', language)}
                          </span>
                          <span 
                            style={{ color: settings.theme_color }} 
                            className="font-bold text-[13px]"
                          >
                            Rp {act.price_per_person_idr?.toLocaleString('id-ID') || '100.000'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {activeTab === 'all' && filteredActivities.length > 4 && (
                <div className="mt-5 text-center">
                  <button
                    onClick={() => setActiveTab('activity')}
                    style={{ borderColor: settings.theme_color, color: settings.theme_color }}
                    className="inline-flex items-center gap-1.5 px-6 py-3 border hover:bg-slate-50/50 font-bold text-xs tracking-wider uppercase rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer bg-white"
                  >
                    {language === 'id' ? 'Lihat Selengkapnya' : 'View More Activities'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Simple Name Greeting Modal overlay */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl p-6 max-w-[380px] w-full text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-3xl mb-4 shadow-sm border border-slate-100">
              👋
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-2 tracking-tight">
              Selamat datang di Bali!
            </h3>
            <p className="text-slate-500 text-xs mb-6 px-1 font-medium leading-relaxed">
              Silahkan masukkan nama panggilan Anda agar bisa menikmati fitur pemesanan dan riwayat dengan nyaman.
            </p>
            <form onSubmit={handleNameSubmit} className="w-full flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" style={{ color: settings.theme_color }} />
                </div>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Nama Anda..."
                  className="w-full border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 outline-none font-bold text-slate-800 text-sm focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all shadow-sm"
                  maxLength={40}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-bold py-3.5 rounded-2xl text-xs tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-md uppercase"
                style={primaryBg}
              >
                MULAI MENJELAJAHI
              </button>
            </form>
            <div className="mt-5 flex items-start gap-1.5 px-2">
              <div className="mt-0.5">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.77778 5.33333V4C7.77778 2.52724 6.53387 1.33333 5 1.33333C3.46613 1.33333 2.22222 2.52724 2.22222 4V5.33333H1.66667C1.05315 5.33333 0.555557 5.83093 0.555557 6.44444V10.8889C0.555557 11.5024 1.05315 12 1.66667 12H8.33333C8.94685 12 9.44444 11.5024 9.44444 10.8889V6.44444C9.44444 5.83093 8.94685 5.33333 8.33333 5.33333H7.77778ZM3.33333 5.33333V4C3.33333 3.07953 4.07953 2.44444 5 2.44444C5.92047 2.44444 6.66667 3.07953 6.66667 4V5.33333H3.33333Z" fill={settings.theme_color}/>
                </svg>
              </div>
              <p className="text-[9px] text-slate-500 text-left leading-relaxed font-semibold">
                Nama Anda hanya digunakan untuk personalisasi pengalaman dan tidak akan dibagikan kepada pihak lain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
