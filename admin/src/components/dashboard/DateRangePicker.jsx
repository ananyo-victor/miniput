import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Check } from 'lucide-react';

const toISODate = (date) => date.toISOString().slice(0, 10);

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const PRESETS = [
  {
    id: 'today',
    label: 'Today',
    getRange: () => {
      const today = startOfDay(new Date());
      return { startDate: toISODate(today), endDate: toISODate(today) };
    }
  },
  {
    id: 'last7',
    label: 'Last 7 Days',
    getRange: () => {
      const end = startOfDay(new Date());
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
  },
  {
    id: 'last30',
    label: 'Last 30 Days',
    getRange: () => {
      const end = startOfDay(new Date());
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: toISODate(start), endDate: toISODate(startOfDay(now)) };
    }
  },
  {
    id: 'all',
    label: 'All Time',
    getRange: () => ({ startDate: null, endDate: null })
  }
];

// Dropdown for selecting the analytics reporting period (preset ranges or a custom range)
const DateRangePicker = ({ activePresetId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (preset) => {
    onSelect({ presetId: preset.id, label: preset.label, ...preset.getRange() });
    setOpen(false);
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    onSelect({
      presetId: 'custom',
      label: `${customStart} → ${customEnd}`,
      startDate: customStart,
      endDate: customEnd
    });
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#0e2a4a] cursor-pointer transition-colors shadow-sm hidden sm:flex items-center gap-2"
        title="Select reporting period"
      >
        <Calendar size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-50">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-['Montserrat']">Reporting Period</span>
          </div>
          <div className="py-1">
            {PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#f0f7f8] text-[#0e2a4a]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                  {isActive && <Check size={14} className="text-[#0e2a4a]" />}
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-50 px-4 py-3 flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-['Montserrat']">Custom Range</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className="flex-1 min-w-0 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#0e2a4a]"
              />
              <span className="text-gray-300 text-xs">→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="flex-1 min-w-0 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#0e2a4a]"
              />
            </div>
            <button
              type="button"
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="w-full text-xs font-black uppercase tracking-wider bg-[#0e2a4a] text-white rounded-lg py-2 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
export { PRESETS };
