import { useState, useEffect } from 'react';
import { Globe, Shield, AlertTriangle, Flame } from 'lucide-react';
import { Country, Difficulty } from '../types/game';
import { supabase } from '../lib/supabase';

interface CountrySelectionProps {
  onGameStart: (countryCode: string, difficulty: Difficulty, year: number) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; icon: typeof Shield; color: string }[] = [
  { value: 'STABLE', label: 'مستقر', icon: Shield, color: 'text-green-400' },
  { value: 'UNSTABLE', label: 'غير مستقر', icon: AlertTriangle, color: 'text-yellow-400' },
  { value: 'CIVIL WAR', label: 'حرب أهلية', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'WORLD AT WAR', label: 'حرب عالمية', icon: Flame, color: 'text-red-400' },
];

export default function CountrySelection({ onGameStart }: CountrySelectionProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('STABLE');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name_ar');

    if (error) {
      console.error('Error loading countries:', error);
    } else {
      setCountries(data || []);
    }
    setLoading(false);
  };

  const handleStart = () => {
    if (selectedCountry) {
      onGameStart(selectedCountry, selectedDifficulty, selectedYear);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/20 via-black to-black"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
      }}></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Globe className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400" style={{ fontFamily: 'Cairo, sans-serif' }}>
            النواة السيادية
          </h1>
          <div className="text-cyan-400 text-xl tracking-widest mb-2">THE SOVEREIGN CORE</div>
          <div className="text-gray-400 text-sm">إصدار القائد النهائي 2026</div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              اختيار السيادة
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`p-4 rounded border-2 transition-all duration-300 ${
                    selectedCountry === country.code
                      ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50'
                      : 'border-gray-700 hover:border-cyan-400/50 bg-gray-800/50'
                  }`}
                >
                  <div className="text-lg font-bold mb-1">{country.name_ar}</div>
                  <div className="text-xs text-gray-400">{country.code}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">مصفوفة الصعوبة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DIFFICULTIES.map((diff) => {
                const Icon = diff.icon;
                return (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value)}
                    className={`p-6 rounded border-2 transition-all duration-300 ${
                      selectedDifficulty === diff.value
                        ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50'
                        : 'border-gray-700 hover:border-cyan-400/50 bg-gray-800/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${diff.color}`} />
                    <div className="text-sm font-bold">{diff.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">اختيار السنة</h2>
            <div className="space-y-4">
              <input
                type="range"
                min="1980"
                max="2030"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-2">{selectedYear}</div>
                <div className="text-sm text-gray-400">عصر التكنولوجيا: {selectedYear < 1990 ? 'الثمانينات' : selectedYear < 2000 ? 'التسعينات' : selectedYear < 2010 ? 'الألفية' : selectedYear < 2020 ? 'العقد الثاني' : 'العقد الثالث'}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedCountry}
            className="w-full py-6 bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-cyan-400/50 disabled:shadow-none"
          >
            {selectedCountry ? 'بدء المهمة' : 'اختر دولة أولاً'}
          </button>
        </div>
      </div>
    </div>
  );
}
