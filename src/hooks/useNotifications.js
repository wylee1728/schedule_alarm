import { useState, useEffect, useRef } from 'react';
import {
    requestNotificationPermission,
    areNotificationsEnabled,
    scheduleAllNotifications,
    cancelAllNotifications,
} from '../utils/notifications';
import { getPendingNotifications } from '../utils/db';

/**
 * Custom hook for managing notifications
 */
export function useNotifications() {
    const [permission, setPermission] = useState(
        'Notification' in window ? Notification.permission : 'denied'
    );
    const [isEnabled, setIsEnabled] = useState(areNotificationsEnabled());
    const scheduledNotifications = useRef(new Map());

    // Request permission
    const requestPermission = async () => {
        const granted = await requestNotificationPermission();
        setPermission(Notification.permission);
        setIsEnabled(granted);
        return granted;
    };

    // Schedule all pending notifications
    const scheduleNotifications = async () => {
        if (!isEnabled) {
            console.log('Notifications not enabled, skipping scheduling');
            return;
        }

        try {
            // Cancel existing notifications
            cancelAllNotifications(scheduledNotifications.current);

            // Get pending notifications from DB
            const pending = await getPendingNotifications();

            console.log('pending', pending);

            // Schedule new notifications
            const scheduled = await scheduleAllNotifications(pending);
            scheduledNotifications.current = scheduled;

            console.log(`Scheduled ${scheduled.size} notifications`);
        } catch (error) {
            console.error('Failed to schedule notifications:', error);
        }
    };

    // Re-schedule when permission changes or on mount
    useEffect(() => {
        console.log('aaaaaaaaaaaaaaaaaaaaaa', isEnabled);

        if (isEnabled) {
            scheduleNotifications();
        }

        // Re-schedule every hour (in case app stays open)
        const interval = setInterval(() => {
            if (isEnabled) {
                console.log('zzzzzzzzzzzzzzzzzzzzzzzzzz');
                scheduleNotifications();
            }
        }, 30 * 1000); // 1 minute

        return () => {
            clearInterval(interval);
            // Cancel all notifications when component unmounts
            cancelAllNotifications(scheduledNotifications.current);
        };
    }, [isEnabled]);

    return {
        permission,
        isEnabled,
        requestPermission,
        scheduleNotifications,
    };
}
