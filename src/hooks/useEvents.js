import { useState, useEffect } from 'react';
import { getAllEvents, addEvent, updateEvent, deleteEvent } from '../utils/db';

/**
 * Custom hook for managing events
 */
export function useEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load all events from IndexedDB
    const loadEvents = async () => {
        try {
            setLoading(true);
            const allEvents = await getAllEvents();
            setEvents(allEvents);
            setError(null);
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadEvents();
    }, []);

    // Add a new event
    const createEvent = async (eventData) => {
        try {
            const newEvent = await addEvent(eventData);
            setEvents(prev => [...prev, newEvent]);
            return newEvent;
        } catch (err) {
            console.error('Failed to create event:', err);
            setError(err.message);
            throw err;
        }
    };

    // Update an existing event
    const modifyEvent = async (id, updates) => {
        try {
            const updated = await updateEvent(id, updates);
            setEvents(prev => prev.map(e => e.id === id ? updated : e));
            return updated;
        } catch (err) {
            console.error('Failed to update event:', err);
            setError(err.message);
            throw err;
        }
    };

    // Delete an event
    const removeEvent = async (id) => {
        try {
            await deleteEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError(err.message);
            throw err;
        }
    };

    // Get events for a specific date
    const getEventsForDate = (date) => {
        if (!date) return events;

        // Use local date string (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        return events.filter(event => event.date.startsWith(dateStr));
    };

    return {
        events,
        loading,
        error,
        createEvent,
        modifyEvent,
        removeEvent,
        getEventsForDate,
        refreshEvents: loadEvents,
    };
}
