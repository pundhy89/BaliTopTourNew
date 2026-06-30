import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { ChevronLeft, Calendar, Clock, MapPin, Phone, CheckCircle, Navigation } from 'lucide-react';

export default function PackageDetailView({ id, navigate }: { id: string; navigate: (to: string | number) => void }) {
  const {
    settings,
    language,
    tourPackages,
    tourPackageOptions,
    tourPoints,
    trackAction
  } = useApp();

  // Find the selected package
  const pkg = tourPackages.find(p => p.id === id);

  if (!pkg) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <p className="text-slate-500 font-bold mb-4">{translate('error_load_failed', language)}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all"
        >
          {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Get options for this package
  const options = tourPackageOptions
    .filter(o => o.package_id === pkg.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const [activeOptId, setActiveOptId] = useState<string>(options[0]?.id || 'default');

  // Find points for the active option
  const activePoints = tourPoints
    .filter(pt => pt.package_id === pkg.id && pt.option_id === activeOptId)
    .sort((a, b) => a.sequence_order - b.sequence_order);

  const getEntityName = (item: any) => {
    if (language === 'en') return item.name_en || item.name_id || item.name;
    if (language === 'zh') return item.name_zh || item.name_id || item.name;
    return item.name_id || item.name;
  };

  const getEntityDesc = (item: any) => {
    if (language === 'en') return item.description_en || item.description_id || item.description;
    if (language === 'zh') return item.description_zh || item.description_id || item.description;
    return item.description_id || item.description;
  };

  const handleBooking = () => {
    const selectedOptionName = options.find(o => o.id === activeOptId)?.name || '';
    const num = settings.whatsapp_number || '6282143415254';
    
    const baseMsg = translate('wa_message', language);
    const tourName = getEntityName(pkg);
    const optionStr = selectedOptionName ? ` - ${selectedOptionName}` : '';
    const priceStr = `Rp ${pkg.price_idr.toLocaleString('id-ID')}`;
    
    const textMsg = `${baseMsg}${tourName}${optionStr}. ${translate('wa_price', language)}: ${priceStr}`;
    
    // Save to Visitor booking logs
    trackAction('book_now', `Clicked book now for package: ${tourName} (${selectedOptionName})`);

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  const primaryBg = { backgroundColor: settings.theme_color };
  const primaryText = { color: settings.theme_color };
  const primaryBorder = { borderColor: settings.theme_color };

  return (
    <div className="flex-1 pb-28 overflow-y-auto bg-slate-50 relative">
      {/* Cover picture with back action button */}
      <div className="relative h-[280px] bg-slate-200">
        <img
          src={pkg.cover_image_url}
          alt={getEntityName(pkg)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 text-white rounded-2xl shadow-lg transition-all active:scale-95 hover:brightness-110 z-10 flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px]"
          style={primaryBg}
          title="Back"
        >
          <ChevronLeft size={20} className="stroke-[3px]" />
        </button>

        {/* Duration Stamp overlay bottom */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10 text-left">
          <div className="max-w-[70%]">
            <span className="text-[10px] text-teal-300 font-bold uppercase bg-emerald-950/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
              Bali Tour
            </span>
            <h2 className="text-white text-lg font-bold tracking-tight mt-2 line-clamp-2">
              {getEntityName(pkg)}
            </h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md text-white py-1.5 px-3.5 rounded-2xl border border-white/20 font-bold text-[10px] flex items-center gap-1">
            <Clock size={11} className="text-teal-300" />
            {pkg.duration_hours} Hrs
          </div>
        </div>
      </div>

      {/* Description & Detail */}
      <div className="p-5">
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6">
          <h3 className="text-slate-900 font-bold text-sm mb-2.5 uppercase tracking-wide">
            {translate('package_description_title', language)}
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed font-semibold">
            {getEntityDesc(pkg)}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-amber-600 font-extrabold uppercase">
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">INFO</span>
            <span>{translate('price_excludes_ticket', language)}</span>
          </div>
        </div>

        {/* Package options Tab switches */}
        {options.length > 0 && (
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wide">
              {translate('activity_package_options', language)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {options.map(opt => {
                const isSelected = opt.id === activeOptId;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setActiveOptId(opt.id)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                      isSelected
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                    style={isSelected ? primaryBg : {}}
                  >
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline representation of Tour points */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-slate-900 font-bold text-sm mb-5 uppercase tracking-wide">
            {translate('stopping_points', language)} ({activePoints.length})
          </h3>

          {activePoints.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-400 text-xs font-semibold">
                {translate('no_route_points', language)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activePoints.map((pt, idx) => {
                const isLast = idx === activePoints.length - 1;
                return (
                  <div key={pt.id} className="flex gap-4">
                    {/* timeline line / marker indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={primaryBg}
                      >
                        {idx + 1}
                      </div>
                      {!isLast && (
                        <div className="w-[2px] h-16 bg-slate-100 border-dashed border-l-2 border-slate-200" />
                      )}
                    </div>

                    {/* Timeline card row */}
                    <div className="flex-1 pb-6 min-w-0">
                      <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100/50">
                        {pt.cover_image_url && (
                          <img
                            src={pt.cover_image_url}
                            alt={getEntityName(pt)}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                          />
                        )}
                        <div className="flex-grow min-w-0">
                          <h4 className="text-slate-800 font-bold text-xs">
                            {getEntityName(pt)}
                          </h4>
                          {getEntityDesc(pt) && (
                            <p className="text-slate-600 text-[10px] font-semibold mt-0.5 leading-normal">
                              {getEntityDesc(pt)}
                            </p>
                          )}
                          <p className="text-slate-400 text-[9px] font-bold mt-0.5">
                            {pt.duration_minutes > 0 ? `${pt.duration_minutes} ${translate('minutes_label', language)}` : ''} {pt.location_address || translate('tourist_attraction', language)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Price Book Bottom Overlay bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] px-5 py-4 flex justify-between items-center z-50 rounded-t-3xl">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block leading-tight">
            {translate('package_rate', language)} IDR
          </span>
          <span className="font-bold text-[15px] mt-0.5 block" style={primaryText}>
            Rp {pkg.price_idr.toLocaleString('id-ID')}
          </span>
          <span className="text-[8px] text-slate-400 font-bold block">
            {language === 'zh' ? (pkg.price_type_zh || pkg.price_type) : language === 'en' ? (pkg.price_type_en || pkg.price_type) : (pkg.price_type || '/ orang')}
          </span>
          <span className="text-[7.5px] text-rose-500 font-extrabold block uppercase mt-0.5">
            * {translate('price_excludes_ticket', language)}
          </span>
        </div>

        <button
          onClick={handleBooking}
          className="text-white font-bold text-xs uppercase tracking-wider h-12 shadow-md rounded-2xl flex items-center justify-center gap-2 px-6 active:scale-95 transition-all text-center hover:brightness-95"
          style={primaryBg}
        >
          <Phone size={14} fill="currentColor" />
          {translate('activity_book_now', language)}
        </button>
      </div>
    </div>
  );
}
