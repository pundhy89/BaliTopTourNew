import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { ChevronLeft, Star, MapPin, Phone, Users, Clock, Plus, Send, User } from 'lucide-react';

export default function ActivityDetailView({ id, navigate }: { id: string; navigate: (to: string | number) => void }) {
  const {
    settings,
    language,
    activities,
    activityPackages,
    activityPackagePrices,
    reviews,
    addReview,
    userName,
    trackAction
  } = useApp();

  const activity = activities.find(a => a.id === id);

  if (!activity) {
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

  // Find packages for this activity
  const packages = activityPackages
    .filter(ap => ap.activity_id === activity.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const [activePackId, setActivePackId] = useState<string>(packages[0]?.id || 'default');

  // Find prices for the active package
  const activePrices = activityPackagePrices
    .filter(app => app.activity_package_id === activePackId)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Selected price option index
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);

  // Form write specialized review
  const [authorInput, setAuthorInput] = useState(userName || '');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  // Filter reviews for this active activity
  const activityReviews = reviews.filter(rev => rev.activity_id === activity.id);

  const handleBooking = () => {
    const activePkg = packages.find(p => p.id === activePackId);
    const selectedPkgName = activePkg ? getEntityName(activePkg) : '';
    const selectedPrice = activePrices[selectedPriceIdx];
    const num = settings.whatsapp_number || '6282143415254';

    const baseMsg = translate('wa_message', language);
    const actName = getEntityName(activity);
    const pkgStr = selectedPkgName ? ` - ${selectedPkgName}` : '';
    const labelStr = selectedPrice ? ` (${selectedPrice.label})` : '';
    const priceStr = selectedPrice ? `Rp ${selectedPrice.price_idr.toLocaleString('id-ID')}` : `Rp ${activity.price_per_person_idr?.toLocaleString('id-ID')}`;

    const textMsg = `${baseMsg}${actName}${pkgStr}${labelStr}. ${translate('wa_price', language)}: ${priceStr}`;

    // Log tracking
    trackAction('book_now', `Booked activity: ${actName} - ${selectedPkgName} (${selectedPrice?.label || ''})`);

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const authorStr = authorInput.trim() || userName || 'Guest';
    addReview(activity.id, authorStr, ratingInput, commentInput.trim());
    
    setCommentInput('');
    setFormSuccess(
      language === 'zh'
        ? '感谢您的评价！'
        : language === 'en'
        ? 'Thank you for your review!'
        : 'Terima kasih atas ulasan Anda!'
    );
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const primaryBg = { backgroundColor: settings.theme_color };
  const primaryText = { color: settings.theme_color };
  const primaryBorder = { borderColor: settings.theme_color };

  return (
    <div className="flex-1 pb-28 overflow-y-auto bg-slate-50 relative">
      {/* Cover Pic */}
      <div className="relative h-[280px] bg-slate-200">
        <img
          src={activity.cover_image_url}
          alt={getEntityName(activity)}
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

        {/* Location rating stamps */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10 text-left">
          <div className="max-w-[70%]">
            <span className="text-[10px] text-teal-300 font-bold uppercase bg-emerald-950/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
              {activity.location_name || 'Bali'}
            </span>
            <h2 className="text-white text-lg font-bold tracking-tight mt-2 line-clamp-2">
              {getEntityName(activity)}
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-2xl py-1.5 px-3.5 border border-white/20 font-bold text-[10px] text-white shadow-md">
            <Star size={11} fill="#F59E0B" className="text-amber-400" />
            <span>{activity.rating || '5.0'}</span>
          </div>
        </div>
      </div>

      {/* Info context */}
      <div className="p-5">
        {/* Description body */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6">
          <p className="text-slate-600 text-xs leading-relaxed font-semibold">
            {getEntityDesc(activity)}
          </p>
        </div>

        {/* Package Tabs list */}
        {packages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wide">
              {translate('activity_package_options', language)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {packages.map(p => {
                const isSelected = p.id === activePackId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePackId(p.id);
                      setSelectedPriceIdx(0);
                    }}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                      isSelected
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                    style={isSelected ? primaryBg : {}}
                  >
                    {getEntityName(p)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Package Option details & choice pricing list */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6">
          {(() => {
            const activePkg = packages.find(p => p.id === activePackId);
            if (!activePkg) return null;
            const desc = getEntityDesc(activePkg);
            return (
              <div className="mb-4 pb-3 border-b border-slate-100/70">
                <h4 className="text-slate-800 font-extrabold text-xs">
                  {getEntityName(activePkg)}
                </h4>
                {desc && (
                  <p className="text-slate-500 text-[10px] font-semibold mt-1 leading-normal">
                    {desc}
                  </p>
                )}
              </div>
            );
          })()}

          <h3 className="text-slate-900 font-bold text-sm mb-3 uppercase tracking-wide">
            {translate('pricing_option_details', language)}
          </h3>

          {activePrices.length === 0 ? (
            <div className="text-center py-4 bg-slate-50 rounded-2xl">
              <p className="text-slate-400 text-xs font-semibold">{translate('activity_no_packages', language)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activePrices.map((pr, idx) => {
                const isSelected = selectedPriceIdx === idx;
                return (
                  <button
                    key={pr.id}
                    onClick={() => setSelectedPriceIdx(idx)}
                    className={`w-full p-4 rounded-2xl text-left border flex justify-between items-center transition-all ${
                      isSelected
                        ? 'border-indigo-100 bg-indigo-50/40'
                        : 'border-slate-50 bg-slate-50/40 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-transparent text-white' : 'border-slate-300'
                        }`}
                        style={isSelected ? primaryBg : {}}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-slate-800 text-xs font-bold">
                        {language === 'zh' ? (pr.label_zh || pr.label) : language === 'en' ? (pr.label_en || pr.label) : (pr.label_id || pr.label)}
                      </span>
                    </div>

                    <span className="font-bold text-xs" style={primaryText}>
                      Rp {pr.price_idr.toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews segment specific to this activity */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wide">
              {translate('gallery_tab_reviews', language)} ({activityReviews.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {language === 'zh' ? '游客评论' : language === 'en' ? 'Visitor Reviews' : 'Ulasan Pengunjung'}
            </span>
          </div>

          <div className="flex flex-col gap-3.5 mb-5">
            {activityReviews.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold py-2">
                {language === 'zh' ? '此活动暂无评论。' : language === 'en' ? 'No reviews for this activity yet.' : 'Belum ada ulasan untuk aktivitas ini.'}
              </p>
            ) : (
              activityReviews.map((rev, i) => (
                <div key={rev.id + i} className="border-b border-slate-100/60 pb-3 last:border-none">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                        <User size={12} className="text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px] truncate">{rev.author_name}</h4>
                        <p className="text-[8px] text-slate-400 font-bold">
                          {language === 'zh' ? '游客评论' : language === 'en' ? 'Visitor Review' : 'Ulasan Pengunjung'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, stIdx) => (
                        <Star
                          key={stIdx}
                          size={9}
                          fill={stIdx < rev.rating ? '#F59E0B' : 'transparent'}
                          className={stIdx < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold mt-2 pl-1 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Form directly on page to submit review */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-slate-800 font-bold text-xs mb-3.5">
              {language === 'zh' ? '撰写活动评价' : language === 'en' ? 'Write an Activity Review' : 'Tulis Ulasan Aktivitas'}
            </h4>

            {formSuccess && (
              <div className="mb-4 text-emerald-800 bg-emerald-50 text-[11px] font-bold py-2 px-3 border border-emerald-100 rounded-xl text-center">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={language === 'zh' ? '您的名字...' : language === 'en' ? 'Your name...' : 'Nama panggil...'}
                  value={authorInput}
                  onChange={e => setAuthorInput(e.target.value)}
                  className="bg-slate-50 border border-slate-200 outline-none text-xs font-bold text-slate-800 rounded-2xl py-2.5 px-3.5 focus:bg-white focus:border-indigo-500"
                />
                <div className="flex items-center gap-1 h-9 select-none">
                  {[1,2,3,4,5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRatingInput(st)}
                      className="p-0.5"
                    >
                      <Star
                        size={15}
                        fill={st <= ratingInput ? '#F59E0B' : 'transparent'}
                        className={st <= ratingInput ? 'text-amber-500' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={translate('review_placeholder_2', language)}
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-2xl py-2.5 px-3.5 focus:bg-white focus:border-indigo-500"
                  maxLength={400}
                  required
                />
                <button
                  type="submit"
                  className="p-3 text-white rounded-2xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 shadow-md shrink-0"
                  style={primaryBg}
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Price Book Bottom Overlay bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] px-5 py-4 flex justify-between items-center z-40 rounded-t-3xl">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block leading-tight">
            {translate('selected_price', language)} IDR
          </span>
          <span className="font-bold text-[15px] mt-0.5 block" style={primaryText}>
            Rp {(activePrices[selectedPriceIdx]?.price_idr || activity.price_per_person_idr)?.toLocaleString('id-ID')}
          </span>
          <span className="text-[8px] text-slate-400 font-bold block">
            {(() => {
              const pr = activePrices[selectedPriceIdx];
              if (pr) {
                if (language === 'zh') return pr.label_zh || pr.label;
                if (language === 'en') return pr.label_en || pr.label;
                return pr.label_id || pr.label;
              }
              return activity.price_mode === 'per_person'
                ? (language === 'zh' ? '每人' : language === 'en' ? 'Per person' : 'Per orang')
                : (language === 'zh' ? '每票' : language === 'en' ? 'Per ticket' : 'Per tiket');
            })()}
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
