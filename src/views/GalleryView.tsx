import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { Camera, MessageSquare, Star, Send, Plus, User } from 'lucide-react';

export default function GalleryView() {
  const {
    settings,
    language,
    activities,
    reviews,
    addReview,
    activityGallery,
    userName
  } = useApp();

  const [activeTab, setActiveTab] = useState<'photos' | 'reviews'>('photos');

  // Review Form state
  const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id || '');
  const [authorNameInput, setAuthorNameInput] = useState(userName || '');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract all images
  const defaultGalleryImages = activities.map(a => ({
    id: 'act-' + a.id,
    image_url: a.cover_image_url,
    activity_name: language === 'en' ? a.name_en : language === 'zh' ? a.name_zh : a.name_id
  }));

  const customGalleryImages = activityGallery.map(g => {
    const act = activities.find(a => a.id === g.activity_id);
    return {
      id: g.id,
      image_url: g.image_url,
      activity_name: act ? (language === 'en' ? act.name_en : language === 'zh' ? act.name_zh : act.name_id) : 'Bali'
    };
  });

  const allGalleryItems = [...customGalleryImages, ...defaultGalleryImages];

  // Combine some real mock reviews if list is empty
  const defaultReviews = [
    { id: 'rev-1', author_name: 'Budi Santoso', rating: 5, comment: 'Sangat direkomendasikan! Pelayanan Bali Top Tour terbaik dan harganya sangat terjangkau.', created_at: '2026-06-20' },
    { id: 'rev-2', author_name: 'John Doe', rating: 5, comment: 'Lempuyang was breathtaking. Professional guides and flawless itinerary transfers.', created_at: '2026-06-19' },
    { id: 'rev-3', author_name: 'Mei Ling', rating: 5, comment: '巴厘岛之旅非常棒！导游讲解很周到，行程安排舒适，极力推荐。', created_at: '2026-06-18' }
  ];

  const displayReviews = [...reviews, ...defaultReviews];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const author = authorNameInput.trim() || userName || 'Guest';
    addReview(selectedActivityId, author, ratingInput, commentInput.trim());
    
    setCommentInput('');
    setSuccessMsg('Ulasan Anda telah dikirim! Terima kasih.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const primaryBg = { backgroundColor: settings.theme_color };
  const primaryText = { color: settings.theme_color };
  const primaryBorder = { borderColor: settings.theme_color };

  return (
    <div className="flex-1 pb-24 overflow-y-auto px-5 pt-6 bg-slate-50/50">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-950 font-bold text-xl tracking-tight">
          {translate('nav_gallery', language)}
        </h2>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          {translate('gallery_subtitle', language)}
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'photos'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera size={14} className={activeTab === 'photos' ? 'text-indigo-600' : ''} />
          {translate('gallery_tab_photo', language)}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'reviews'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare size={14} className={activeTab === 'reviews' ? 'text-indigo-600' : ''} />
          {translate('gallery_tab_reviews', language)}
        </button>
      </div>

      {/* TAB CONTEXTS */}
      {activeTab === 'photos' ? (
        <div className="grid grid-cols-2 gap-3.5 pb-6">
          {allGalleryItems.map((item, idx) => (
            <div
              key={item.id + idx}
              className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 p-1.5 flex flex-col hover:shadow-md transition-all group"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative">
                <img
                  src={item.image_url}
                  alt={item.activity_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <p className="text-[10px] font-bold tracking-tight text-slate-700 mt-2.5 ml-1 truncate">
                {item.activity_name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5 pb-6">
          {/* Write a Review Form Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-slate-950 font-bold text-sm mb-1.5 flex items-center gap-1.5">
              <Plus size={16} style={primaryText} />
              {translate('review_write_prompt', language)}
            </h3>
            
            {successMsg && (
              <div className="mb-4 text-emerald-700 bg-emerald-50 text-xs font-bold py-2 px-3 rounded-xl border border-emerald-100 text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              {/* Activity Selection */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  {language === 'id' ? 'Pilih Aktivitas' : 'Select Activity'}
                </label>
                <select
                  value={selectedActivityId}
                  onChange={e => setSelectedActivityId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 py-3 px-3.5 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>
                      {language === 'en' ? a.name_en : language === 'zh' ? a.name_zh : a.name_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author & Stars Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Nama / Nickname
                  </label>
                  <input
                    type="text"
                    value={authorNameInput}
                    onChange={e => setAuthorNameInput(e.target.value)}
                    placeholder="Nama Anda..."
                    className="w-full bg-slate-50 border border-slate-200 py-3 px-3.5 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Rating (Bintang)
                  </label>
                  <div className="flex gap-1 items-center h-10 select-none">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-0.5 focus:outline-none focus:scale-110 active:scale-90 transition-all"
                      >
                        <Star
                          size={18}
                          fill={star <= ratingInput ? '#F59E0B' : 'transparent'}
                          className={star <= ratingInput ? 'text-amber-500' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Tulis Pengalaman Anda
                </label>
                <textarea
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder={translate('review_placeholder_2', language)}
                  className="w-full bg-slate-50 border border-slate-200 py-3 px-3.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white h-20 resize-none focus:border-indigo-500"
                  maxLength={500}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full text-white font-bold py-3 rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 shadow-md mt-1"
                style={primaryBg}
              >
                <Send size={13} />
                {translate('review_submit', language)}
              </button>
            </form>
          </div>

          {/* List of Reviews */}
          <div className="flex flex-col gap-3.5">
            {displayReviews.map((rev, idx) => (
              <div
                key={rev.id + idx}
                className="bg-white rounded-3xl border border-slate-100 p-4.5 shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <User size={15} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">
                        {rev.author_name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Baru saja'}
                      </p>
                    </div>
                  </div>
                  
                  {/* stars display */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i < rev.rating ? '#F59E0B' : 'transparent'}
                        className={i < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed font-semibold">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
