import { markAsNotified } from './db';

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Check if notifications are supported and permitted
 */
export function areNotificationsEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Show a notification
 */
export function showNotification(title, options = {}) {
    console.log(`🔔🔔 FIRING NOTIFICATION for "${title}" NOW at ${new Date().toLocaleTimeString('ko-KR')}`);

    if (!areNotificationsEnabled()) {
        console.warn('Notifications are not enabled');
        return null;
    }
    console.log('Notifications are enabled');

    const defaultOptions = {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options,
    };

    // If service worker is available, use it
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            console.log('서비스 워커를 통해 알림을 띄웁니다.');
            registration.showNotification(title, defaultOptions);
        }).catch(err => {
            console.error('서비스 워커 알림 실패, 기본 방식으로 전환:', err);
            new Notification(title, defaultOptions);
        });
    } else {
        console.log('서비스 워커를 지원하지 않아 기본 알림을 사용합니다.');
        new Notification(title, defaultOptions);
    }
}

/**
 * Calculate milliseconds until notification time
 */
export function getMillisecondsUntilNotification(date, time) {
    // Extract just the date part if it's a full ISO string
    const dateStr = typeof date === 'string' ? date.split('T')[0] : date;
    const notificationDateTime = new Date(`${dateStr}T${time}`);
    const now = new Date();

    console.log(`[Time Calculation]`);
    console.log(`  Date string: ${dateStr}`);
    console.log(`  Time string: ${time}`);
    console.log(`  Full datetime: ${notificationDateTime.toISOString()}`);
    console.log(`  Current time: ${now.toISOString()}`);
    console.log(`  Milliseconds until: ${notificationDateTime.getTime() - now.getTime()}`);

    return notificationDateTime.getTime() - now.getTime();
}

/**
 * Schedule a notification for an event
 */
export function scheduleNotification(event) {
    console.log('sssssssssssssssssssssssssssssss');
    const ms = getMillisecondsUntilNotification(event.date, event.notificationTime);

    // Don't schedule if in the past
    if (ms < 0) {
        console.log(`Event ${event.id} is in the past, skipping notification`);
        return null;
    }

    // Don't schedule if too far in the future (> 24 hours)
    // We'll re-schedule when the app is opened
    const maxMs = 24 * 60 * 60 * 1000; // 24 hours
    if (ms > maxMs) {
        console.log(`Event ${event.id} is more than 24 hours away, will schedule later`);
        return null;
    }

    console.log(`Scheduling notification for ${event.title} in ${Math.round(ms / 1000 / 60)} minutes`);

    const timeoutId = setTimeout(() => {
        console.log(`🔔 FIRING NOTIFICATION for "${event.title}" NOW at ${new Date().toLocaleTimeString('ko-KR')}`);


        showNotification(`📅 ${event.title}`, {
            body: `오늘의 일정이 있습니다.`,
            tag: event.id,
            data: event,
        });

        // Mark as notified in the database
        markAsNotified(event.id).catch(err => {
            console.error('Failed to mark event as notified:', err);
        });
    }, ms);

    return timeoutId;
}

/**
 * Schedule all pending notifications
 * Returns a map of event IDs to timeout IDs
 */
export async function scheduleAllNotifications(events) {
    const scheduled = new Map();

    for (const event of events) {
        const timeoutId = scheduleNotification(event);
        if (timeoutId !== null) {
            scheduled.set(event.id, timeoutId);
        }
    }

    console.log(`Scheduled ${scheduled.size} notifications`);
    return scheduled;
}

/**
 * Cancel a scheduled notification
 */
export function cancelNotification(timeoutId) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
}

/**
 * Cancel all scheduled notifications
 */
export function cancelAllNotifications(scheduledMap) {
    scheduledMap.forEach(timeoutId => {
        clearTimeout(timeoutId);
    });
    scheduledMap.clear();
}

/**
 * Register Service Worker for background notifications
 */
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
}
