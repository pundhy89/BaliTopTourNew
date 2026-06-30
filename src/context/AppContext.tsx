import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { seedData } from '../data/seedData';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import {
  Settings,
  TourPackage,
  TourPackageOption,
  TourPoint,
  Activity,
  ActivityPackage,
  ActivityPackagePrice,
  ActivityGallery,
  Review,
  VisitorLog,
  HomeBanner
} from '../types';

interface AppContextType {
  settings: Settings;
  language: 'id' | 'en' | 'zh';
  setLanguage: (lang: 'id' | 'en' | 'zh') => void;
  updateSettings: (newSettings: Settings) => void;
  
  // Tour Packages CRUD
  tourPackages: TourPackage[];
  addTourPackage: (p: TourPackage) => void;
  updateTourPackage: (p: TourPackage) => void;
  deleteTourPackage: (id: string) => void;

  // Tour Options CRUD
  tourPackageOptions: TourPackageOption[];
  addTourPackageOption: (o: TourPackageOption) => void;
  updateTourPackageOption: (o: TourPackageOption) => void;
  deleteTourPackageOption: (id: string) => void;

  // Tour Points CRUD
  tourPoints: TourPoint[];
  addTourPoint: (pt: TourPoint) => void;
  updateTourPoint: (pt: TourPoint) => void;
  deleteTourPoint: (id: string) => void;

  // Activities CRUD
  activities: Activity[];
  addActivity: (a: Activity) => void;
  updateActivity: (a: Activity) => void;
  deleteActivity: (id: string) => void;

  // Activity Packages CRUD
  activityPackages: ActivityPackage[];
  addActivityPackage: (ap: ActivityPackage) => void;
  updateActivityPackage: (ap: ActivityPackage) => void;
  deleteActivityPackage: (id: string) => void;

  // Activity Prices CRUD
  activityPackagePrices: ActivityPackagePrice[];
  addActivityPackagePrice: (app: ActivityPackagePrice) => void;
  updateActivityPackagePrice: (app: ActivityPackagePrice) => void;
  deleteActivityPackagePrice: (id: string) => void;

  // Gallery CRUD
  activityGallery: ActivityGallery[];
  addGalleryImage: (imgUrl: string, activityId: string | null) => void;
  deleteGalleryImage: (id: string) => void;

  // Reviews CRUD
  reviews: Review[];
  addReview: (activityId: string, authorName: string, rating: number, comment: string) => void;

  // Visitor Logging
  userName: string;
  setUserName: (name: string) => void;
  hasSeenGreeting: boolean;
  setHasSeenGreeting: (seen: boolean) => void;
  visitorLogs: VisitorLog[];
  trackAction: (actionType: string, actionDetails: string) => void;

  // Admin Session
  isAdminLoggedIn: boolean;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  adminUser: { username: string } | null;

  // Home Banners
  homeBanners: HomeBanner[];
  addHomeBanner: (image_url: string) => void;
  deleteHomeBanner: (id: string) => void;

  // DB Restore
  restoreDatabase: (data: Record<string, string>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Helper to load or initialize local storage
  const getStored = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // State Declarations
  const [settings, setSettings] = useState<Settings>(() => 
    getStored('bali_tour_settings', seedData.settings?.[0] || {
      id: 'default',
      company_name: 'Bali Top Tour',
      logo_url: '',
      theme_color: '#4F359B',
      accent_color: '#00897B',
      background_url: '',
      home_background_url: '',
      home_background_urls: [],
      splash_image_urls: [],
      whatsapp_number: '6282143415254',
      default_language: 'id',
      tagline_id: 'Jelajahi, Temukan, Terinspirasi',
      tagline_en: 'Explore, Discover, Inspire',
      tagline_zh: '探索，发现，启发',
      subtitle_id: 'Perjalanan terbaik dimulai di sini.',
      subtitle_en: 'The best journey starts here.',
      subtitle_zh: '最好的旅程从这里开始。'
    })
  );

  const [language, setLanguageState] = useState<'id' | 'en' | 'zh'>(() => {
    const savedLang = localStorage.getItem('bali_tour_lang');
    if (savedLang && ['id', 'en', 'zh'].includes(savedLang)) {
      return savedLang as 'id' | 'en' | 'zh';
    }
    return (settings.default_language as 'id' | 'en' | 'zh') || 'id';
  });

  const [tourPackages, setTourPackages] = useState<TourPackage[]>(() => 
    getStored('bali_tour_packages', seedData.tour_packages || [])
  );

  const [tourPackageOptions, setTourPackageOptions] = useState<TourPackageOption[]>(() => 
    getStored('bali_tour_package_options', seedData.tour_package_options || [])
  );

  const [tourPoints, setTourPoints] = useState<TourPoint[]>(() => 
    getStored('bali_tour_points', seedData.tour_points || [])
  );

  const [activities, setActivities] = useState<Activity[]>(() => 
    getStored('bali_tour_activities', seedData.activities || [])
  );

  const [activityPackages, setActivityPackages] = useState<ActivityPackage[]>(() => 
    getStored('bali_tour_activity_packages', seedData.activity_packages || [])
  );

  const [activityPackagePrices, setActivityPackagePrices] = useState<ActivityPackagePrice[]>(() => 
    getStored('bali_tour_activity_package_prices', seedData.activity_package_prices || [])
  );

  const [activityGallery, setActivityGallery] = useState<ActivityGallery[]>(() => 
    getStored('bali_tour_activity_gallery', seedData.activity_gallery || [])
  );

  const [reviews, setReviews] = useState<Review[]>(() => 
    getStored('bali_tour_reviews', seedData.reviews || [])
  );

  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => 
    getStored('bali_tour_visitor_logs', seedData.visitor_logs || [])
  );

  const [homeBanners, setHomeBanners] = useState<HomeBanner[]>(() => 
    getStored('bali_tour_home_banners', seedData.home_banners || [])
  );

  const [userName, setUserNameState] = useState<string>(() => 
    localStorage.getItem('bali_tour_user_name') || ''
  );

  const [hasSeenGreeting, setHasSeenGreeting] = useState<boolean>(() => 
    localStorage.getItem('bali_tour_seen_greeting') === 'true'
  );

  const [adminUser, setAdminUser] = useState<{ username: string } | null>(() => {
    const saved = localStorage.getItem('bali_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const sessionIdRef = useRef<string>('');
  const activeLogIdRef = useRef<string>('');

  // Helper to safely set item in localStorage without throwing QuotaExceededError
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn(`LocalStorage quota exceeded for key: ${key}. Storing failed gracefully.`);
      } else {
        console.error(`LocalStorage error for key: ${key}`, e);
      }
    }
  };

  // Helper to deep-clean objects for Firestore (removes undefined keys)
  const cleanObj = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Real-time Firestore synchronization hooks
  useEffect(() => {
    let active = true;
    const unsubscribers: (() => void)[] = [];

    const checkAndSeed = async () => {
      try {
        const settingsDocRef = doc(db, 'settings', 'default');
        const snapshot = await getDoc(settingsDocRef);
        
        if (!snapshot.exists()) {
          console.log('Firestore is empty. Starting initial seed...');
          
          // Seed settings
          const initialSettings = seedData.settings?.[0] || {
            id: 'default',
            company_name: 'Bali Top Tour',
            logo_url: '',
            theme_color: '#4F359B',
            accent_color: '#00897B',
            background_url: '',
            home_background_url: '',
            home_background_urls: [],
            splash_image_urls: [],
            whatsapp_number: '6282143415254',
            default_language: 'id',
            tagline_id: 'Jelajahi, Temukan, Terinspirasi',
            tagline_en: 'Explore, Discover, Inspire',
            tagline_zh: '探索，发现，启发',
            subtitle_id: 'Perjalanan terbaik dimulai di sini.',
            subtitle_en: 'The best journey starts here.',
            subtitle_zh: '最好的旅程从这里开始。'
          };
          await setDoc(settingsDocRef, cleanObj(initialSettings));

          // Helper to batch-upload initial seed data
          const seedCol = async <T extends { id: string }>(colName: string, items: T[]) => {
            for (const item of items) {
              await setDoc(doc(db, colName, item.id), cleanObj(item));
            }
          };

          await seedCol('tour_packages', seedData.tour_packages || []);
          await seedCol('tour_package_options', seedData.tour_package_options || []);
          await seedCol('tour_points', seedData.tour_points || []);
          await seedCol('activities', seedData.activities || []);
          await seedCol('activity_packages', seedData.activity_packages || []);
          await seedCol('activity_package_prices', seedData.activity_package_prices || []);
          await seedCol('activity_gallery', seedData.activity_gallery || []);
          await seedCol('reviews', seedData.reviews || []);
          await seedCol('home_banners', seedData.home_banners || []);
          await seedCol('visitor_logs', seedData.visitor_logs || []);
          
          console.log('Firestore initial seed completed successfully.');
        }
      } catch (err) {
        console.error('Error during initial Firestore seed:', err);
      }
    };

    // Run checkAndSeed, then establish real-time listeners
    checkAndSeed().then(() => {
      if (!active) return;

      // 1. Settings
      const settingsDocRef = doc(db, 'settings', 'default');
      const unsubscribeSettings = onSnapshot(settingsDocRef, (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as Settings);
        }
      });
      unsubscribers.push(unsubscribeSettings);

      // Helper to sync standard collections
      const syncCollection = <T extends { id: string }>(
        collectionName: string,
        stateSetter: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const colRef = collection(db, collectionName);
        return onSnapshot(colRef, (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => doc.data() as T);
            stateSetter(items);
          } else {
            stateSetter([]);
          }
        });
      };

      unsubscribers.push(syncCollection('tour_packages', setTourPackages));
      unsubscribers.push(syncCollection('tour_package_options', setTourPackageOptions));
      unsubscribers.push(syncCollection('tour_points', setTourPoints));
      unsubscribers.push(syncCollection('activities', setActivities));
      unsubscribers.push(syncCollection('activity_packages', setActivityPackages));
      unsubscribers.push(syncCollection('activity_package_prices', setActivityPackagePrices));
      unsubscribers.push(syncCollection('activity_gallery', setActivityGallery));
      unsubscribers.push(syncCollection('reviews', setReviews));
      unsubscribers.push(syncCollection('home_banners', setHomeBanners));

      // 2. Visitor logs
      const logsColRef = collection(db, 'visitor_logs');
      const unsubscribeLogs = onSnapshot(logsColRef, (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(doc => doc.data() as VisitorLog);
          items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setVisitorLogs(items.slice(0, 50));
        } else {
          setVisitorLogs([]);
        }
      });
      unsubscribers.push(unsubscribeLogs);
    });

    return () => {
      active = false;
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Save states to local storage on changes
  useEffect(() => {
    safeSetItem('bali_tour_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeSetItem('bali_tour_packages', JSON.stringify(tourPackages));
  }, [tourPackages]);

  useEffect(() => {
    safeSetItem('bali_tour_package_options', JSON.stringify(tourPackageOptions));
  }, [tourPackageOptions]);

  useEffect(() => {
    safeSetItem('bali_tour_points', JSON.stringify(tourPoints));
  }, [tourPoints]);

  useEffect(() => {
    safeSetItem('bali_tour_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    safeSetItem('bali_tour_activity_packages', JSON.stringify(activityPackages));
  }, [activityPackages]);

  useEffect(() => {
    safeSetItem('bali_tour_activity_package_prices', JSON.stringify(activityPackagePrices));
  }, [activityPackagePrices]);

  useEffect(() => {
    safeSetItem('bali_tour_activity_gallery', JSON.stringify(activityGallery));
  }, [activityGallery]);

  useEffect(() => {
    safeSetItem('bali_tour_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeSetItem('bali_tour_visitor_logs', JSON.stringify(visitorLogs));
  }, [visitorLogs]);

  useEffect(() => {
    safeSetItem('bali_tour_home_banners', JSON.stringify(homeBanners));
  }, [homeBanners]);

  // Handle Dynamic Session ID & Visit Logging
  useEffect(() => {
    let sessId = localStorage.getItem('bali_tour_session_id');
    if (!sessId) {
      sessId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bali_tour_session_id', sessId);
    }
    sessionIdRef.current = sessId;

    const currentVisitor = userName || 'Guest';
    const logId = Math.random().toString(36).substring(2, 15);
    activeLogIdRef.current = logId;

    const newLog: VisitorLog = {
      id: logId,
      visitor_name: currentVisitor,
      session_id: sessId,
      action_type: 'visit',
      action_details: `Visited Home page`,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setVisitorLogs(prev => [newLog, ...prev]);

    // Cleanup visitor state on exit/unmount
    return () => {
      setVisitorLogs(prev => 
        prev.map(log => log.id === logId ? { ...log, is_active: false } : log)
      );
    };
  }, [userName]);

  const setLanguage = (lang: 'id' | 'en' | 'zh') => {
    setLanguageState(lang);
    localStorage.setItem('bali_tour_lang', lang);
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('bali_tour_user_name', name);
    // Update active visitor log
    if (activeLogIdRef.current) {
      setVisitorLogs(prev => 
        prev.map(log => log.id === activeLogIdRef.current ? { ...log, visitor_name: name || 'Guest' } : log)
      );
    }
  };

  const handleSetHasSeenGreeting = (seen: boolean) => {
    setHasSeenGreeting(seen);
    localStorage.setItem('bali_tour_seen_greeting', seen ? 'true' : 'false');
  };

  const trackAction = async (actionType: string, actionDetails: string) => {
    const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newLog: VisitorLog = {
      id: logId,
      visitor_name: userName || 'Guest',
      session_id: sessionIdRef.current,
      action_type: actionType,
      action_details: actionDetails,
      is_active: false,
      created_at: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'visitor_logs', logId), cleanObj(newLog));
    } catch (err) {
      console.error('Error tracking action:', err);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      await setDoc(doc(db, 'settings', 'default'), cleanObj(newSettings));
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  // CRUD FOR TOUR PACKAGES
  const addTourPackage = async (p: TourPackage) => {
    try {
      await setDoc(doc(db, 'tour_packages', p.id), cleanObj(p));
    } catch (err) {
      console.error('Error adding tour package:', err);
    }
  };
  const updateTourPackage = async (p: TourPackage) => {
    try {
      await setDoc(doc(db, 'tour_packages', p.id), cleanObj(p));
    } catch (err) {
      console.error('Error updating tour package:', err);
    }
  };
  const deleteTourPackage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tour_packages', id));
    } catch (err) {
      console.error('Error deleting tour package:', err);
    }
  };

  // CRUD FOR TOUR OPTIONS
  const addTourPackageOption = async (o: TourPackageOption) => {
    try {
      await setDoc(doc(db, 'tour_package_options', o.id), cleanObj(o));
    } catch (err) {
      console.error('Error adding tour package option:', err);
    }
  };
  const updateTourPackageOption = async (o: TourPackageOption) => {
    try {
      await setDoc(doc(db, 'tour_package_options', o.id), cleanObj(o));
    } catch (err) {
      console.error('Error updating tour package option:', err);
    }
  };
  const deleteTourPackageOption = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tour_package_options', id));
    } catch (err) {
      console.error('Error deleting tour package option:', err);
    }
  };

  // CRUD FOR TOUR POINTS
  const addTourPoint = async (pt: TourPoint) => {
    try {
      await setDoc(doc(db, 'tour_points', pt.id), cleanObj(pt));
    } catch (err) {
      console.error('Error adding tour point:', err);
    }
  };
  const updateTourPoint = async (pt: TourPoint) => {
    try {
      await setDoc(doc(db, 'tour_points', pt.id), cleanObj(pt));
    } catch (err) {
      console.error('Error updating tour point:', err);
    }
  };
  const deleteTourPoint = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tour_points', id));
    } catch (err) {
      console.error('Error deleting tour point:', err);
    }
  };

  // CRUD FOR ACTIVITIES
  const addActivity = async (a: Activity) => {
    try {
      await setDoc(doc(db, 'activities', a.id), cleanObj(a));
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };
  const updateActivity = async (a: Activity) => {
    try {
      await setDoc(doc(db, 'activities', a.id), cleanObj(a));
    } catch (err) {
      console.error('Error updating activity:', err);
    }
  };
  const deleteActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  // CRUD FOR ACTIVITY PACKAGES
  const addActivityPackage = async (ap: ActivityPackage) => {
    try {
      await setDoc(doc(db, 'activity_packages', ap.id), cleanObj(ap));
    } catch (err) {
      console.error('Error adding activity package:', err);
    }
  };
  const updateActivityPackage = async (ap: ActivityPackage) => {
    try {
      await setDoc(doc(db, 'activity_packages', ap.id), cleanObj(ap));
    } catch (err) {
      console.error('Error updating activity package:', err);
    }
  };
  const deleteActivityPackage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activity_packages', id));
    } catch (err) {
      console.error('Error deleting activity package:', err);
    }
  };

  // CRUD FOR PRICES
  const addActivityPackagePrice = async (app: ActivityPackagePrice) => {
    try {
      await setDoc(doc(db, 'activity_package_prices', app.id), cleanObj(app));
    } catch (err) {
      console.error('Error adding activity package price:', err);
    }
  };
  const updateActivityPackagePrice = async (app: ActivityPackagePrice) => {
    try {
      await setDoc(doc(db, 'activity_package_prices', app.id), cleanObj(app));
    } catch (err) {
      console.error('Error updating activity package price:', err);
    }
  };
  const deleteActivityPackagePrice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activity_package_prices', id));
    } catch (err) {
      console.error('Error deleting activity package price:', err);
    }
  };

  // CRUD FOR GALLERY
  const addGalleryImage = async (imgUrl: string, activityId: string | null) => {
    const newItem: ActivityGallery = {
      id: 'gallery-' + Date.now(),
      image_url: imgUrl,
      activity_id: activityId,
      sort_order: activityGallery.length
    };
    try {
      await setDoc(doc(db, 'activity_gallery', newItem.id), cleanObj(newItem));
    } catch (err) {
      console.error('Error adding gallery image:', err);
    }
  };
  const deleteGalleryImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activity_gallery', id));
    } catch (err) {
      console.error('Error deleting gallery image:', err);
    }
  };

  // CRUD FOR HOME BANNERS
  const addHomeBanner = async (image_url: string) => {
    const newItem: HomeBanner = {
      id: 'banner-' + Date.now(),
      image_url,
      sort_order: homeBanners.length
    };
    try {
      await setDoc(doc(db, 'home_banners', newItem.id), cleanObj(newItem));
    } catch (err) {
      console.error('Error adding home banner:', err);
    }
  };
  const deleteHomeBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'home_banners', id));
    } catch (err) {
      console.error('Error deleting home banner:', err);
    }
  };

  // CRUD FOR REVIEWS
  const addReview = async (activityId: string, authorName: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: 'review-' + Date.now(),
      activity_id: activityId,
      author_name: authorName,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'reviews', newRev.id), cleanObj(newRev));

      // Update Activity Rating & count in Firestore
      const act = activities.find(a => a.id === activityId);
      if (act) {
        const count = act.review_count + 1;
        const avg = ((act.rating * act.review_count) + rating) / count;
        const updatedAct = {
          ...act,
          review_count: count,
          rating: Math.round(avg * 10) / 10
        };
        await setDoc(doc(db, 'activities', activityId), cleanObj(updatedAct));
      }
    } catch (err) {
      console.error('Error adding review:', err);
    }
  };

  // Admin Session Handlers
  const loginAdmin = (username: string, password: string): boolean => {
    if (username.toLowerCase() === 'admin' && password === 'admin') {
      const user = { username: 'admin' };
      setAdminUser(user);
      localStorage.setItem('bali_admin_user', JSON.stringify(user));
      trackAction('admin_login', `Logged in as Admin`);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('bali_admin_user');
    trackAction('admin_logout', `Admin logged out`);
  };

  const restoreDatabase = async (data: Record<string, string>) => {
    const parseOr = <T,>(val: string | null, fallback: T): T => {
      if (!val) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    // Helper to upload list to a collection in Firestore
    const uploadToFirestore = async <T extends { id: string }>(colName: string, items: T[]) => {
      for (const item of items) {
        await setDoc(doc(db, colName, item.id), cleanObj(item));
      }
    };

    const settingsVal = data['bali_tour_settings'];
    if (settingsVal) {
      const parsed = parseOr(settingsVal, settings);
      await setDoc(doc(db, 'settings', 'default'), cleanObj(parsed));
    }

    const pkgsVal = data['bali_tour_packages'];
    if (pkgsVal) {
      const parsed = parseOr(pkgsVal, tourPackages);
      await uploadToFirestore('tour_packages', parsed);
    }

    const optionsVal = data['bali_tour_package_options'];
    if (optionsVal) {
      const parsed = parseOr(optionsVal, tourPackageOptions);
      await uploadToFirestore('tour_package_options', parsed);
    }

    const pointsVal = data['bali_tour_points'];
    if (pointsVal) {
      const parsed = parseOr(pointsVal, tourPoints);
      await uploadToFirestore('tour_points', parsed);
    }

    const actsVal = data['bali_tour_activities'];
    if (actsVal) {
      const parsed = parseOr(actsVal, activities);
      await uploadToFirestore('activities', parsed);
    }

    const actPkgsVal = data['bali_tour_activity_packages'];
    if (actPkgsVal) {
      const parsed = parseOr(actPkgsVal, activityPackages);
      await uploadToFirestore('activity_packages', parsed);
    }

    const actPricesVal = data['bali_tour_activity_package_prices'];
    if (actPricesVal) {
      const parsed = parseOr(actPricesVal, activityPackagePrices);
      await uploadToFirestore('activity_package_prices', parsed);
    }

    const galleryVal = data['bali_tour_activity_gallery'];
    if (galleryVal) {
      const parsed = parseOr(galleryVal, activityGallery);
      await uploadToFirestore('activity_gallery', parsed);
    }

    const revsVal = data['bali_tour_reviews'];
    if (revsVal) {
      const parsed = parseOr(revsVal, reviews);
      await uploadToFirestore('reviews', parsed);
    }

    const logsVal = data['bali_tour_visitor_logs'];
    if (logsVal) {
      const parsed = parseOr(logsVal, visitorLogs);
      await uploadToFirestore('visitor_logs', parsed);
    }

    const bannersVal = data['bali_tour_home_banners'];
    if (bannersVal) {
      const parsed = parseOr(bannersVal, homeBanners);
      await uploadToFirestore('home_banners', parsed);
    }

    const userVal = data['bali_tour_user_name'];
    if (userVal) {
      setUserNameState(userVal);
      localStorage.setItem('bali_tour_user_name', userVal);
    }

    const greetingVal = data['bali_tour_seen_greeting'];
    if (greetingVal) {
      setHasSeenGreeting(greetingVal === 'true');
      localStorage.setItem('bali_tour_seen_greeting', greetingVal);
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        language,
        setLanguage,
        updateSettings,

        tourPackages,
        addTourPackage,
        updateTourPackage,
        deleteTourPackage,

        tourPackageOptions,
        addTourPackageOption,
        updateTourPackageOption,
        deleteTourPackageOption,

        tourPoints,
        addTourPoint,
        updateTourPoint,
        deleteTourPoint,

        activities,
        addActivity,
        updateActivity,
        deleteActivity,

        activityPackages,
        addActivityPackage,
        updateActivityPackage,
        deleteActivityPackage,

        activityPackagePrices,
        addActivityPackagePrice,
        updateActivityPackagePrice,
        deleteActivityPackagePrice,

        activityGallery,
        addGalleryImage,
        deleteGalleryImage,

        reviews,
        addReview,

        userName,
        setUserName,
        hasSeenGreeting,
        setHasSeenGreeting: handleSetHasSeenGreeting,
        visitorLogs,
        trackAction,

        isAdminLoggedIn: !!adminUser,
        loginAdmin,
        logoutAdmin,
        adminUser,

        homeBanners,
        addHomeBanner,
        deleteHomeBanner,
        restoreDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
