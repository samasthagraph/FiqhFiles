const memoryStore = new Map();

export const clientCache = {
    get(key) {
        if (memoryStore.has(key)) {
            return memoryStore.get(key);
        }
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                memoryStore.set(key, parsed);
                return parsed;
            }
        } catch {
            // Ignore storage errors
        }
        return null;
    },
    set(key, value) {
        memoryStore.set(key, value);
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore quota errors
        }
    },
    findQuestion(id) {
        for (const [, value] of memoryStore.entries()) {
            if (Array.isArray(value)) {
                const match = value.find(q => (q._id === id || String(q.id) === String(id)));
                if (match) return match;
            }
        }
        return null;
    },
    clear() {
        memoryStore.clear();
        try {
            sessionStorage.clear();
        } catch {
            // Ignore storage errors
        }
    }
};
