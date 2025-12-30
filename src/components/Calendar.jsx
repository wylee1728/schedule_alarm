import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Calendar({ events, onDateClick, selectedDate }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad with previous month days to start on Sunday
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(monthStart);
        date.setDate(date.getDate() - i - 1);
        prevMonthDays.push(date);
    }

    // Pad with next month days to end on Saturday
    const lastDayOfWeek = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
        const date = new Date(monthEnd);
        date.setDate(date.getDate() + i);
        nextMonthDays.push(date);
    }

    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

    // Check if a date has events
    const hasEvents = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return events.some(event => event.date.startsWith(dateStr));
    };

    // Get number of events for a date
    const getEventCount = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return events.filter(event => event.date.startsWith(dateStr)).length;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    return (
        <div className="card border-none shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                    </h2>
                    <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-0.5">Monthly Overview</p>
                </div>
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={handlePrevMonth}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-lg shadow-sm transition-all active:scale-95"
                        aria-label="이전 달"
                    >
                        ‹
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-4 h-10 flex items-center justify-center bg-white hover:bg-primary-50 text-gray-600 hover:text-primary-600 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                    >
                        오늘
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-lg shadow-sm transition-all active:scale-95"
                        aria-label="다음 달"
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="p-4">
                {/* Week days header */}
                <div className="grid grid-cols-7 mb-4">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                        <div
                            key={day}
                            className={`text-center text-[10px] font-black py-2 tracking-widest ${index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {allDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const hasEvent = hasEvents(day);
                        const eventCount = getEventCount(day);
                        const dayOfWeek = day.getDay();

                        return (
                            <button
                                key={index}
                                onClick={() => onDateClick(day)}
                                className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300
                    ${!isCurrentMonth ? 'text-gray-200' : ''}
                    ${isTodayDate && !isSelected ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-100 ring-offset-2' : ''}
                    ${isSelected ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 scale-105 z-10' : ''}
                    ${!isTodayDate && !isSelected && isCurrentMonth ? 'hover:bg-gray-50' : ''}
                    ${dayOfWeek === 0 && isCurrentMonth && !isSelected ? 'text-red-500' : ''}
                    ${dayOfWeek === 6 && isCurrentMonth && !isSelected ? 'text-blue-500' : ''}
                    ${isCurrentMonth && !isSelected && !isTodayDate ? 'text-gray-700' : ''}
                  `}
                            >
                                <span className={`text-sm font-bold ${isSelected ? 'scale-110' : ''}`}>
                                    {format(day, 'd')}
                                </span>

                                {/* Event indicator */}
                                {hasEvent && (
                                    <div className="absolute bottom-2 flex gap-0.5">
                                        {eventCount === 1 ? (
                                            <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-400 animate-pulse'}`} />
                                        ) : (
                                            <div className="flex gap-0.5">
                                                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-400'}`} />
                                                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-300'}`} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

    );
}
