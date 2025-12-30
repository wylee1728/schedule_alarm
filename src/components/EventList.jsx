import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function EventList({ events, onEdit, onDelete, selectedDate }) {
    // Filter events by selected date if provided
    const displayEvents = selectedDate
        ? events.filter(event => {
            const eventDate = event.date.split('T')[0];
            const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
            return eventDate === selectedDateStr;
        })
        : events;

    // Sort by date and time
    const sortedEvents = [...displayEvents].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    if (sortedEvents.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-500 text-lg">
                    {selectedDate
                        ? '이 날짜에 등록된 일정이 없습니다.'
                        : '등록된 일정이 없습니다.'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    달력에서 날짜를 선택하여 일정을 추가하세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {selectedDate && (
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {format(selectedDate, 'M월 d일 (eee)', { locale: ko })} 일정
                </h3>
            )}

            {sortedEvents.map((event) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();

                return (
                    <div
                        key={event.id}
                        className={`card hover:shadow-lg transition-shadow ${isPast ? 'opacity-60' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                                    <h4 className="font-bold text-gray-900 text-lg truncate">
                                        {event.title}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 ml-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">📅</span>
                                        <span className="font-medium">
                                            {format(eventDate, 'yyyy년 M월 d일 (eee)', { locale: ko })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">⏰</span>
                                        <span className="font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-[10px]">
                                            {event.notificationTime}
                                        </span>
                                    </div>

                                    {event.isNotified && (
                                        <div className="flex items-center gap-2 text-green-600 col-span-full mt-1">
                                            <span className="text-xs bg-green-100 p-0.5 rounded-full">✓</span>
                                            <span className="text-xs font-bold uppercase tracking-tighter">Notification Sent</span>
                                        </div>
                                    )}

                                    {isPast && !event.isNotified && (
                                        <div className="flex items-center gap-2 text-yellow-600 col-span-full mt-1">
                                            <span className="text-xs">⌛</span>
                                            <span className="text-xs font-bold uppercase tracking-tighter">Past Event</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0 self-center">
                                <button
                                    onClick={() => onEdit(event)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all active:scale-90"
                                    title="수정"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                                            onDelete(event.id);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                    title="삭제"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}
