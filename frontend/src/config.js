export const API_BASE_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
    ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
    : (import.meta.env.DEV ? 'http://localhost:5001/api' : 'https://fiqh-files-tn61.vercel.app/api');
