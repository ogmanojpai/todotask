
'use client';

import { useState, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Select Date</h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <i className="ri-calendar-line"></i>
          </button>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-blue-500 text-white min-w-[60px]">
            <span className="text-xs font-medium mb-1">Loading...</span>
            <span className="text-sm font-semibold">--</span>
            <span className="text-xs opacity-80">--</span>
          </div>
        </div>
      </div>
    );
  }
  
  const today = new Date();
  const dates = [];
  
  for (let i = -3; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (formatDate(date) === formatDate(today)) return 'Today';
    if (formatDate(date) === formatDate(tomorrow)) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Select Date</h3>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          <i className="ri-calendar-line"></i>
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {dates.map((date) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = formatDate(date) === formatDate(new Date());
          
          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl whitespace-nowrap transition-colors min-w-[60px] ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : isToday
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs font-medium mb-1">
                {getDayName(date)}
              </span>
              <span className="text-sm font-semibold">
                {date.getDate()}
              </span>
              <span className="text-xs opacity-80">
                {formatDisplayDate(date)}
              </span>
            </button>
          );
        })}
      </div>

      {showCalendar && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateSelect(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
