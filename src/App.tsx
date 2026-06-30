import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import MapView from './views/MapView';
import GalleryView from './views/GalleryView';
import ProfileView from './views/ProfileView';
import PackageDetailView from './views/PackageDetailView';
import ActivityDetailView from './views/ActivityDetailView';
import AdminView from './views/AdminView';
import { Home, Search, Map, Image, User, ShieldCheck } from 'lucide-react';
import { translate } from './data/translations';

// Custom hash routing hook
function useHashRoute() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string | number) => {
    if (typeof to === 'number') {
      if (historyStack.length > 0) {
        const newStack = [...historyStack];
        const prev = newStack.pop() || '/';
        setHistoryStack(newStack);
        window.location.hash = '#' + prev.replace(/^#/, '');
      } else {
        window.location.hash = '#/';
      }
    } else {
      const current = (window.location.hash || '#/').replace(/^#/, '');
      const cleanedTo = typeof to === 'string' ? to.replace(/^#/, '') : String(to);
      if (current !== cleanedTo) {
        setHistoryStack(prev => [...prev, current]);
      }
      window.location.hash = '#' + cleanedTo;
    }
  };

  return { hash: currentHash, navigate };
}

function MainApp() {
  const { hash, navigate } = useHashRoute();
  const { settings, language, isAdminLoggedIn } = useApp();

  // Simple route matched parser
  const renderCurrentView = () => {
    const currentPath = hash.replace(/^#/, '') || '/';

    if (currentPath === '/') {
      return <HomeView navigate={navigate} />;
    }
    if (currentPath === '/search') {
      return <SearchView navigate={navigate} />;
    }
    if (currentPath === '/map') {
      return <MapView navigate={navigate} />;
    }
    if (currentPath === '/gallery') {
      return <GalleryView />;
    }
    if (currentPath === '/profile') {
      return <ProfileView navigate={navigate} />;
    }
    if (currentPath.startsWith('/package/')) {
      const packageId = currentPath.split('/package/')[1];
      return <PackageDetailView id={packageId} navigate={navigate} />;
    }
    if (currentPath.startsWith('/activity/')) {
      const activityId = currentPath.split('/activity/')[1];
      return <ActivityDetailView id={activityId} navigate={navigate} />;
    }
    if (currentPath === '/admin' || currentPath === '/admin/login') {
      return <AdminView navigate={navigate} />;
    }

    // Default fallback
    return <HomeView navigate={navigate} />;
  };

  // Determine if we should show the persistent bottom menu
  const path = hash.replace(/^#/, '') || '/';
  const showBottomNav = ['/', '/search', '/map', '/gallery', '/profile'].includes(path);

  // Active navigation highlight class style helper
  const getNavClass = (target: string) => {
    const isCurrent = path === target;
    return `flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
      isCurrent ? 'font-black scale-105' : 'text-slate-400 font-semibold'
    }`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 items-center">
      {/* Centered responsive viewport container matching a high quality mobile frame */}
      <div id="bali-top-viewport" className="w-full max-w-[430px] flex flex-col h-screen max-h-[100dvh] bg-white relative shadow-2xl overflow-hidden">
        
        {/* Render Active View content */}
        {renderCurrentView()}

        {/* Persistent Bottom Nav Bar element */}
        {showBottomNav && (
          <nav className="absolute bottom-4 left-4 right-4 h-20 bg-white/95 backdrop-blur-md flex items-center justify-around z-40 shadow-[0_16px_48px_rgba(0,0,0,0.15)] rounded-[32px] px-2">
            
            {/* Beranda item */}
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-95"
            >
              <div 
                className="w-16 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{ 
                  backgroundColor: path === '/' ? `${settings.theme_color}18` : 'transparent',
                  color: path === '/' ? settings.theme_color : '#8e9aa8'
                }}
              >
                <Home size={22} className={path === '/' ? 'stroke-[2.2px]' : 'stroke-[1.8px]'} />
              </div>
              <span 
                className="text-[10px] font-semibold mt-1 tracking-wide transition-colors duration-200"
                style={path === '/' ? { color: settings.theme_color } : { color: '#8e9aa8' }}
              >
                {translate('nav_home', language)}
              </span>
            </button>

            {/* Peta item */}
            <button
              onClick={() => navigate('/map')}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-95"
            >
              <div 
                className="w-16 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{ 
                  backgroundColor: path === '/map' ? `${settings.theme_color}18` : 'transparent',
                  color: path === '/map' ? settings.theme_color : '#8e9aa8'
                }}
              >
                <Map size={22} className={path === '/map' ? 'stroke-[2.2px]' : 'stroke-[1.8px]'} />
              </div>
              <span 
                className="text-[10px] font-semibold mt-1 tracking-wide transition-colors duration-200"
                style={path === '/map' ? { color: settings.theme_color } : { color: '#8e9aa8' }}
              >
                {translate('nav_map', language)}
              </span>
            </button>

            {/* Cari item (Floating Search) - Re-positioned and styled like the reference photo */}
            <button
              onClick={() => navigate('/search')}
              className="flex flex-col items-center justify-end flex-1 h-full pb-2 relative transition-all duration-200 active:scale-95 group"
            >
              <div 
                className="absolute -top-7 w-[64px] h-[64px] rounded-full flex items-center justify-center border-[4px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 group-hover:scale-105"
                style={{ backgroundColor: settings.theme_color }}
              >
                <Search size={22} className="stroke-[2.5px] text-white" />
              </div>
              <span 
                className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                style={path === '/search' ? { color: settings.theme_color } : { color: '#8e9aa8' }}
              >
                {translate('nav_search', language)}
              </span>
            </button>

            {/* Galeri item */}
            <button
              onClick={() => navigate('/gallery')}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-95"
            >
              <div 
                className="w-16 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{ 
                  backgroundColor: path === '/gallery' ? `${settings.theme_color}18` : 'transparent',
                  color: path === '/gallery' ? settings.theme_color : '#8e9aa8'
                }}
              >
                <Image size={22} className={path === '/gallery' ? 'stroke-[2.2px]' : 'stroke-[1.8px]'} />
              </div>
              <span 
                className="text-[10px] font-semibold mt-1 tracking-wide transition-colors duration-200"
                style={path === '/gallery' ? { color: settings.theme_color } : { color: '#8e9aa8' }}
              >
                {translate('nav_gallery', language)}
              </span>
            </button>

            {/* Profil item */}
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-95"
            >
              <div 
                className="w-16 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{ 
                  backgroundColor: path === '/profile' ? `${settings.theme_color}18` : 'transparent',
                  color: path === '/profile' ? settings.theme_color : '#8e9aa8'
                }}
              >
                <div className="relative">
                  <User size={22} className={path === '/profile' ? 'stroke-[2.2px]' : 'stroke-[1.8px]'} />
                  {isAdminLoggedIn && (
                    <div className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border border-white" />
                  )}
                </div>
              </div>
              <span 
                className="text-[10px] font-semibold mt-1 tracking-wide transition-colors duration-200"
                style={path === '/profile' ? { color: settings.theme_color } : { color: '#8e9aa8' }}
              >
                {translate('nav_profile', language)}
              </span>
            </button>

          </nav>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
