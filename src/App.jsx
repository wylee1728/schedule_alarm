import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import InstallPrompt from './components/InstallPrompt';
import { useEvents } from './hooks/useEvents';
import { useNotifications } from './hooks/useNotifications';
import { usePWA } from './hooks/usePWA';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const { events, createEvent, modifyEvent, removeEvent, getEventsForDate } = useEvents();
  const { permission, isEnabled, requestPermission, scheduleNotifications } = useNotifications();
  const { canInstall, isInstalled, install } = usePWA();

  // Show install prompt if can install
  useEffect(() => {
    if (canInstall && !isInstalled) {
      setShowInstallPrompt(true);
    }
  }, [canInstall, isInstalled]);

  // Request notification permission on first load
  useEffect(() => {
    if (permission === 'default') {
      setTimeout(() => {
        requestPermission();
      }, 2000); // Wait 2 seconds before asking
    }
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Ensure form is closed when switching dates
    setShowEventForm(false);
    setEditingEvent(null);

    // Smooth scroll to schedule section on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await modifyEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }

      setShowEventForm(false);
      setEditingEvent(null);

      // Re-schedule notifications after adding/modifying
      await scheduleNotifications();
    } catch (error) {
      alert('일정 저장에 실패했습니다: ' + error.message);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('event-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteEvent = async (id) => {
    try {
      await removeEvent(id);
      // Re-schedule notifications after deleting
      await scheduleNotifications();
    } catch (error) {
      alert('일정 삭제에 실패했습니다: ' + error.message);
    }
  };

  const handleCancelForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      setShowInstallPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100 opacity-70"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗓️</span>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                  매일의 기록
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-tight">당신의 소중한 일정을 지켜드립니다</p>
              </div>
            </div>

            {/* Notification Status */}
            <div className="flex items-center gap-3">
              {!isEnabled ? (
                <button
                  onClick={requestPermission}
                  className="btn btn-primary text-xs flex items-center gap-2 shadow-lg shadow-primary-200 active:scale-95 transition-all"
                >
                  <span className="animate-bounce">🔔</span> 알림 켜기
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Banner for non-installed users */}
        {!isInstalled && (
          <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-none shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                💡
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">
                  앱으로 설치하고 알림을 받으세요
                </h3>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                  홈 화면에 추가하면 백그라운드에서도 정확한 알람을 받을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Section */}
        <section className="animate-in fade-in duration-700">
          <Calendar
            events={events}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </section>

        {/* Schedule Display Section */}
        <section id="schedule-section" className="space-y-6 min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span className="text-primary-500">
                  {format(selectedDate, 'M월 d일')}
                </span>
                <span className="text-gray-400 text-lg font-medium">
                  ({format(selectedDate, 'eeee', { locale: ko })})
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">이 날짜의 모든 일정을 확인하세요</p>
            </div>

            <div className="flex items-center gap-2">
              {!showEventForm && (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="btn btn-primary shadow-xl shadow-primary-100 flex items-center gap-2 active:scale-95 transition-all text-sm"
                >
                  <span className="text-lg">+</span> 일정 추가
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Event Form - Appears at the top if adding/editing for visual focus */}
            {showEventForm && (
              <div id="event-form-section" className="animate-in slide-in-from-top-4 fade-in duration-500">
                <EventForm
                  initialDate={selectedDate}
                  initialEvent={editingEvent}
                  onSave={handleSaveEvent}
                  onCancel={handleCancelForm}
                />
              </div>
            )}

            {/* Event List - Always visible below the form or alone */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <EventList
                events={getEventsForDate(selectedDate)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Install Prompt Overlay */}
      {showInstallPrompt && (
        <InstallPrompt
          onInstall={handleInstall}
          onDismiss={() => setShowInstallPrompt(false)}
        />
      )}

      {/* Premium Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-200/50">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 text-gray-400 font-bold tracking-tighter sm:text-lg">
            <span>MEMO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            <span>ALARM</span>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Daily Records. All rights reserved.
          </div>
          {isInstalled && (
            <div className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              PWA Mode Active
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;

