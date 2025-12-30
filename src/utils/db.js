import { openDB } from 'idb';

const DB_NAME = 'schedule-alarm-db';
const DB_VERSION = 1;
const STORE_NAME = 'events';

/**
 * Initialize IndexedDB
 */
export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: false,
                });
                // Create indexes for querying
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('isNotified', 'isNotified', { unique: false });
            }
        },
    });
}

/**
 * Get all events
 */
export async function getAllEvents() {
    const db = await initDB();
    return db.getAll(STORE_NAME);
}

/**
 * Get events by date
 */
export async function getEventsByDate(date) {
    const db = await initDB();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const allEvents = await db.getAll(STORE_NAME);
    return allEvents.filter(event => event.date.startsWith(dateStr));
}

/**
 * Get a single event by ID
 */
export async function getEvent(id) {
    const db = await initDB();
    return db.get(STORE_NAME, id);
}

/**
 * Add a new event
 */
export async function addEvent(event) {
    const db = await initDB();
    const id = event.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newEvent = {
        id,
        title: event.title,
        date: event.date,
        notificationTime: event.notificationTime || '08:00',
        isNotified: false,
        createdAt: new Date().toISOString(),
        ...event,
    };

    await db.put(STORE_NAME, newEvent);
    return newEvent;
}

/**
 * Update an existing event
 */
export async function updateEvent(id, updates) {
    const db = await initDB();
    const existing = await db.get(STORE_NAME, id);

    if (!existing) {
        throw new Error(`Event with id ${id} not found`);
    }

    const updated = {
        ...existing,
        ...updates,
        id, // Ensure ID doesn't change
    };

    await db.put(STORE_NAME, updated);
    return updated;
}

/**
 * Delete an event
 */
export async function deleteEvent(id) {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
}

/**
 * Mark event as notified
 */
export async function markAsNotified(id) {
    return updateEvent(id, { isNotified: true });
}

/**
 * Get all pending notifications (events that haven't been notified yet)
 */
export async function getPendingNotifications() {
    const db = await initDB();
    const allEvents = await db.getAll(STORE_NAME);
    const now = new Date();

    return allEvents.filter(event => {
        if (event.isNotified) return false;

        // event.date에 이미 시간이 포함되어 있을 수 있으므로 날짜 부분만 분리합니다.
        const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : event.date;
        const eventDateTime = new Date(`${datePart}T${event.notificationTime}`);

        // 디버깅을 위한 로그 (필요 시 확인 후 제거 가능)
        console.log(`[알림 체크] 일정: ${event.title}, 예정시간: ${eventDateTime.toLocaleString()}, 현재시간: ${now.toLocaleString()}`);

        // 유효한 날짜이고 현재 시간보다 미래인 경우만 반환
        return !isNaN(eventDateTime.getTime()) && eventDateTime > now;
    });
}

/**
 * Clear all events (for testing)
 */
export async function clearAllEvents() {
    const db = await initDB();
    await db.clear(STORE_NAME);
}
