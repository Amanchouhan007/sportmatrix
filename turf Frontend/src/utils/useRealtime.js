import { useEffect } from 'react';
import { getSocket } from '../services/socket';

/**
 * Subscribes to one or more Socket.IO events for the lifetime of the calling
 * component and calls `handler` when any of them fire -- typically used to
 * refetch a page's existing data-fetching function rather than duplicating
 * fetch logic. No-ops gracefully when unauthenticated (no socket) so it's
 * always safe to call from any dashboard page.
 *
 * @param {string|string[]} events
 * @param {(payload:any, eventName:string) => void} handler
 */
export default function useRealtime(events, handler) {
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return undefined;

        const eventList = Array.isArray(events) ? events : [events];
        const listeners = eventList.map(evt => {
            const fn = (payload) => handler(payload, evt);
            socket.on(evt, fn);
            return [evt, fn];
        });

        return () => {
            listeners.forEach(([evt, fn]) => socket.off(evt, fn));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Array.isArray(events) ? events.join(',') : events]);
}
