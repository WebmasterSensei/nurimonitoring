"use client";
import { useState, useEffect, useMemo, useRef } from "react";

interface NutritionItem {
  id: string; // Added for unique tracking
  name: string;
  calories: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  serving_size_g: number;
}

export default function NutritionApp() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<NutritionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nutrition_history");
    if (saved) setHistory(JSON.parse(saved));
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Save to LocalStorage when history changes
  useEffect(() => {
    localStorage.setItem("nutrition_history", JSON.stringify(history));
  }, [history]);

  // 3. Calculate Totals
  const totals = useMemo(() => {
    return history.reduce((acc, item) => ({
      cal: acc.cal + item.calories,
      pro: acc.pro + item.protein_g,
      carb: acc.carb + item.carbohydrates_total_g,
      fat: acc.fat + item.fat_total_g,
    }), { cal: 0, pro: 0, carb: 0, fat: 0 });
  }, [history]);

  async function searchNutrition(customQuery?: string) {
    const searchQuery = customQuery || query;
    if (!searchQuery) return;
    
    setLoading(true);
    setShowDropdown(false);
    try {
      const res = await fetch(`/api/nutrition?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        // Add new items with unique IDs
        const newItems = data.items.map((item: any) => ({
          ...item,
          id: `${item.name}-${Date.now()}-${Math.random()}`
        }));
        setHistory(prev => [...newItems, ...prev]);
        setQuery("");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const removeItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm("Clear all logs?")) setHistory([]);
  };

  // Filter history for dropdown suggestions
  const suggestions = useMemo(() => {
    if (!query) return [];
    return Array.from(new Set(history.map(h => h.name)))
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, history]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero & Search Section */}
        <section className="mb-12 relative" ref={dropdownRef}>
          <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
           Nutri Monitoring
          </h1>
          
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={query}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onKeyDown={(e) => e.key === "Enter" && searchNutrition()}
              placeholder="Search food (e.g. 2 eggs)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button 
              onClick={() => searchNutrition()}
              className="bg-emerald-600 hover:bg-emerald-500 px-5 lg:px-8 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
            >
              {loading ? "..." : "Add"}
            </button>

            {/* Search Dropdown Suggestions */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden z-50 shadow-2xl">
                {suggestions.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(name); searchNutrition(name); }}
                    className="w-full text-left px-6 py-3 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition-colors"
                  >
                    🔍 <span className="ml-2 capitalize">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Calories" value={totals.cal} unit="kcal" color="text-emerald-400" />
          <StatCard label="Protein" value={totals.pro} unit="g" color="text-blue-400" />
          <StatCard label="Carbs" value={totals.carb} unit="g" color="text-amber-400" />
          <StatCard label="Fat" value={totals.fat} unit="g" color="text-rose-400" />
        </section>

        {/* Food List */}
        <section className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Today's Log</h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-xs text-rose-500 hover:underline">Clear All</button>
            )}
          </div>
          
          <div className="divide-y divide-slate-800">
            {history.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                <div>
                  <h4 className="font-bold capitalize">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.serving_size_g}g serving</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-mono text-emerald-400">{item.calories.toFixed(0)} kcal</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      P: {item.protein_g}g | C: {item.carbohydrates_total_g}g | F: {item.fat_total_g}g
                    </p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-600 hover:text-rose-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-20 text-center text-slate-600 italic">No food logged yet today.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-inner">
      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>
        {value.toFixed(0)}<span className="text-xs ml-1 font-normal opacity-70">{unit}</span>
      </p>
    </div>
  );
}