import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EventForm({ initialDate, initialEvent, onSave, onCancel }) {
    const getCurrentTime = () => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [notificationTime, setNotificationTime] = useState(getCurrentTime());

    useEffect(() => {
        if (initialEvent) {
            setTitle(initialEvent.title);
            setDate(initialEvent.date.split('T')[0]);
            setNotificationTime(initialEvent.notificationTime || getCurrentTime());
        } else if (initialDate) {
            setDate(format(initialDate, 'yyyy-MM-dd'));
            setNotificationTime(getCurrentTime());
            setTitle('');
        }
    }, [initialEvent, initialDate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('일정 제목을 입력해주세요.');
            return;
        }

        if (!date) {
            alert('날짜를 선택해주세요.');
            return;
        }

        const eventData = {
            title: title.trim(),
            date: `${date}T${notificationTime}`,
            notificationTime,
        };

        onSave(eventData);
    };

    return (
        <div className="card border-none shadow-2xl shadow-primary-100 p-6 bg-white relative overflow-hidden ring-1 ring-gray-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">
                    {initialEvent ? '✎' : '+'}
                </span>
                {initialEvent ? '일정 수정' : '새 일정 추가'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 relative">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="무엇을 도와드릴까요?"
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900"
                        />
                    </div>

                    {/* Notification Time */}
                    <div>
                        <label htmlFor="time" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Time
                        </label>
                        <input
                            id="time"
                            type="time"
                            value={notificationTime}
                            onChange={(e) => setNotificationTime(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold text-primary-600"
                        />
                    </div>
                </div>

                <div className="bg-primary-50/50 p-3 rounded-xl border border-primary-100 flex items-start gap-3 mt-2">
                    <span className="text-lg">🔔</span>
                    <p className="text-[11px] text-primary-700 leading-tight font-medium">
                        설정하신 시간에 맞춰 푸시 알림을 보내드립니다. 브라우저 알림 권한이 필요합니다.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="btn btn-primary flex-1 py-3 text-sm font-bold shadow-lg shadow-primary-200 active:scale-95 transition-all"
                    >
                        {initialEvent ? '변경사항 저장' : '일정 만들기'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn bg-gray-100 text-gray-500 hover:bg-gray-200 flex-1 py-3 text-sm font-bold active:scale-95 transition-all"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>

    );
}
