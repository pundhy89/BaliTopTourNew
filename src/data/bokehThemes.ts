export interface BokehTheme {
  id: string;
  name: string;
  gradient: string;      // CSS gradient expression for banners and overlays
  themeColor: string;    // Solid primary fallback / theme color hex
  accentColor: string;   // Accent highlight color hex
  circles: { color: string; style: string }[]; // Circles styling for producing local bokeh mesh effects
  description: string;
}

export const BOKEH_THEMES: BokehTheme[] = [
  {
    id: 'sunset_seminyak',
    name: 'Sunset Seminyak',
    gradient: 'linear-gradient(135deg, #ff007f 0%, #ff5e36 50%, #7e57c2 100%)',
    themeColor: '#ff007f',
    accentColor: '#ff5e36',
    description: 'Warna lembayung senja pesisir pantai Seminyak dengan bokeh hangat kemerahan.',
    circles: [
      { color: '#ff007f', style: 'top-[-20px] left-[-30px] w-48 h-48 opacity-60 filter blur-[35px]' },
      { color: '#ffa500', style: 'bottom-[-40px] right-[-20px] w-56 h-56 opacity-55 filter blur-[45px]' },
      { color: '#8a2be2', style: 'top-[30px] right-[20px] w-40 h-40 opacity-40 filter blur-[30px]' },
    ]
  },
  {
    id: 'ubud_rainforest',
    name: 'Ubud Rainforest',
    gradient: 'linear-gradient(135deg, #0d5c46 0%, #10b981 50%, #06b6d4 100%)',
    themeColor: '#0a7d55',
    accentColor: '#10b981',
    description: 'Kesejukan lembah Ubud dengan paduan hijau emerald mistis dan biru toska.',
    circles: [
      { color: '#10b981', style: 'top-[-30px] left-[-10px] w-52 h-52 opacity-65 filter blur-[40px]' },
      { color: '#06b6d4', style: 'bottom-[-30px] right-[-30px] w-48 h-48 opacity-50 filter blur-[35px]' },
      { color: '#fbbf24', style: 'top-[50px] right-[40px] w-36 h-36 opacity-35 filter blur-[25px]' },
    ]
  },
  {
    id: 'uluwatu_ocean',
    name: 'Uluwatu Ocean',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #3b82f6 100%)',
    themeColor: '#4f46e5',
    accentColor: '#3b82f6',
    description: 'Keindahan tebing Uluwatu menghadap samudera biru dengan kilau kosmis.',
    circles: [
      { color: '#4f46e5', style: 'top-[-25px] left-[-20px] w-52 h-52 opacity-70 filter blur-[35px]' },
      { color: '#3b82f6', style: 'bottom-[-20px] right-[-10px] w-44 h-44 opacity-60 filter blur-[30px]' },
      { color: '#ec4899', style: 'top-[40px] right-[60px] w-36 h-36 opacity-30 filter blur-[25px]' },
    ]
  },
  {
    id: 'matahari_kuta',
    name: 'Matahari Kuta',
    gradient: 'linear-gradient(135deg, #f97316 0%, #facc15 60%, #ef4444 100%)',
    themeColor: '#ea580c',
    accentColor: '#facc15',
    description: 'Teriknya mentari pantai Kuta yang eksotis dengan warna kuning-merah membara.',
    circles: [
      { color: '#f97316', style: 'top-[-10px] left-[-25px] w-48 h-48 opacity-65 filter blur-[30px]' },
      { color: '#facc15', style: 'bottom-[-40px] right-[-20px] w-56 h-56 opacity-55 filter blur-[45px]' },
      { color: '#ef4444', style: 'top-[60px] right-[20px] w-40 h-40 opacity-45 filter blur-[35px]' },
    ]
  },
  {
    id: 'awan_kintamani',
    name: 'Awan Kintamani',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #818cf8 100%)',
    themeColor: '#0284c7',
    accentColor: '#818cf8',
    description: 'Pemandangan berkabut Gunung Batur yang damai, perpaduan biru & ungu awan.',
    circles: [
      { color: '#0ea5e9', style: 'top-[-20px] left-[-20px] w-52 h-52 opacity-60 filter blur-[35px]' },
      { color: '#818cf8', style: 'bottom-[-40px] right-[-30px] w-48 h-48 opacity-55 filter blur-[30px]' },
      { color: '#a78bfa', style: 'top-[20px] right-[50px] w-36 h-36 opacity-35 filter blur-[25px]' },
    ]
  }
];
