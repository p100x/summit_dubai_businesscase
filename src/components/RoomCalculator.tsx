'use client';

import { useState } from 'react';

interface RoomData {
  standardRooms: number;
  suites: number;
}

export default function RoomCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomData, setRoomData] = useState<Record<string, RoomData>>(() => {
    const initial: Record<string, RoomData> = {
      '2025-11-12': { standardRooms: 0, suites: 0 },
      '2025-11-13': { standardRooms: 50, suites: 10 },
      '2025-11-14': { standardRooms: 60, suites: 10 },
      '2025-11-15': { standardRooms: 60, suites: 10 },
      '2025-11-16': { standardRooms: 50, suites: 10 },
      '2025-11-17': { standardRooms: 0, suites: 0 },
      '2025-11-18': { standardRooms: 0, suites: 0 }
    };
    return initial;
  });

  const contractualTotal = 263;

  const updateRoomData = (date: string, field: keyof RoomData, value: number) => {
    setRoomData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value
      }
    }));
  };

  const getDayTotal = (date: string) => {
    const data = roomData[date];
    return data.standardRooms + data.suites;
  };

  const getOverallTotal = () => {
    return Object.values(roomData).reduce((total, data) => 
      total + data.standardRooms + data.suites, 0
    );
  };

  const getOverallStandardTotal = () => {
    return Object.values(roomData).reduce((total, data) => 
      total + data.standardRooms, 0
    );
  };

  const getOverallSuitesTotal = () => {
    return Object.values(roomData).reduce((total, data) => 
      total + data.suites, 0
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const overallTotal = getOverallTotal();
  const adjustedTotal = overallTotal + 3; // Royal Suite adjustment
  const difference = adjustedTotal - contractualTotal;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left hover:bg-zinc-50/50 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Zimmerrechner</h2>
          <div className="flex items-center gap-3">
            {!isOpen && (
              <div className="text-sm text-zinc-600">
                Gesamt: {adjustedTotal} ({difference > 0 ? '+' : ''}{difference} vs Vertrag)
              </div>
            )}
            <svg
              className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="p-3 text-left text-sm font-medium text-zinc-700">Datum</th>
              <th className="p-3 text-center text-sm font-medium text-zinc-700">Standard Rooms</th>
              <th className="p-3 text-center text-sm font-medium text-zinc-700">Suiten</th>
              <th className="p-3 text-center text-sm font-medium text-zinc-700">Tagesgesamt</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(roomData).map(date => (
              <tr key={date} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                <td className="p-3 font-medium text-zinc-800">
                  {formatDate(date)}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    value={roomData[date].standardRooms}
                    onChange={(e) => updateRoomData(date, 'standardRooms', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-zinc-200 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    value={roomData[date].suites}
                    onChange={(e) => updateRoomData(date, 'suites', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-zinc-200 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white"
                  />
                </td>
                <td className="p-3 text-center font-semibold bg-zinc-50/50 text-zinc-800">
                  {getDayTotal(date)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50/30 border-t-2 border-emerald-200">
              <td className="p-3 font-bold text-emerald-700">Gesamtsumme</td>
              <td className="p-3 text-center font-bold text-emerald-700">{getOverallStandardTotal()}</td>
              <td className="p-3 text-center font-bold text-emerald-700">{getOverallSuitesTotal()}</td>
              <td className="p-3 text-center font-bold text-emerald-700 text-lg">{overallTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50/50 via-zinc-50/30 to-teal-50/50 rounded-xl border border-emerald-100">
        <h3 className="font-semibold mb-4 text-zinc-700">Vertragsvergleich</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-sm text-zinc-500 mb-1">Eingegeben</div>
            <div className="text-2xl font-bold text-zinc-800">
              {overallTotal}
              <span className="text-xs text-emerald-600 ml-1">+3</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-sm text-zinc-500 mb-1">Vertraglich vereinbart</div>
            <div className="text-2xl font-bold text-zinc-800">{contractualTotal}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-sm text-zinc-500 mb-1">Differenz</div>
            <div className={`text-2xl font-bold ${
              difference > 0 
                ? 'text-red-600' 
                : difference < 0 
                ? 'text-emerald-600' 
                : 'text-zinc-800'
            }`}>
              {difference > 0 ? '+' : ''}{difference}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            difference > 0 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : difference < 0 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              difference > 0 
                ? 'bg-red-500' 
                : difference < 0 
                ? 'bg-emerald-500'
                : 'bg-zinc-500'
            }`} />
            {difference > 0 ? 'Überbuchung' : difference < 0 ? 'Unterbuchung' : 'Genau auf Vertrag'}
          </span>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}