import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translate } from '../data/translations';
import { 
  Users, Layers, Settings as SetIcon, Database, Save, Trash2, Edit, Plus, Check, Loader2, ArrowLeft, Image, KeyRound, Download, Upload, Eye,
  Compass, PhoneCall, Radio, ShoppingBag, Activity as ActivityIcon, Palette, CheckCircle, MapPin, CloudLightning, Map
} from 'lucide-react';
import { TourPackage, Activity } from '../types';
import { BOKEH_THEMES } from '../data/bokehThemes';
import mapBg from '../assets/images/bali_tourist_map_1782285564594.jpg';

// Shared Helper Component for URL or File Uploads
function ImageUploadOrUrl({
  value,
  onChange,
  label,
  placeholder = "https://...",
  id = "image-input"
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  id?: string;
}) {
  const [mode, setMode] = useState<'url' | 'upload'>(value?.startsWith('data:') ? 'upload' : 'url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = new window.Image();
          img.src = reader.result;
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const max_size = 480; // max width or height for optimized performance and storage size
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > max_size) {
                  height *= max_size / width;
                  width = max_size;
                }
              } else {
                if (height > max_size) {
                  width *= max_size / height;
                  height = max_size;
                }
              }

              canvas.width = width || 100;
              canvas.height = height || 100;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.55 quality to keep size extremely small (around 12KB-18KB)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.55);
                onChange(compressedBase64);
              } else {
                onChange(reader.result as string);
              }
            } catch (err) {
              console.warn('Canvas compression failed, falling back to raw base64:', err);
              onChange(reader.result as string);
            }
          };
          img.onerror = () => {
            onChange(reader.result as string);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isBase64 = value ? value.startsWith('data:') : false;

  return (
    <div className="flex flex-col gap-2 bg-slate-50 border border-slate-150 p-3 rounded-2xl">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        
        {/* Toggle Mode Buttons */}
        <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200 text-[9px] font-bold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              mode === 'url' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              mode === 'upload' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
            }`}
          >
            Foto
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          value={isBase64 ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3 focus:border-indigo-500 transition-colors"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-3 bg-white cursor-pointer transition-all ${
              isBase64 
                ? 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/20' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center gap-1">
              {isBase64 ? (
                <>
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-700">Gambar berhasil diunggah</span>
                  <span className="text-[8px] text-emerald-500 font-bold">Ketuk untuk mengganti berkas</span>
                </>
              ) : (
                <>
                  <Upload size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">Pilih berkas gambar</span>
                  <span className="text-[8px] text-slate-400">PNG, JPG, JPEG (Max 5MB)</span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* Thumbnail preview if value exists */}
      {value && (
        <div className="flex items-start gap-2 bg-white/50 border border-slate-100 p-1.5 rounded-xl mt-1">
          <img
            src={value}
            alt="Preview"
            className="w-10 h-10 object-cover rounded-lg border border-slate-150 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-tight block">Pratinjau Gambar</span>
            <span className="text-[9px] text-slate-600 font-medium truncate block">
              {isBase64 ? "Gambar Diunggah (Base64)" : value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-all"
            title="Hapus gambar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminView({ navigate }: { navigate: (to: string | number) => void }) {
  const {
    settings,
    language,
    updateSettings,
    tourPackages,
    addTourPackage,
    updateTourPackage,
    deleteTourPackage,
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    visitorLogs,
    activityGallery,
    addGalleryImage,
    deleteGalleryImage,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    homeBanners,
    addHomeBanner,
    deleteHomeBanner,
    tourPackageOptions,
    addTourPackageOption,
    updateTourPackageOption,
    deleteTourPackageOption,
    tourPoints,
    addTourPoint,
    updateTourPoint,
    deleteTourPoint,
    activityPackages,
    addActivityPackage,
    updateActivityPackage,
    deleteActivityPackage,
    activityPackagePrices,
    addActivityPackagePrice,
    updateActivityPackagePrice,
    deleteActivityPackagePrice,
    restoreDatabase
  } = useApp();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab selections
  const [activeTab, setActiveTab] = useState<'stats' | 'packages' | 'activities' | 'gallery' | 'settings' | 'backup' | 'theme' | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Collapsible visitor logs
  const [showVisitorLogs, setShowVisitorLogs] = useState(false);

  // Form states - Packages
  const [editingPkg, setEditingPkg] = useState<TourPackage | null>(null);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgPrice, setPkgPrice] = useState(100000);
  const [pkgDuration, setPkgDuration] = useState(12);
  const [pkgCoverUrl, setPkgCoverUrl] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgNameZh, setPkgNameZh] = useState('');
  const [pkgDescEn, setPkgDescEn] = useState('');
  const [pkgDescZh, setPkgDescZh] = useState('');
  const [pkgPriceType, setPkgPriceType] = useState('/ orang');
  const [pkgPriceTypeEn, setPkgPriceTypeEn] = useState('/ person');
  const [pkgPriceTypeZh, setPkgPriceTypeZh] = useState('/ 人');

  // Form states - Tour Package Options
  const [optEditId, setOptEditId] = useState('');
  const [optName, setOptName] = useState('');
  const [optDesc, setOptDesc] = useState('');
  const [optAddress, setOptAddress] = useState('');

  // Form states - Tour Stopping Points
  const [ptEditId, setPtEditId] = useState('');
  const [ptName, setPtName] = useState('');
  const [ptDesc, setPtDesc] = useState('');
  const [ptDuration, setPtDuration] = useState(60);
  const [ptCoverUrl, setPtCoverUrl] = useState('');
  const [selectedOptIdForPt, setSelectedOptIdForPt] = useState('');

  // Form states - Activity Packages
  const [apEditId, setApEditId] = useState('');
  const [apName, setApName] = useState('');
  const [apDesc, setApDesc] = useState('');
  const [apDuration, setApDuration] = useState(60);
  const [apPrice, setApPrice] = useState(100000);
  const [apPriceLabel, setApPriceLabel] = useState('/ Pax');
  const [apPriceLabelEn, setApPriceLabelEn] = useState('/ Pax');
  const [apPriceLabelZh, setApPriceLabelZh] = useState('/ Pax');

  // Form states - Activities
  const [editingAct, setEditingAct] = useState<Activity | null>(null);
  const [showActForm, setShowActForm] = useState(false);
  const [actName, setActName] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actPrice, setActPrice] = useState(50000);
  const [actLocation, setActLocation] = useState('Ubud');
  const [actCoverUrl, setActCoverUrl] = useState('');
  const [actNameEn, setActNameEn] = useState('');
  const [actNameZh, setActNameZh] = useState('');
  const [actDescEn, setActDescEn] = useState('');
  const [actDescZh, setActDescZh] = useState('');
  const [actPriceMode, setActPriceMode] = useState('per_person');
  const [actRating, setActRating] = useState(5.0);
  const [actReviewCount, setActReviewCount] = useState(0);
  const [actLat, setActLat] = useState<number>(-8.4095);
  const [actLng, setActLng] = useState<number>(115.1889);
  const [actIsActive, setActIsActive] = useState<boolean>(true);
  const [actSortOrder, setActSortOrder] = useState<number>(0);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Mouse drag states for interactive map pin picker
  const handleMapPointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPin(true);
    updateCoordsFromPointer(e);
  };

  const handleMapPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingPin) {
      updateCoordsFromPointer(e);
    }
  };

  const handleMapPointerUpOrLeave = () => {
    setIsDraggingPin(false);
  };

  const updateCoordsFromPointer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPercent = Math.min(Math.max(0, (x / rect.width) * 100), 100);
    const yPercent = Math.min(Math.max(0, (y / rect.height) * 100), 100);
    
    const minLng = 114.4;
    const maxLng = 115.7;
    const minLat = -8.05;
    const maxLat = -8.90;
    
    const newLng = minLng + (xPercent / 100) * (maxLng - minLng);
    const newLat = minLat + (yPercent / 100) * (maxLat - minLat);
    
    setActLat(newLat);
    setActLng(newLng);
  };

  const parseGmapsInput = (input: string) => {
    const directRegex = /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/;
    const directMatch = input.match(directRegex);
    if (directMatch) {
      return {
        lat: parseFloat(directMatch[1]),
        lng: parseFloat(directMatch[2])
      };
    }

    const urlAtRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const urlAtMatch = input.match(urlAtRegex);
    if (urlAtMatch) {
      return {
        lat: parseFloat(urlAtMatch[1]),
        lng: parseFloat(urlAtMatch[2])
      };
    }

    return null;
  };

  // Form states - Settings
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [themeColor, setThemeColor] = useState(settings.theme_color);
  const [accentColor, setAccentColor] = useState(settings.accent_color);
  const [tagline, setTagline] = useState(settings.tagline_id);
  const [subtitle, setSubtitle] = useState(settings.subtitle_id);
  const [profileLogoUrl, setProfileLogoUrl] = useState(settings.profile_logo_url || '');
  const [profileSpeechText, setProfileSpeechText] = useState(settings.profile_speech_text_id || '');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Form states - Gallery & Banners
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState(settings.map_image_url || '');
  const [mapSettingsSuccess, setMapSettingsSuccess] = useState('');

  React.useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || '');
      setLogoUrl(settings.logo_url || '');
      setWhatsappNumber(settings.whatsapp_number || '');
      setThemeColor(settings.theme_color || '#4F359B');
      setAccentColor(settings.accent_color || '#00897B');
      setTagline(settings.tagline_id || '');
      setSubtitle(settings.subtitle_id || '');
      setProfileLogoUrl(settings.profile_logo_url || '');
      setProfileSpeechText(settings.profile_speech_text_id || '');
      setMapImageUrl(settings.map_image_url || '');
    }
  }, [settings]);

  // --- STATE FOR TRANSLATION ---
  const [isTranslating, setIsTranslating] = useState(false);

  // Handle Logins
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(usernameInput, passwordInput);
    if (!success) {
      setLoginError('Username atau password admin salah!');
    } else {
      setLoginError('');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="flex-1 pb-24 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-full max-w-[360px] bg-white border border-slate-100 rounded-[32px] p-6 shadow-xl text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound size={24} />
          </div>

          <h3 className="text-slate-950 font-black text-xl mb-1 tracking-tight">
            Login Pengelola
          </h3>
          <p className="text-slate-400 text-xs font-bold mb-6">
            Masukan kredensial admin Bali Top Tour
          </p>

          {loginError && (
            <div className="mb-4 text-red-700 bg-red-50 text-xs font-bold py-2 px-3 border border-red-100 rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div className="text-left">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-bold text-slate-800 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-500"
                required
              />
            </div>

            <div className="text-left">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-bold text-slate-800 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              Masuk
            </button>
          </form>

          <button
            onClick={() => navigate('/profile')}
            className="mt-5 text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={13} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // --- STATE FOR TRANSLATION ---

  const translateTexts = async (texts: string[]): Promise<{ en: string[], zh: string[], id: string[], fallback?: boolean, reason?: string }> => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts })
      });
      if (!res.ok) throw new Error("Translation request failed");
      return await res.json();
    } catch (err) {
      console.error("Translation helper error:", err);
      return { en: texts, zh: texts, id: texts, fallback: true, reason: "network_error" };
    }
  };

  const handleTranslateAllFields = async () => {
    if (activeTab === 'packages' && showPkgForm) {
      if (!pkgName.trim()) {
        alert("Silakan isi Nama Paket terlebih dahulu sebelum melakukan penerjemahan otomatis!");
        return;
      }
      setIsTranslating(true);
      try {
        const trans = await translateTexts([pkgName, pkgDesc.trim() || " "]);
        if (trans.fallback) {
          if (trans.reason === "api_key_missing") {
            alert("Tombol Translate All menggunakan AI (Gemini). Silakan tambahkan GEMINI_API_KEY Anda di menu 'Settings > Secrets' di AI Studio terlebih dahulu!");
          } else {
            alert("Gagal melakukan terjemahan otomatis: " + trans.reason);
          }
        } else {
          setPkgNameEn(trans.en[0] || '');
          setPkgNameZh(trans.zh[0] || '');
          setPkgDescEn(trans.en[1] || '');
          setPkgDescZh(trans.zh[1] || '');
          alert("Penerjemahan otomatis selesai!");
        }
      } catch (err) {
        console.error("Bulk translate error:", err);
      } finally {
        setIsTranslating(false);
      }
    } else if (activeTab === 'activities' && showActForm) {
      if (!actName.trim()) {
        alert("Silakan isi Nama Aktivitas terlebih dahulu sebelum melakukan penerjemahan otomatis!");
        return;
      }
      setIsTranslating(true);
      try {
        const trans = await translateTexts([actName, actDesc.trim() || " "]);
        if (trans.fallback) {
          if (trans.reason === "api_key_missing") {
            alert("Tombol Translate All menggunakan AI (Gemini). Silakan tambahkan GEMINI_API_KEY Anda di menu 'Settings > Secrets' di AI Studio terlebih dahulu!");
          } else {
            alert("Gagal melakukan terjemahan otomatis: " + trans.reason);
          }
        } else {
          setActNameEn(trans.en[0] || '');
          setActNameZh(trans.zh[0] || '');
          setActDescEn(trans.en[1] || '');
          setActDescZh(trans.zh[1] || '');
          alert("Penerjemahan otomatis selesai!");
        }
      } catch (err) {
        console.error("Bulk translate error:", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // --- SAVE HANDLERS CRUD ---

  // Package Save/Edit
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) return;

    let nameEn = pkgNameEn.trim();
    let nameZh = pkgNameZh.trim();
    let descEn = pkgDescEn.trim();
    let descZh = pkgDescZh.trim();
    let pTypeEn = pkgPriceTypeEn.trim();
    let pTypeZh = pkgPriceTypeZh.trim();

    setIsTranslating(true);
    try {
      if (!nameEn || !nameZh || !descEn || !descZh) {
        const trans = await translateTexts([pkgName, pkgDesc]);
        if (!nameEn) nameEn = trans.en[0] || pkgName;
        if (!nameZh) nameZh = trans.zh[0] || pkgName;
        if (!descEn) descEn = trans.en[1] || pkgDesc;
        if (!descZh) descZh = trans.zh[1] || pkgDesc;
      }

      if (pkgPriceType.trim() && (!pTypeEn || !pTypeZh)) {
        const transType = await translateTexts([pkgPriceType]);
        if (!pTypeEn) pTypeEn = transType.en[0] || pkgPriceType;
        if (!pTypeZh) pTypeZh = transType.zh[0] || pkgPriceType;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }

    if (editingPkg) {
      const updated: TourPackage = {
        ...editingPkg,
        name_id: pkgName,
        name_en: nameEn,
        name_zh: nameZh,
        description_id: pkgDesc,
        description_en: descEn,
        description_zh: descZh,
        price_idr: pkgPrice,
        duration_hours: pkgDuration,
        cover_image_url: pkgCoverUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
        price_type: pkgPriceType.trim() || '/ orang',
        price_type_en: pTypeEn.trim() || '/ person',
        price_type_zh: pTypeZh.trim() || '/ 人'
      };
      updateTourPackage(updated);
    } else {
      const added: TourPackage = {
        id: 'pkg-' + Date.now(),
        name_id: pkgName,
        name_en: nameEn,
        name_zh: nameZh,
        description_id: pkgDesc,
        description_en: descEn,
        description_zh: descZh,
        price_idr: pkgPrice,
        duration_hours: pkgDuration,
        cover_image_url: pkgCoverUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
        category: 'paket',
        is_active: true,
        sort_order: tourPackages.length,
        latitude: null,
        longitude: null,
        location_address: null,
        price_type: pkgPriceType.trim() || '/ orang',
        price_type_en: pTypeEn.trim() || '/ person',
        price_type_zh: pTypeZh.trim() || '/ 人',
        min_pax: 1
      };
      addTourPackage(added);
    }

    setEditingPkg(null);
    setShowPkgForm(false);
    setPkgName('');
    setPkgDesc('');
    setPkgPrice(100000);
    setPkgDuration(12);
    setPkgCoverUrl('');
    setPkgNameEn('');
    setPkgNameZh('');
    setPkgDescEn('');
    setPkgDescZh('');
    setPkgPriceType('/ orang');
    setPkgPriceTypeEn('/ person');
    setPkgPriceTypeZh('/ 人');
  };

  // Activity Save/Edit
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName.trim()) return;

    let nameEn = actNameEn.trim();
    let nameZh = actNameZh.trim();
    let descEn = actDescEn.trim();
    let descZh = actDescZh.trim();

    if (!nameEn || !nameZh || !descEn || !descZh) {
      setIsTranslating(true);
      try {
        const trans = await translateTexts([actName, actDesc]);
        if (!nameEn) nameEn = trans.en[0] || actName;
        if (!nameZh) nameZh = trans.zh[0] || actName;
        if (!descEn) descEn = trans.en[1] || actDesc;
        if (!descZh) descZh = trans.zh[1] || actDesc;
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }

    if (editingAct) {
      const updated: Activity = {
        ...editingAct,
        name_id: actName,
        name_en: nameEn,
        name_zh: nameZh,
        description_id: actDesc,
        description_en: descEn,
        description_zh: descZh,
        price_per_person_idr: actPrice,
        price_mode: actPriceMode,
        rating: actRating,
        review_count: actReviewCount,
        location_name: actLocation,
        latitude: actLat,
        longitude: actLng,
        is_active: actIsActive,
        sort_order: actSortOrder,
        cover_image_url: actCoverUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80'
      };
      updateActivity(updated);
    } else {
      const added: Activity = {
        id: 'act-' + Date.now(),
        name_id: actName,
        name_en: nameEn,
        name_zh: nameZh,
        description_id: actDesc,
        description_en: descEn,
        description_zh: descZh,
        price_per_person_idr: actPrice,
        price_mode: actPriceMode,
        rating: actRating,
        review_count: actReviewCount,
        category: 'activity',
        is_active: actIsActive,
        sort_order: actSortOrder,
        location_name: actLocation,
        latitude: actLat,
        longitude: actLng,
        cover_image_url: actCoverUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80'
      };
      addActivity(added);
    }

    setEditingAct(null);
    setShowActForm(false);
    setActName('');
    setActDesc('');
    setActPrice(50000);
    setActLocation('Ubud');
    setActCoverUrl('');
    setActNameEn('');
    setActNameZh('');
    setActDescEn('');
    setActDescZh('');
    setActPriceMode('per_person');
    setActRating(5.0);
    setActReviewCount(0);
    setActLat(-8.4095);
    setActLng(115.1889);
    setActIsActive(true);
    setActSortOrder(0);
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsTranslating(true);
    let trans = {
      en: [tagline, subtitle, profileSpeechText],
      zh: [tagline, subtitle, profileSpeechText],
      id: [tagline, subtitle, profileSpeechText]
    };

    try {
      trans = await translateTexts([tagline, subtitle, profileSpeechText]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }

    const tagId = trans.id[0] || tagline;
    const tagEn = trans.en[0] || tagline;
    const tagZh = trans.zh[0] || tagline;
    const subId = trans.id[1] || subtitle;
    const subEn = trans.en[1] || subtitle;
    const subZh = trans.zh[1] || subtitle;
    const speechId = trans.id[2] || profileSpeechText;
    const speechEn = trans.en[2] || profileSpeechText;
    const speechZh = trans.zh[2] || profileSpeechText;

    updateSettings({
      ...settings,
      company_name: companyName,
      logo_url: logoUrl,
      whatsapp_number: whatsappNumber,
      theme_color: themeColor,
      accent_color: accentColor,
      tagline_id: tagId,
      tagline_en: tagEn,
      tagline_zh: tagZh,
      subtitle_id: subId,
      subtitle_en: subEn,
      subtitle_zh: subZh,
      profile_logo_url: profileLogoUrl,
      profile_speech_text_id: speechId,
      profile_speech_text_en: speechEn,
      profile_speech_text_zh: speechZh,
    });
    setSettingsSuccess('Setelan sistem berhasil diperbarui dengan terjemahan otomatis!');
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // Upload/Restore state Backup
  const handleMigrateLocalToFirestore = async () => {
    setIsMigrating(true);
    try {
      const data: Record<string, string> = {};
      const keys = [
        'bali_tour_settings',
        'bali_tour_packages',
        'bali_tour_package_options',
        'bali_tour_points',
        'bali_tour_activities',
        'bali_tour_activity_packages',
        'bali_tour_activity_package_prices',
        'bali_tour_activity_gallery',
        'bali_tour_reviews',
        'bali_tour_visitor_logs',
        'bali_tour_home_banners',
        'bali_tour_user_name',
        'bali_tour_seen_greeting'
      ];
      
      let foundAny = false;
      keys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
          data[key] = val;
          foundAny = true;
        }
      });
      
      if (!foundAny) {
        alert("Tidak ada data preview lokal yang ditemukan di browser ini untuk dimigrasikan.");
        return;
      }
      
      await restoreDatabase(data);
      alert("Hebat! Semua data preview lokal Anda (termasuk Paket, Aktivitas, Galeri, dan Pengaturan) telah sukses diunggah dan disimpan ke Firebase Firestore secara realtime! Sekarang halaman publish akan menampilkan data yang sama persis.");
    } catch (err) {
      console.error(err);
      alert("Gagal memigrasikan data ke Firestore: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsMigrating(false);
    }
  };

  const handleBackupDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(localStorage, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `balitoptour_db_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const dbData: Record<string, string> = {};
          
          Object.keys(parsed).forEach(key => {
            let targetKey = key;
            if (!key.startsWith('bali_tour_') && key !== 'bali_admin_user') {
              if (['settings', 'packages', 'package_options', 'points', 'activities', 'activity_packages', 'activity_package_prices', 'activity_gallery', 'reviews', 'visitor_logs', 'home_banners', 'lang', 'user_name', 'seen_greeting'].includes(key)) {
                targetKey = `bali_tour_${key}`;
              }
            }
            if (targetKey.startsWith('bali_tour_') || targetKey === 'bali_admin_user') {
              const val = parsed[key];
              const stringValue = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
              dbData[targetKey] = stringValue;
            }
          });
          
          restoreDatabase(dbData);
          alert('Database berhasil dipulihkan secara otomatis dan instan!');
        } catch (err) {
          console.error(err);
          alert('Format cadangan JSON tidak valid!');
        }
      };
    }
  };

  const pColor = { color: settings.theme_color };
  const pBg = { backgroundColor: settings.theme_color };

  // Find active bokeh theme if chosen
  const activeBokeh = BOKEH_THEMES.find(t => t.id === settings.bokeh_theme_id);

  return (
    <div className="flex-1 pb-24 overflow-y-auto bg-slate-50 text-left min-h-screen">
      {/* Top Banner styled like the brand identity with no hard border */}
      <div 
        className="px-5 pt-7 pb-6 text-white flex justify-between items-center rounded-b-[32px] shadow-[0_12px_30px_rgba(0,0,0,0.06)] relative overflow-hidden"
        style={{ 
          background: activeBokeh ? activeBokeh.gradient : `linear-gradient(135deg, ${settings.theme_color} 0%, ${settings.theme_color}ee 100%)`
        }}
      >
        {/* Glowing Bokeh Circles */}
        {activeBokeh && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {activeBokeh.circles.map((c, i) => (
              <div
                key={i}
                className={`absolute rounded-full shrink-0 ${c.style}`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              if (activeTab) {
                setActiveTab(null);
                setEditingPkg(null);
                setEditingAct(null);
                setShowPkgForm(false);
                setShowActForm(false);
              } else {
                navigate('/profile');
              }
            }}
            className="w-8.5 h-8.5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title={activeTab ? "Kembali ke Dashboard" : "Kembali ke Profil"}
          >
            <ArrowLeft size={16} className="text-white stroke-[2.5px]" />
          </button>
          
          <div>
            <span className="text-white/75 font-extrabold text-[9px] uppercase tracking-wider block leading-none">
              Sistem BaliTopTour
            </span>
            <h2 className="font-black text-base tracking-tight mt-1 leading-none">
              {!activeTab ? 'Dashboard Admin' : (
                <>
                  {activeTab === 'packages' && 'Kelola Paket Tour'}
                  {activeTab === 'activities' && 'Kelola Aktivitas'}
                  {activeTab === 'gallery' && 'Banner & Galeri'}
                  {activeTab === 'settings' && 'Konfigurasi Website'}
                  {activeTab === 'theme' && 'Pengaturan Tema'}
                  {activeTab === 'backup' && 'Backup Database'}
                </>
              )}
            </h2>
          </div>
        </div>

        <button
          onClick={async () => {
            if ((activeTab === 'packages' && showPkgForm) || (activeTab === 'activities' && showActForm)) {
              await handleTranslateAllFields();
            } else if (activeTab) {
              setActiveTab(null);
              setEditingPkg(null);
              setEditingAct(null);
              setShowPkgForm(false);
              setShowActForm(false);
            } else {
              logoutAdmin();
            }
          }}
          disabled={isTranslating}
          className="py-1.5 px-4 bg-white/15 hover:bg-white/25 disabled:opacity-55 text-white rounded-full text-[10px] font-black uppercase transition-all relative z-10 active:scale-95 flex items-center gap-1"
        >
          {isTranslating ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              Translating...
            </>
          ) : (
            (activeTab === 'packages' && showPkgForm) || (activeTab === 'activities' && showActForm)
              ? 'Translate All'
              : (activeTab ? 'Kembali' : 'Logout')
          )}
        </button>
      </div>

      {!activeTab && (
        <>
          {/* SECTION 1: LIVE MONITORING & DAFTAR PEMESAN (Top Section) */}
          <div className="px-5 mt-5 flex flex-col gap-4">
        
        {/* Row of stats: Booking Counter */}
        <div>
          {/* Bookings Statistics Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-[24px] p-4 flex flex-col justify-between min-h-[110px] shadow-sm">
            <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
              <ShoppingBag size={14} className="stroke-[2.5px]" />
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-700/80 block leading-none mb-1">
                Total Booking
              </span>
              <h4 className="text-[26px] font-black tracking-tight text-slate-800 leading-none">
                {visitorLogs.filter(log => log.action_type === 'book_now').length}
              </h4>
            </div>

            <p className="text-[10px] font-bold text-indigo-800 flex items-center gap-1 mt-2">
              <PhoneCall size={12} className="stroke-[2.5px]" />
              Pemesanan WhatsApp
            </p>
          </div>
        </div>

        {/* Daftar Pemesan / Bookers list */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm text-left">
          <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2.5">
            <h3 className="text-slate-800 font-black text-[12px] uppercase tracking-wide flex items-center gap-1.5">
              <PhoneCall size={13} className="text-emerald-500 stroke-[2.5px]" />
              Daftar Pemesan (Booking Masuk)
            </h3>
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {visitorLogs.filter(log => log.action_type === 'book_now').length} Booking
            </span>
          </div>

          {visitorLogs.filter(log => log.action_type === 'book_now').length === 0 ? (
            <p className="text-slate-400 text-[10px] font-bold text-center py-5">Belum ada pesanan masuk lewat tombol Booking</p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {visitorLogs.filter(log => log.action_type === 'book_now').map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-2xl border border-slate-100 flex justify-between items-center transition-all">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-black text-slate-800 block">
                      {log.visitor_name}
                    </span>
                    <p className="text-slate-600 text-[9.5px] font-semibold mt-0.5 leading-snug">
                      {log.action_details}
                    </p>
                    <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase font-mono">
                      {new Date(log.created_at).toLocaleDateString('id-ID')} {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  {/* WhatsApp quick route action */}
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(log.visitor_name)}%2C%20saya%20admin%20BaliTopTour%20terkait%20pesanan%20Anda%3A%20${encodeURIComponent(log.action_details)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0 ml-2 cursor-pointer"
                  >
                    <PhoneCall size={12} className="stroke-[2.5px]" fill="currentColor" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Riwayat Pengunjung (Collapsible Trigger) */}
        <div>
          <button
            onClick={() => setShowVisitorLogs(!showVisitorLogs)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 px-4 rounded-2xl text-[10px] uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Users size={14} className="text-slate-500 stroke-[2.5px]" />
              Daftar Riwayat Pengunjung Lengkap
            </span>
            <span className="text-[9px] font-black bg-white/80 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full shadow-sm">
              {showVisitorLogs ? 'Sembunyikan' : 'Tampilkan'}
            </span>
          </button>

          {showVisitorLogs && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mt-3 max-h-[280px] overflow-y-auto text-left">
              <h3 className="text-slate-800 font-extrabold text-[10px] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-slate-50 pb-2.5">
                <span>MUTASI AKTIVITAS SISTEM</span>
                <span className="text-slate-400 text-[9px] font-bold font-mono">{visitorLogs.length} LOGS</span>
              </h3>

              {visitorLogs.length === 0 ? (
                <p className="text-slate-400 text-[10px] font-bold text-center py-6">Belum ada riwayat tercatat</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {visitorLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-800 text-[10px]">
                            {log.visitor_name}
                          </span>
                          <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            log.action_type === 'book_now' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {log.action_type === 'book_now' ? 'Booking' : 'Kunjungan'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[9.5px] font-semibold mt-1 leading-relaxed">
                          {log.action_details}
                        </p>
                        <span className="text-[7.5px] text-slate-400 font-bold block mt-1 uppercase font-mono">
                          Sess: {log.session_id.substring(0, 10)}...
                        </span>
                      </div>
                      <span className="text-[7.5px] text-slate-400 font-black tracking-wide shrink-0 font-mono mt-0.5">
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* SECTION 2: MENU UTAMA DASHBOARD DENGAN IKON (Grid 3 Kolom) */}
      <div className="px-5 mt-6 mb-2">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-3 ml-1 select-none text-left">
          {language === 'zh' ? '服务与系统管理' : language === 'en' ? 'Services & System Management' : 'Layanan & Manajemen Sistem'}
        </span>

        <div className="grid grid-cols-3 gap-3">
          {/* Paket Tour */}
          <button
            onClick={() => setActiveTab('packages')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'packages' 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'packages' ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Layers size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? '游览套餐' : language === 'en' ? 'Tour Packages' : 'Paket Tour'}
            </span>
          </button>

          {/* Kelola Aktivitas */}
          <button
            onClick={() => setActiveTab('activities')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'activities' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'activities' ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Compass size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? '活动' : language === 'en' ? 'Activities' : 'Aktivitas'}
            </span>
          </button>

          {/* Desain Banners */}
          <button
            onClick={() => setActiveTab('gallery')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'gallery' 
                ? 'bg-amber-600 border-amber-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'gallery' ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-600'
            }`}>
              <Image size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? '横幅' : language === 'en' ? 'Banners' : 'Banners'}
            </span>
          </button>

          {/* Setelan Website */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'settings' 
                ? 'bg-sky-600 border-sky-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'settings' ? 'bg-white/10 text-white' : 'bg-sky-50 text-sky-600'
            }`}>
              <SetIcon size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? '配置' : language === 'en' ? 'Configuration' : 'Konfigurasi'}
            </span>
          </button>

          {/* Atur Tema (NEW BOKEH THEME CONFIG) */}
          <button
            onClick={() => setActiveTab('theme')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'theme' 
                ? 'bg-rose-600 border-rose-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'theme' ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              <Palette size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? '主题设置' : language === 'en' ? 'Set Theme' : 'Atur Tema'}
            </span>
          </button>

          {/* Backup & Cadangan */}
          <button
            onClick={() => setActiveTab('backup')}
            className={`p-3.5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              activeTab === 'backup' 
                ? 'bg-violet-600 border-violet-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              activeTab === 'backup' ? 'bg-white/10 text-white' : 'bg-violet-50 text-violet-600'
            }`}>
              <Database size={18} className="stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block leading-none truncate w-full">
              {language === 'zh' ? 'JSON 备份' : language === 'en' ? 'JSON Backup' : 'Backup JSON'}
            </span>
          </button>
        </div>
      </div>
    </>
  )}

      <div className="px-5 mt-4">

        {/* TAB 2: MANAGE PACKAGES (tour_packages) */}
        {activeTab === 'packages' && (
          <div>
            {!showPkgForm ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setEditingPkg(null);
                    setPkgName('');
                    setPkgDesc('');
                    setPkgPrice(650000);
                    setPkgDuration(12);
                    setPkgCoverUrl('');
                    setPkgNameEn('');
                    setPkgNameZh('');
                    setPkgDescEn('');
                    setPkgDescZh('');
                    
                    setOptEditId('');
                    setOptName('');
                    setOptDesc('');
                    setOptAddress('');
                    setPtEditId('');
                    setPtName('');
                    setPtDesc('');
                    setSelectedOptIdForPt('');
                    
                    setShowPkgForm(true);
                  }}
                  className="w-full bg-indigo-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  Tambah Paket Tour
                </button>

                <div className="flex flex-col gap-3.5 mt-2">
                  {tourPackages.map(pkg => (
                    <div key={pkg.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-3 flex gap-3 items-center">
                      <img
                        src={pkg.cover_image_url}
                        alt={pkg.name_id}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate">{pkg.name_id}</h4>
                        <p className="text-slate-400 text-[10px] font-bold">Rp {pkg.price_idr.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPkg(pkg);
                            setPkgName(pkg.name_id);
                            setPkgDesc(pkg.description_id);
                            setPkgPrice(pkg.price_idr);
                            setPkgDuration(pkg.duration_hours);
                            setPkgCoverUrl(pkg.cover_image_url);
                            setPkgNameEn(pkg.name_en || '');
                            setPkgNameZh(pkg.name_zh || '');
                            setPkgDescEn(pkg.description_en || '');
                            setPkgDescZh(pkg.description_zh || '');
                            setPkgPriceType(pkg.price_type || '/ orang');
                            setPkgPriceTypeEn(pkg.price_type_en || '/ person');
                            setPkgPriceTypeZh(pkg.price_type_zh || '/ 人');
                            
                            // Initialize sub-options and stopping points
                            const firstOpt = tourPackageOptions.find(o => o.package_id === pkg.id);
                            setSelectedOptIdForPt(firstOpt ? firstOpt.id : '');
                            setOptEditId('');
                            setOptName('');
                            setOptDesc('');
                            setOptAddress('');
                            setPtEditId('');
                            setPtName('');
                            setPtDesc('');
                            
                            setShowPkgForm(true);
                          }}
                          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus paket tour ini?')) {
                              deleteTourPackage(pkg.id);
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSavePackage} className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5">
                <h4 className="text-slate-800 font-extrabold text-sm mb-1 text-center">
                  {editingPkg ? 'Edit Paket Tour' : 'Simpan Paket Tour Baru'}
                </h4>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Paket</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!pkgName.trim()) return;
                        setIsTranslating(true);
                        try {
                          const trans = await translateTexts([pkgName]);
                          setPkgNameEn(trans.en[0] || '');
                          setPkgNameZh(trans.zh[0] || '');
                        } catch (e) { console.error(e); }
                        finally { setIsTranslating(false); }
                      }}
                      className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {isTranslating ? <Loader2 size={10} className="animate-spin" /> : null}
                      Auto Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={e => setPkgName(e.target.value)}
                    placeholder="Contoh: Paket Karangasem Tour"
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Deskripsi Paket</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!pkgDesc.trim()) return;
                        setIsTranslating(true);
                        try {
                          const trans = await translateTexts([pkgDesc]);
                          setPkgDescEn(trans.en[0] || '');
                          setPkgDescZh(trans.zh[0] || '');
                        } catch (e) { console.error(e); }
                        finally { setIsTranslating(false); }
                      }}
                      className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {isTranslating ? <Loader2 size={10} className="animate-spin" /> : null}
                      Auto Translate
                    </button>
                  </div>
                  <textarea
                    value={pkgDesc}
                    onChange={e => setPkgDesc(e.target.value)}
                    placeholder="Tulis ringkasan rute atau pesona paket..."
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-16 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Terjemahan Bahasa Inggris (English)</span>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Nama Paket (EN)</label>
                      <input
                        type="text"
                        value={pkgNameEn}
                        onChange={e => setPkgNameEn(e.target.value)}
                        placeholder="Package Name (English) - Opsional"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Deskripsi Paket (EN)</label>
                      <textarea
                        value={pkgDescEn}
                        onChange={e => setPkgDescEn(e.target.value)}
                        placeholder="Package Description (English) - Opsional"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-12 resize-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-2.5 md:pt-0 md:ps-3.5">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Terjemahan Bahasa Mandarin (中文)</span>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Nama Paket (ZH)</label>
                      <input
                        type="text"
                        value={pkgNameZh}
                        onChange={e => setPkgNameZh(e.target.value)}
                        placeholder="Package Name (Chinese) - Opsional"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Deskripsi Paket (ZH)</label>
                      <textarea
                        value={pkgDescZh}
                        onChange={e => setPkgDescZh(e.target.value)}
                        placeholder="Package Description (Chinese) - Opsional"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-12 resize-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Harga (IDR)</label>
                    <input
                      type="number"
                      value={pkgPrice}
                      onChange={e => setPkgPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Durasi (Jam)</label>
                    <input
                      type="number"
                      value={pkgDuration}
                      onChange={e => setPkgDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Unit / Satuan Harga (di bawah harga)</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!pkgPriceType.trim()) return;
                        setIsTranslating(true);
                        try {
                          const trans = await translateTexts([pkgPriceType]);
                          setPkgPriceTypeEn(trans.en[0] || '');
                          setPkgPriceTypeZh(trans.zh[0] || '');
                        } catch (e) { console.error(e); }
                        finally { setIsTranslating(false); }
                      }}
                      className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {isTranslating ? <Loader2 size={10} className="animate-spin" /> : null}
                      Auto Translate
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={pkgPriceType}
                      onChange={e => setPkgPriceType(e.target.value)}
                      placeholder="cth: / orang, / pax, / car, / day"
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                      required
                    />
                    <input
                      type="text"
                      value={pkgPriceTypeEn}
                      onChange={e => setPkgPriceTypeEn(e.target.value)}
                      placeholder="EN (cth: / person)"
                      className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                    />
                    <input
                      type="text"
                      value={pkgPriceTypeZh}
                      onChange={e => setPkgPriceTypeZh(e.target.value)}
                      placeholder="ZH (cth: / 人)"
                      className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                    />
                  </div>
                </div>

                <ImageUploadOrUrl
                  value={pkgCoverUrl}
                  onChange={setPkgCoverUrl}
                  label="Cover Image/Foto"
                  placeholder="https://..."
                />

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowPkgForm(false)}
                    disabled={isTranslating}
                    className="border border-slate-200 text-slate-600 font-extrabold py-2.5 rounded-xl text-xs uppercase disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isTranslating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Menerjemahkan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>

              {editingPkg && (
                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-6 text-left">
                  {/* PACKAGE OPTIONS MANAGEMENT */}
                  <div className="bg-slate-50 border border-slate-150 rounded-[28px] p-4.5">
                    <h5 className="text-slate-800 font-extrabold text-xs mb-3.5 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-indigo-600" />
                        Opsi Paket Tour
                      </span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-black">
                        {tourPackageOptions.filter(o => o.package_id === editingPkg.id).length} Opsi
                      </span>
                    </h5>

                    {/* List options */}
                    <div className="flex flex-col gap-2 mb-3.5">
                      {tourPackageOptions.filter(o => o.package_id === editingPkg.id).map(opt => (
                        <div key={opt.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-1 shadow-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-slate-800 text-xs truncate">{opt.name}</p>
                            {opt.description && (
                              <p className="text-slate-400 text-[10px] font-bold mt-0.5">{opt.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setOptEditId(opt.id);
                                setOptName(opt.name);
                                setOptDesc(opt.description);
                              }}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all"
                            >
                              <Edit size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Hapus opsi paket ini? Semua titik rute di bawah opsi ini juga akan terhapus.')) {
                                  deleteTourPackageOption(opt.id);
                                  tourPoints
                                    .filter(p => p.option_id === opt.id)
                                    .forEach(p => deleteTourPoint(p.id));
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {tourPackageOptions.filter(o => o.package_id === editingPkg.id).length === 0 && (
                        <p className="text-[10px] text-center text-slate-400 font-bold py-2">
                          Belum ada opsi paket. Silakan tambah di bawah.
                        </p>
                      )}
                    </div>

                    {/* Form to add/edit option */}
                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
                      <p className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">
                        {optEditId ? 'Edit Opsi Ini' : 'Tambah Opsi Baru'}
                      </p>
                      <input
                        type="text"
                        placeholder="Nama Opsi (cth: Nusa Penida Barat)"
                        value={optName}
                        onChange={e => setOptName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                      />
                      <input
                        type="text"
                        placeholder="Keterangan singkat / Deskripsi"
                        value={optDesc}
                        onChange={e => setOptDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!optName.trim()) return;
                            if (optEditId) {
                              const existing = tourPackageOptions.find(o => o.id === optEditId);
                              updateTourPackageOption({
                                ...existing,
                                id: optEditId,
                                package_id: editingPkg.id,
                                name: optName.trim(),
                                description: optDesc.trim(),
                                location_address: optAddress || '',
                                gmaps_url: '',
                                sort_order: existing?.sort_order || 0
                              });
                            } else {
                              const newId = 'opt-' + Date.now();
                              addTourPackageOption({
                                id: newId,
                                package_id: editingPkg.id,
                                name: optName.trim(),
                                description: optDesc.trim(),
                                location_address: '',
                                gmaps_url: '',
                                sort_order: tourPackageOptions.filter(o => o.package_id === editingPkg.id).length
                              });
                              if (!selectedOptIdForPt) {
                                setSelectedOptIdForPt(newId);
                              }
                            }
                            setOptEditId('');
                            setOptName('');
                            setOptDesc('');
                            setOptAddress('');
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider"
                        >
                          {optEditId ? 'Simpan Perubahan' : 'Tambah Opsi'}
                        </button>
                        {optEditId && (
                          <button
                            type="button"
                            onClick={() => {
                              setOptEditId('');
                              setOptName('');
                              setOptDesc('');
                              setOptAddress('');
                            }}
                            className="border border-slate-200 text-slate-500 font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STOPPING POINTS MANAGEMENT */}
                  <div className="bg-slate-50 border border-slate-150 rounded-[28px] p-4.5">
                    <h5 className="text-slate-800 font-extrabold text-xs mb-3.5 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-teal-600" />
                        Titik Pemberhentian (Stopping Points)
                      </span>
                      <span className="text-[9px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-black">
                        {tourPoints.filter(p => p.package_id === editingPkg.id).length} Titik
                      </span>
                    </h5>

                    {/* Pick option first */}
                    <div className="mb-3.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pilih Opsi Rute Paket</label>
                      <select
                        value={selectedOptIdForPt}
                        onChange={e => setSelectedOptIdForPt(e.target.value)}
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-2.5"
                      >
                        {tourPackageOptions.filter(o => o.package_id === editingPkg.id).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                        {tourPackageOptions.filter(o => o.package_id === editingPkg.id).length === 0 && (
                          <option value="">-- Tambah Opsi Paket Dulu --</option>
                        )}
                      </select>
                    </div>

                    {/* Points list filtered by selected opt */}
                    <div className="flex flex-col gap-2 mb-3.5">
                      {tourPoints.filter(p => p.package_id === editingPkg.id && p.option_id === selectedOptIdForPt).map((pt, idx) => (
                        <div key={pt.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-800 text-xs truncate">{pt.name_id}</p>
                              {pt.description_id && (
                                <p className="text-slate-400 text-[10px] font-bold truncate mt-0.5">{pt.description_id}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPtEditId(pt.id);
                                setPtName(pt.name_id);
                                setPtDesc(pt.description_id);
                                setPtDuration(pt.duration_minutes || 60);
                                setPtCoverUrl(pt.cover_image_url || '');
                              }}
                              className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-all"
                            >
                              <Edit size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Hapus titik rute ini?')) {
                                  deleteTourPoint(pt.id);
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedOptIdForPt && tourPoints.filter(p => p.package_id === editingPkg.id && p.option_id === selectedOptIdForPt).length === 0 && (
                        <p className="text-[10px] text-center text-slate-400 font-bold py-2">
                          Belum ada titik rute pemberhentian untuk opsi ini.
                        </p>
                      )}
                    </div>

                    {/* Point creator form inline */}
                    {selectedOptIdForPt ? (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
                        <p className="text-[9px] font-black uppercase text-teal-700 tracking-wider">
                          {ptEditId ? 'Edit Titik Rute' : 'Tambah Titik Rute Baru'}
                        </p>
                        <input
                          type="text"
                          placeholder="Nama Titik (cth: Pantai Kelingking)"
                          value={ptName}
                          onChange={e => setPtName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                        />
                        <textarea
                          placeholder="Keterangan singkat / daya tarik rute ini"
                          value={ptDesc}
                          onChange={e => setPtDesc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-14 resize-none"
                        />
                        <div className="mb-2.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 ms-1">Durasi (Menit)</label>
                          <input
                            type="number"
                            placeholder="Durasi (Menit)"
                            value={ptDuration}
                            onChange={e => setPtDuration(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                          />
                        </div>
                        <ImageUploadOrUrl
                          value={ptCoverUrl}
                          onChange={setPtCoverUrl}
                          label="Cover Foto Kegiatan"
                          placeholder="Optional (Format URL atau unggah)"
                        />
                        <div className="flex gap-2.5 mt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!ptName.trim()) return;

                              setIsTranslating(true);
                              let trans = { en: [ptName, ptDesc], zh: [ptName, ptDesc], id: [ptName, ptDesc] };
                              try {
                                trans = await translateTexts([ptName, ptDesc]);
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsTranslating(false);
                              }

                              if (ptEditId) {
                                const existing = tourPoints.find(p => p.id === ptEditId);
                                updateTourPoint({
                                  ...existing,
                                  id: ptEditId,
                                  package_id: editingPkg.id,
                                  option_id: selectedOptIdForPt,
                                  name_id: ptName.trim(),
                                  name_en: trans.en[0] || ptName.trim(),
                                  name_zh: trans.zh[0] || ptName.trim(),
                                  description_id: ptDesc.trim(),
                                  description_en: trans.en[1] || ptDesc.trim(),
                                  description_zh: trans.zh[1] || ptDesc.trim(),
                                  duration_minutes: ptDuration || 60,
                                  cover_image_url: ptCoverUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80',
                                  sequence_order: existing?.sequence_order || 0,
                                  latitude: 0,
                                  longitude: 0,
                                  location_address: ''
                                });
                              } else {
                                addTourPoint({
                                  id: 'pt-' + Date.now(),
                                  package_id: editingPkg.id,
                                  option_id: selectedOptIdForPt,
                                  name_id: ptName.trim(),
                                  name_en: trans.en[0] || ptName.trim(),
                                  name_zh: trans.zh[0] || ptName.trim(),
                                  description_id: ptDesc.trim(),
                                  description_en: trans.en[1] || ptDesc.trim(),
                                  description_zh: trans.zh[1] || ptDesc.trim(),
                                  duration_minutes: ptDuration || 60,
                                  cover_image_url: ptCoverUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80',
                                  sequence_order: tourPoints.filter(p => p.package_id === editingPkg.id && p.option_id === selectedOptIdForPt).length,
                                  latitude: 0,
                                  longitude: 0,
                                  location_address: ''
                                });
                              }
                              setPtEditId('');
                              setPtName('');
                              setPtDesc('');
                              setPtDuration(60);
                              setPtCoverUrl('');
                            }}
                            disabled={isTranslating}
                            className="flex-grow bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                          >
                            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : null}
                            {ptEditId ? 'Simpan Rute' : 'Tambah Rute'}
                          </button>
                          {ptEditId && (
                            <button
                              type="button"
                              onClick={() => {
                                setPtEditId('');
                                setPtName('');
                                setPtDesc('');
                                setPtDuration(60);
                                setPtCoverUrl('');
                              }}
                              className="border border-slate-200 text-slate-500 font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-center text-slate-400 font-bold bg-slate-100/50 p-3 rounded-2xl border border-dashed border-slate-200">
                        Silakan tambah & pilih Opsi Rute Paket terlebih dahulu di atas sebelum dapat mengelola rute titik pemberhentian!
                      </p>
                    )}
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE ACTIVITIES (activities) */}
        {activeTab === 'activities' && (
          <div>
            {!showActForm ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setEditingAct(null);
                    setActName('');
                    setActDesc('');
                    setActPrice(100000);
                    setActLocation('Kuta');
                    setActCoverUrl('');
                    setActNameEn('');
                    setActNameZh('');
                    setActDescEn('');
                    setActDescZh('');
                    setActPriceMode('per_person');
                    setActRating(5.0);
                    setActReviewCount(0);
                    setActLat(-8.4095);
                    setActLng(115.1889);
                    setActIsActive(true);
                    setActSortOrder(activities.length);
                    
                    setApEditId('');
                    setApName('');
                    setApDesc('');
                    setApDuration(60);
                    setApPrice(100000);
                    
                    setShowActForm(true);
                  }}
                  className="w-full bg-indigo-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  Tambah Aktivitas Wisata
                </button>

                <div className="flex flex-col gap-3.5 mt-2">
                  {activities.map(act => (
                    <div key={act.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-3 flex gap-3 items-center">
                      <img
                        src={act.cover_image_url}
                        alt={act.name_id}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate">{act.name_id}</h4>
                        <p className="text-slate-400 text-[10px] font-bold">Rp {act.price_per_person_idr?.toLocaleString('id-ID') || '100.000'} / {act.location_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAct(act);
                            setActName(act.name_id);
                            setActDesc(act.description_id);
                            setActPrice(act.price_per_person_idr);
                            setActLocation(act.location_name);
                            setActCoverUrl(act.cover_image_url);
                            setActNameEn(act.name_en || '');
                            setActNameZh(act.name_zh || '');
                            setActDescEn(act.description_en || '');
                            setActDescZh(act.description_zh || '');
                            setActPriceMode(act.price_mode || 'per_person');
                            setActRating(act.rating !== undefined ? act.rating : 5.0);
                            setActReviewCount(act.review_count !== undefined ? act.review_count : 0);
                            setActLat(act.latitude !== null && act.latitude !== undefined ? act.latitude : -8.4095);
                            setActLng(act.longitude !== null && act.longitude !== undefined ? act.longitude : 115.1889);
                            setActIsActive(act.is_active !== undefined ? act.is_active : true);
                            setActSortOrder(act.sort_order !== undefined ? act.sort_order : 0);
                            
                            setApEditId('');
                            setApName('');
                            setApDesc('');
                            setApDuration(60);
                            setApPrice(100000);
                            
                            setShowActForm(true);
                          }}
                          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus aktivitas wisata ini?')) {
                              deleteActivity(act.id);
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSaveActivity} className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5">
                <h4 className="text-slate-800 font-extrabold text-sm mb-1 text-center">
                  {editingAct ? (language === 'zh' ? '编辑活动信息' : language === 'en' ? 'Edit Activity Details' : 'Edit Aktivitas Wisata') : (language === 'zh' ? '添加新活动' : language === 'en' ? 'Add New Activity' : 'Simpan Aktivitas Baru')}
                </h4>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    {language === 'zh' ? '活动名称' : language === 'en' ? 'Activity Name' : 'Nama Aktivitas'}
                  </label>
                  <input
                    type="text"
                    value={actName}
                    onChange={e => setActName(e.target.value)}
                    placeholder={language === 'zh' ? '例如: 库塔水上乐园' : language === 'en' ? 'e.g. Waterbom Bali Park' : 'Contoh: Waterboom Bali Park'}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    {language === 'zh' ? '活动描述' : language === 'en' ? 'Activity Description' : 'Deskripsi'}
                  </label>
                  <textarea
                    value={actDesc}
                    onChange={e => setActDesc(e.target.value)}
                    placeholder={language === 'zh' ? '写下活动概要或设施...' : language === 'en' ? 'Write activity summary or highlights...' : 'Tulis ringkasan wahana...'}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-16 resize-none"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTranslateAllFields}
                  disabled={isTranslating}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm self-center my-1 select-none disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      {language === 'zh' ? '正在使用 AI 翻译...' : language === 'en' ? 'Translating with AI...' : 'Menerjemahkan dengan AI...'}
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      {language === 'zh' ? '使用 AI (Gemini) 自动翻译所有字段' : language === 'en' ? 'Auto Translate All Fields with AI (Gemini)' : 'Auto Terjemahkan Semua Field dengan AI (Gemini)'}
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">
                      {language === 'zh' ? '英文翻译 (English)' : language === 'en' ? 'English Translation (EN)' : 'Terjemahan Bahasa Inggris (English)'}
                    </span>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        {language === 'zh' ? '活动名称 (EN)' : language === 'en' ? 'Activity Name (EN)' : 'Nama Aktivitas (EN)'}
                      </label>
                      <input
                        type="text"
                        value={actNameEn}
                        onChange={e => setActNameEn(e.target.value)}
                        placeholder={language === 'zh' ? '英文活动名称' : language === 'en' ? 'Activity Name in English' : 'Activity Name (English) - Opsional'}
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        {language === 'zh' ? '活动描述 (EN)' : language === 'en' ? 'Activity Description (EN)' : 'Deskripsi Aktivitas (EN)'}
                      </label>
                      <textarea
                        value={actDescEn}
                        onChange={e => setActDescEn(e.target.value)}
                        placeholder={language === 'zh' ? '英文活动描述' : language === 'en' ? 'Activity Description in English' : 'Activity Description (English) - Opsional'}
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-12 resize-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-2.5 md:pt-0 md:ps-3.5">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">
                      {language === 'zh' ? '中文翻译' : language === 'en' ? 'Chinese Translation (ZH)' : 'Terjemahan Bahasa Mandarin (中文)'}
                    </span>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        {language === 'zh' ? '活动名称 (ZH)' : language === 'en' ? 'Activity Name (ZH)' : 'Nama Aktivitas (ZH)'}
                      </label>
                      <input
                        type="text"
                        value={actNameZh}
                        onChange={e => setActNameZh(e.target.value)}
                        placeholder={language === 'zh' ? '中文活动名称' : language === 'en' ? 'Activity Name in Chinese' : 'Activity Name (Chinese) - Opsional'}
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        {language === 'zh' ? '活动描述 (ZH)' : language === 'en' ? 'Activity Description (ZH)' : 'Deskripsi Aktivitas (ZH)'}
                      </label>
                      <textarea
                        value={actDescZh}
                        onChange={e => setActDescZh(e.target.value)}
                        placeholder={language === 'zh' ? '中文活动描述' : language === 'en' ? 'Activity Description in Chinese' : 'Activity Description (Chinese) - Opsional'}
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-12 resize-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '起价 (IDR)' : language === 'en' ? 'Starting Price (IDR)' : 'Harga Mulai (IDR)'}
                    </label>
                    <input
                      type="number"
                      value={actPrice}
                      onChange={e => setActPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '区域位置' : language === 'en' ? 'Region Location' : 'Lokasi Wilayah'}
                    </label>
                    <input
                      type="text"
                      value={actLocation}
                      onChange={e => setActLocation(e.target.value)}
                      placeholder={language === 'zh' ? '例如: 库塔, 乌布' : language === 'en' ? 'e.g. Kuta, Ubud' : 'Contoh: Kuta, Ubud'}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '计费单位' : language === 'en' ? 'Pricing Unit' : 'Satuan Tarif'}
                    </label>
                    <select
                      value={actPriceMode}
                      onChange={e => setActPriceMode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3"
                    >
                      <option value="per_person">{language === 'zh' ? '每人' : language === 'en' ? 'Per person' : 'Per orang'}</option>
                      <option value="per_ticket">{language === 'zh' ? '每票' : language === 'en' ? 'Per ticket' : 'Per tiket'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '默认评分' : language === 'en' ? 'Default Rating' : 'Rating Default'}
                    </label>
                    <input
                      type="number"
                      value={actRating}
                      onChange={e => setActRating(Number(e.target.value))}
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '评价数量' : language === 'en' ? 'Review Count' : 'Jumlah Ulasan'}
                    </label>
                    <input
                      type="number"
                      value={actReviewCount}
                      onChange={e => setActReviewCount(Number(e.target.value))}
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '显示状态' : language === 'en' ? 'Display Status' : 'Status Tampilan'}
                    </label>
                    <select
                      value={actIsActive ? "true" : "false"}
                      onChange={e => setActIsActive(e.target.value === "true")}
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3"
                    >
                      <option value="true">{language === 'zh' ? '显示 (活跃)' : language === 'en' ? 'Show (Active)' : 'Tampilkan (Aktif)'}</option>
                      <option value="false">{language === 'zh' ? '隐藏 (不活跃)' : language === 'en' ? 'Hide (Inactive)' : 'Sembunyikan (Tidak Aktif)'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? '显示顺序' : language === 'en' ? 'Display Sort Order' : 'Urutan Tampilan'}
                    </label>
                    <input
                      type="number"
                      value={actSortOrder}
                      onChange={e => setActSortOrder(Number(e.target.value))}
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                      required
                    />
                  </div>
                </div>

                <ImageUploadOrUrl
                  value={actCoverUrl}
                  onChange={setActCoverUrl}
                  label={language === 'zh' ? '活动封面图' : language === 'en' ? 'Activity Cover Image' : 'Cover Foto Aktivitas'}
                  placeholder="https://..."
                />

                {/* MAPS INTEGRATION FIELD */}
                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl flex flex-col gap-3">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">
                    {language === 'zh' ? '地图坐标位置' : language === 'en' ? 'Map Coordinate Location' : 'Lokasi Koordinat Peta'}
                  </span>
                  
                  {/* Google Maps Link / LatLng Copy-Paste field */}
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {language === 'zh' ? '复制并粘贴谷歌地图链接 / 坐标 (纬度, 经度)' : language === 'en' ? 'Copy & Paste Google Maps Link or Coordinates (Lat, Lng)' : 'Salin & Tempel Link dari Google Maps / Koordinat (Lat, Lng)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'zh' ? '例如: https://maps.google.com/?q=-8.4095,115.1889 或 -8.4095, 115.1889' : language === 'en' ? 'e.g., https://maps.google.com/?q=-8.4095,115.1889 or -8.4095, 115.1889' : 'Contoh: https://maps.google.com/?q=-8.4095,115.1889 atau -8.4095, 115.1889'}
                      onChange={(e) => {
                        const parsed = parseGmapsInput(e.target.value);
                        if (parsed) {
                          setActLat(parsed.lat);
                          setActLng(parsed.lng);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500"
                    />
                  </div>

                  {/* Interactive Map Picker */}
                  <div className="relative flex flex-col items-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 w-full text-left">
                      {language === 'zh' ? '在下方拖动或点击红针来自动调整位置点：' : language === 'en' ? 'Drag or click the red pin below to adjust location point automatically:' : 'Geser atau klik pin merah di bawah untuk menyesuaikan titik lokasi otomatis:'}
                    </p>
                    
                    <div 
                      ref={mapContainerRef}
                      onPointerDown={handleMapPointerDown}
                      onPointerMove={handleMapPointerMove}
                      onPointerUp={handleMapPointerUpOrLeave}
                      onPointerLeave={handleMapPointerUpOrLeave}
                      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-crosshair border border-slate-200 shadow-inner select-none touch-none bg-slate-100"
                    >
                      <img 
                        src={mapBg} 
                        alt="Peta Bali" 
                        className="w-full h-full object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive Drag Pin */}
                      {(() => {
                        const minLng = 114.4;
                        const maxLng = 115.7;
                        const minLat = -8.05;
                        const maxLat = -8.90;
                        
                        const xPercent = ((actLng - minLng) / (maxLng - minLng)) * 100;
                        const yPercent = ((actLat - minLat) / (maxLat - minLat)) * 100;
                        
                        const left = Math.min(Math.max(0, xPercent), 100);
                        const top = Math.min(Math.max(0, yPercent), 100);
                        
                        return (
                          <div 
                            style={{ left: `${left}%`, top: `${top}%` }}
                            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-75"
                          >
                            <div className="flex flex-col items-center">
                              <div className="bg-red-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap mb-0.5 animate-bounce">
                                {language === 'zh' ? '活动地点' : language === 'en' ? 'Activity Location' : 'Titik Lokasi'}
                              </div>
                              <MapPin size={24} className="text-red-600 fill-red-100 filter drop-shadow-md" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowActForm(false)}
                    disabled={isTranslating}
                    className="border border-slate-200 text-slate-600 font-extrabold py-2.5 rounded-xl text-xs uppercase disabled:opacity-50"
                  >
                    {language === 'zh' ? '取消' : language === 'en' ? 'Cancel' : 'Batal'}
                  </button>
                  <button
                    type="submit"
                    disabled={isTranslating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        {language === 'zh' ? '正在翻译...' : language === 'en' ? 'Translating...' : 'Menerjemahkan...'}
                      </>
                    ) : (
                      language === 'zh' ? '保存' : language === 'en' ? 'Save' : 'Simpan'
                    )}
                  </button>
                </div>
              </form>

              {editingAct && (
                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-6 text-left">
                  {/* DO-LIST PACKAGES MANAGEMENT */}
                  <div className="bg-slate-50 border border-slate-150 rounded-[28px] p-4.5">
                    <h5 className="text-slate-800 font-extrabold text-xs mb-3.5 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-pink-600" />
                        {language === 'zh' ? '活动套餐列表' : language === 'en' ? 'Activity Package List' : 'Daftar Paket Aktivitas'}
                      </span>
                      <span className="text-[9px] bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full font-black">
                        {activityPackages.filter(p => p.activity_id === editingAct.id).length} {language === 'zh' ? '个套餐' : language === 'en' ? 'Packages' : 'Paket'}
                      </span>
                    </h5>

                    {/* List of activity packages */}
                    <div className="flex flex-col gap-2 mb-3.5">
                      {activityPackages.filter(p => p.activity_id === editingAct.id).map(ap => {
                        const priceObj = activityPackagePrices.find(pr => pr.activity_package_id === ap.id);
                        return (
                          <div key={ap.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-1 shadow-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-800 text-xs truncate">{ap.name_id}</p>
                              <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                                {ap.duration_minutes} {language === 'zh' ? '分钟' : language === 'en' ? 'Mins' : 'Menit'} | Rp {priceObj ? priceObj.price_idr.toLocaleString('id-ID') : '0'}
                              </p>
                              {ap.description_id && (
                                <p className="text-slate-400 text-[9px] font-bold truncate mt-0.5">{ap.description_id}</p>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setApEditId(ap.id);
                                  setApName(ap.name_id);
                                  setApDesc(ap.description_id);
                                  setApDuration(ap.duration_minutes);
                                  setApPrice(priceObj ? priceObj.price_idr : 0);
                                  setApPriceLabel(priceObj?.label_id || priceObj?.label || '/ Pax');
                                  setApPriceLabelEn(priceObj?.label_en || priceObj?.label || '/ Pax');
                                  setApPriceLabelZh(priceObj?.label_zh || priceObj?.label || '/ Pax');
                                }}
                                className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl transition-all"
                              >
                                <Edit size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(language === 'zh' ? '您确定要删除此活动套餐及其价格吗？' : language === 'en' ? 'Are you sure you want to delete this activity package and its price?' : 'Yakin ingin menghapus paket aktivitas ini beserta harganya?')) {
                                    deleteActivityPackage(ap.id);
                                    if (priceObj) {
                                      deleteActivityPackagePrice(priceObj.id);
                                    }
                                  }
                                }}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {activityPackages.filter(p => p.activity_id === editingAct.id).length === 0 && (
                        <p className="text-[10px] text-center text-slate-400 font-bold py-2">
                          {language === 'zh' ? '暂无已登记的活动套餐。' : language === 'en' ? 'No activity packages registered yet.' : 'Belum ada paket aktivitas yang terdaftar.'}
                        </p>
                      )}
                    </div>

                    {/* Package form inline */}
                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
                      <p className="text-[9px] font-black uppercase text-pink-700 tracking-wider">
                        {apEditId 
                          ? (language === 'zh' ? '编辑活动套餐' : language === 'en' ? 'Edit Activity Package' : 'Edit Paket Aktivitas') 
                          : (language === 'zh' ? '添加新活动套餐' : language === 'en' ? 'Add New Activity Package' : 'Tambah Paket Aktivitas Baru')}
                      </p>
                      <input
                        type="text"
                        placeholder={language === 'zh' ? '套餐名称 (例如: 成人票套餐)' : language === 'en' ? 'Package Name (e.g. Adult Ticket Package)' : 'Nama Paket (cth: Paket Tiket Dewasa)'}
                        value={apName}
                        onChange={e => setApName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                      />
                      <textarea
                        placeholder={language === 'zh' ? '说明 / 套餐设施' : language === 'en' ? 'Description / Package facilities' : 'Keterangan / Fasilitas paket'}
                        value={apDesc}
                        onChange={e => setApDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-14 resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 ms-1">
                            {language === 'zh' ? '时长 (分钟)' : language === 'en' ? 'Duration (Minutes)' : 'Durasi (Menit)'}
                          </label>
                          <input
                            type="number"
                            placeholder={language === 'zh' ? '时长 (分钟)' : language === 'en' ? 'Duration (Mins)' : 'Durasi (Menit)'}
                            value={apDuration}
                            onChange={e => setApDuration(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 ms-1">
                            {language === 'zh' ? '套餐价格 (IDR)' : language === 'en' ? 'Package Price (IDR)' : 'Harga Paket (IDR)'}
                          </label>
                          <input
                            type="number"
                            placeholder={language === 'zh' ? '套餐价格 (IDR)' : language === 'en' ? 'Package Price (IDR)' : 'Harga Paket (IDR)'}
                            value={apPrice}
                            onChange={e => setApPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ms-1">
                            {language === 'zh' ? '计费单位 / 价格单位 (在价格下方显示)' : language === 'en' ? 'Pricing Unit / Label (shown below price)' : 'Unit / Satuan Harga (di bawah harga)'}
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!apPriceLabel.trim()) return;
                              setIsTranslating(true);
                              try {
                                const trans = await translateTexts([apPriceLabel]);
                                setApPriceLabelEn(trans.en[0] || '');
                                setApPriceLabelZh(trans.zh[0] || '');
                              } catch (e) { console.error(e); }
                              finally { setIsTranslating(false); }
                            }}
                            className="text-[8px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {isTranslating ? <Loader2 size={10} className="animate-spin" /> : null}
                            {language === 'zh' ? '自动翻译' : language === 'en' ? 'Auto Translate' : 'Auto Translate'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={apPriceLabel}
                            onChange={e => setApPriceLabel(e.target.value)}
                            placeholder={language === 'zh' ? '例如: /人, /票, /车' : language === 'en' ? 'e.g. / Pax, / ticket, / car' : 'cth: / Pax, / tiket, / mobil'}
                            className="bg-slate-50 border border-slate-200 outline-none text-[10px] font-semibold text-slate-800 rounded-xl py-2 px-3"
                            required
                          />
                          <input
                            type="text"
                            value={apPriceLabelEn}
                            onChange={e => setApPriceLabelEn(e.target.value)}
                            placeholder="EN (e.g. / Pax)"
                            className="bg-white border border-slate-200 outline-none text-[10px] font-semibold text-slate-800 rounded-xl py-2 px-3"
                          />
                          <input
                            type="text"
                            value={apPriceLabelZh}
                            onChange={e => setApPriceLabelZh(e.target.value)}
                            placeholder="ZH (e.g. / 人)"
                            className="bg-white border border-slate-200 outline-none text-[10px] font-semibold text-slate-800 rounded-xl py-2 px-3"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!apName.trim()) return;

                            setIsTranslating(true);
                            let trans = { en: [apName, apDesc], zh: [apName, apDesc], id: [apName, apDesc] };
                            let apLabelEn = apPriceLabelEn.trim();
                            let apLabelZh = apPriceLabelZh.trim();
                            try {
                              trans = await translateTexts([apName, apDesc]);
                              if (apPriceLabel.trim() && (!apLabelEn || !apLabelZh)) {
                                const transLabel = await translateTexts([apPriceLabel]);
                                if (!apLabelEn) apLabelEn = transLabel.en[0] || apPriceLabel;
                                if (!apLabelZh) apLabelZh = transLabel.zh[0] || apPriceLabel;
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsTranslating(false);
                            }

                            const pkgId = apEditId || 'ap-' + Date.now();

                            if (apEditId) {
                              const existing = activityPackages.find(p => p.id === apEditId);
                              updateActivityPackage({
                                ...existing,
                                id: apEditId,
                                activity_id: editingAct.id,
                                name: apName.trim(),
                                name_id: apName.trim(),
                                name_en: trans.en[0] || apName.trim(),
                                name_zh: trans.zh[0] || apName.trim(),
                                description: apDesc.trim(),
                                description_id: apDesc.trim(),
                                description_en: trans.en[1] || apDesc.trim(),
                                description_zh: trans.zh[1] || apDesc.trim(),
                                duration_minutes: apDuration || 60,
                                sort_order: existing?.sort_order || 0
                              });

                              const existingPrice = activityPackagePrices.find(pr => pr.activity_package_id === apEditId);
                              if (existingPrice) {
                                updateActivityPackagePrice({
                                  ...existingPrice,
                                  price_idr: apPrice,
                                  label: apPriceLabel.trim() || '/ Pax',
                                  label_id: apPriceLabel.trim() || '/ Pax',
                                  label_en: apLabelEn.trim() || '/ Pax',
                                  label_zh: apLabelZh.trim() || '/ Pax'
                                });
                              } else {
                                addActivityPackagePrice({
                                  id: 'app-' + Date.now(),
                                  activity_package_id: apEditId,
                                  label: apPriceLabel.trim() || '/ Pax',
                                  label_id: apPriceLabel.trim() || '/ Pax',
                                  label_en: apLabelEn.trim() || '/ Pax',
                                  label_zh: apLabelZh.trim() || '/ Pax',
                                  price_idr: apPrice,
                                  sort_order: 0
                                });
                              }
                            } else {
                              addActivityPackage({
                                id: pkgId,
                                activity_id: editingAct.id,
                                name: apName.trim(),
                                name_id: apName.trim(),
                                name_en: trans.en[0] || apName.trim(),
                                name_zh: trans.zh[0] || apName.trim(),
                                description: apDesc.trim(),
                                description_id: apDesc.trim(),
                                description_en: trans.en[1] || apDesc.trim(),
                                description_zh: trans.zh[1] || apDesc.trim(),
                                duration_minutes: apDuration || 60,
                                sort_order: activityPackages.filter(p => p.activity_id === editingAct.id).length
                              });

                              addActivityPackagePrice({
                                id: 'app-' + Date.now(),
                                activity_package_id: pkgId,
                                label: apPriceLabel.trim() || '/ Pax',
                                label_id: apPriceLabel.trim() || '/ Pax',
                                label_en: apLabelEn.trim() || '/ Pax',
                                label_zh: apLabelZh.trim() || '/ Pax',
                                price_idr: apPrice,
                                sort_order: 0
                              });
                            }

                            setApEditId('');
                            setApName('');
                            setApDesc('');
                            setApDuration(60);
                            setApPrice(100000);
                            setApPriceLabel('/ Pax');
                            setApPriceLabelEn('/ Pax');
                            setApPriceLabelZh('/ Pax');
                          }}
                          disabled={isTranslating}
                          className="flex-grow bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          {isTranslating ? <Loader2 size={12} className="animate-spin" /> : null}
                          {apEditId 
                            ? (language === 'zh' ? '保存更改' : language === 'en' ? 'Save Changes' : 'Simpan Perubahan') 
                            : (language === 'zh' ? '添加套餐' : language === 'en' ? 'Add Package' : 'Tambah Paket')}
                        </button>
                        {apEditId && (
                          <button
                            type="button"
                            onClick={() => {
                              setApEditId('');
                              setApName('');
                              setApDesc('');
                              setApDuration(60);
                              setApPrice(100000);
                              setApPriceLabel('/ Pax');
                              setApPriceLabelEn('/ Pax');
                              setApPriceLabelZh('/ Pax');
                            }}
                            className="border border-slate-200 text-slate-500 font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase"
                          >
                            {language === 'zh' ? '取消' : language === 'en' ? 'Cancel' : 'Batal'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: GALLERY / HOME BANNERS DESIGN */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-6">
            {/* Gallery Addition */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-slate-800 font-extrabold text-xs mb-3 flex items-center gap-1.5">
                <Image size={15} className="text-slate-500" />
                Tambah Gambar Galeri
              </h3>
              <div className="flex flex-col gap-3">
                <ImageUploadOrUrl
                  value={newGalleryUrl}
                  onChange={setNewGalleryUrl}
                  label="Foto Galeri"
                  placeholder="Isi alamat foto URL (https://...) atau unggah"
                />
                <button
                  onClick={() => {
                    if (newGalleryUrl.trim()) {
                      addGalleryImage(newGalleryUrl.trim(), null);
                      setNewGalleryUrl('');
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-2.5 rounded-2xl cursor-pointer active:scale-95 transition-all text-center uppercase tracking-wider"
                >
                  Tambah Gambar Galeri
                </button>
              </div>

              {/* Grid listings deleting gallery */}
              <div className="grid grid-cols-3 gap-2 mt-4 max-h-[140px] overflow-y-auto">
                {activityGallery.map(img => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img.image_url} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteGalleryImage(img.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Carousel Banners Addition */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-slate-800 font-extrabold text-xs mb-3 flex items-center gap-1.5">
                <Layers size={15} className="text-slate-500" />
                Tambah Home Slider Banner
              </h3>
              <div className="flex flex-col gap-3">
                <ImageUploadOrUrl
                  value={newBannerUrl}
                  onChange={setNewBannerUrl}
                  label="Banner Slider Utama"
                  placeholder="Isi alamat banner URL (https://...) atau unggah"
                />
                <button
                  onClick={() => {
                    if (newBannerUrl.trim()) {
                      addHomeBanner(newBannerUrl.trim());
                      setNewBannerUrl('');
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-2.5 rounded-2xl cursor-pointer active:scale-95 transition-all text-center uppercase tracking-wider"
                >
                  Tambah Slider Banner
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 max-h-[140px] overflow-y-auto">
                {homeBanners.map(b => (
                  <div key={b.id} className="relative aspect-[16/9] bg-slate-50 rounded-xl overflow-hidden group border border-slate-100">
                    <img src={b.image_url} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteHomeBanner(b.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Kelola Peta Halaman Maps */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-slate-800 font-extrabold text-xs mb-3 flex items-center gap-1.5">
                <Map size={15} className="text-slate-500" />
                Atur Gambar Peta (Halaman Maps)
              </h3>
              <div className="flex flex-col gap-3">
                <ImageUploadOrUrl
                  value={mapImageUrl}
                  onChange={setMapImageUrl}
                  label="Gambar Peta Wisata Bali"
                  placeholder="Isi alamat URL peta atau unggah foto peta baru"
                  id="map-image-input"
                />
                {mapSettingsSuccess && (
                  <div className="text-emerald-800 bg-emerald-50 py-2 px-3 text-[10px] font-bold rounded-xl border border-emerald-100 text-center">
                    {mapSettingsSuccess}
                  </div>
                )}
                <button
                  onClick={async () => {
                    try {
                      await updateSettings({
                        ...settings,
                        map_image_url: mapImageUrl.trim()
                      });
                      setMapSettingsSuccess('Gambar peta berhasil diperbarui!');
                      setTimeout(() => setMapSettingsSuccess(''), 3000);
                    } catch (e) {
                      alert('Gagal menyimpan gambar peta');
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-2.5 rounded-2xl cursor-pointer active:scale-95 transition-all text-center uppercase tracking-wider"
                >
                  Simpan Gambar Peta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEBSITE SETTINGS (settings) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5">
            <h3 className="text-slate-800 font-extrabold text-xs mb-1 flex items-center gap-1.5">
              <SetIcon size={15} />
              Konfigurasi Sistem
            </h3>

            {settingsSuccess && (
              <div className="text-emerald-800 bg-emerald-50 py-2.5 px-3 text-[11px] font-bold rounded-xl border border-emerald-100 text-center">
                {settingsSuccess}
              </div>
            )}

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nama Perusahaan / Travel Agent</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                required
              />
            </div>

            <ImageUploadOrUrl
              value={logoUrl}
              onChange={setLogoUrl}
              label="Logo URL (Icon) / Foto"
              placeholder="https://..."
            />

            <ImageUploadOrUrl
              value={profileLogoUrl}
              onChange={setProfileLogoUrl}
              label="Logo Profil (Profile Avatar)"
              placeholder="https://..."
            />
            
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Teks Balon Percakapan Profil (Auto Translate)</label>
              <textarea
                value={profileSpeechText}
                onChange={e => setProfileSpeechText(e.target.value)}
                placeholder="Apa yang Anda pikirkan?"
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2 px-3 h-16 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">WhatsApp CS</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Default Theme (Hex)</label>
                <input
                  type="text"
                  value={themeColor}
                  onChange={e => setThemeColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tagline Layanan</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subtagline Detail</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none text-xs font-semibold text-slate-800 rounded-xl py-2.5 px-3.5"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isTranslating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl mt-2 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menerjemahkan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 6: BACKUP & DATABASE (backup) */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-slate-800 font-extrabold text-xs mb-2 flex items-center gap-1.5">
              <Database size={15} />
              Cadangkan & Pulihkan Database
            </h3>
            <p className="text-slate-400 text-[10px] font-bold mb-6">
              Gunakan panel ini untuk mengunduh versi lengkap data rilis anda (Backup JSON), memuat berkas cadangan, atau menyinkronkan data pratinjau lokal langsung ke Firestore Cloud.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
              <h4 className="text-amber-800 font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                ⚡ SINKRONISASI PREVIEW KE FIRESTORE REALTIME
              </h4>
              <p className="text-amber-700 text-[10px] font-bold leading-normal mb-3">
                Apakah Anda memiliki perubahan data, rute, atau paket di dalam browser preview ini yang ingin Anda publikasikan agar langsung terlihat secara realtime di link Share / Publish? Klik tombol di bawah untuk mengunggah data lokal Anda ke cloud Firestore.
              </p>
              <button
                onClick={handleMigrateLocalToFirestore}
                disabled={isMigrating}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-extrabold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                {isMigrating ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                    Sedang Mengunggah...
                  </>
                ) : (
                  <>
                    <CloudLightning size={14} />
                    Migrasikan Data Preview ke Firestore Cloud
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleBackupDownload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Download size={14} />
                Unduh Database Rilis (JSON)
              </button>

              <div className="border border-dashed border-slate-300 rounded-xl p-4 mt-2 hover:bg-slate-50 transition-all flex flex-col items-center justify-center relative min-h-[100px] cursor-pointer">
                <Upload size={22} className="text-slate-400 mb-2" />
                <span className="text-slate-700 font-extrabold text-[11px] uppercase tracking-wide">Pilih atau Seret Berkas</span>
                <span className="text-slate-400 text-[9px] font-bold mt-1">Hanya mendukung berkas .json</span>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleBackupUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOM BOKEH THEME SELECTION (theme) */}
        {activeTab === 'theme' && (
          <div className="flex flex-col gap-4 text-left">
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-slate-800 font-extrabold text-xs mb-1 flex items-center gap-1.5">
                <Palette size={15} className="text-pink-600" />
                Kustomisasi Tema Bokeh Eksotis
              </h3>
              <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
                Pilih skema warna gradasi bokeh artistik Bali pilihan Anda. Warna primer, aksen, dan berkilau gradasi latar belakang akan langsung menyesuaikan di seluruh antarmuka pengunjung dan admin.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {BOKEH_THEMES.map((theme) => {
                const isSelected = settings.bokeh_theme_id === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      updateSettings({
                        ...settings,
                        theme_color: theme.themeColor,
                        accent_color: theme.accentColor,
                        bokeh_theme_id: theme.id,
                        bokeh_gradient: theme.gradient
                      });
                      setThemeColor(theme.themeColor);
                      setAccentColor(theme.accentColor);
                    }}
                    className={`relative rounded-3xl overflow-hidden p-5 transition-all duration-300 transform active:scale-[0.98] cursor-pointer border shadow-sm flex flex-col justify-between min-h-[160px] ${
                      isSelected 
                        ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-900' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                    style={{ background: theme.gradient }}
                  >
                    {/* Glowing Bokeh Backdrop Preview */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                      {theme.circles.map((c, idx) => (
                        <div
                          key={idx}
                          className="absolute rounded-full opacity-60 filter blur-[20px]"
                          style={{
                            backgroundColor: c.color,
                            width: idx === 0 ? '110px' : idx === 1 ? '130px' : '90px',
                            height: idx === 0 ? '110px' : idx === 1 ? '130px' : '90px',
                            top: idx === 0 ? '-15px' : idx === 1 ? 'auto' : '20px',
                            bottom: idx === 1 ? '-25px' : 'auto',
                            left: idx === 0 ? '-15px' : 'auto',
                            right: idx === 1 ? '-5px' : idx === 2 ? '40px' : 'auto',
                          }}
                        />
                      ))}
                    </div>

                    {/* Tag & Select Badge */}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-black/25 backdrop-blur-md border border-white/25 rounded-full px-3 py-1 text-[9px] font-extrabold text-white uppercase tracking-widest leading-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Preset Bokeh
                      </div>

                      {isSelected ? (
                        <div className="bg-white text-slate-950 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                          <Check size={11} className="stroke-[3.5px] text-emerald-600" />
                          Aktif
                        </div>
                      ) : (
                        <span className="bg-white/15 backdrop-blur-md text-white border border-white/10 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                          Pilih Tema
                        </span>
                      )}
                    </div>

                    {/* Selected Theme Metadata */}
                    <div className="relative z-10 mt-6 pt-2 select-none text-left">
                      <h4 className="text-white font-black text-base tracking-tight leading-none drop-shadow-sm">
                        {theme.name}
                      </h4>
                      <p className="text-white/80 text-[10px] font-bold mt-1.5 tracking-wide max-w-[95%] leading-relaxed drop-shadow-xs">
                        {theme.description}
                      </p>

                      <div className="flex gap-2 mt-4 text-[8px] font-extrabold tracking-widest uppercase">
                        <span className="bg-black/20 backdrop-blur-xs border border-white/10 px-2 py-1 rounded-lg text-white">
                          Utama: {theme.themeColor}
                        </span>
                        <span className="bg-black/20 backdrop-blur-xs border border-white/10 px-2 py-1 rounded-lg text-white">
                          Aksen: {theme.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
