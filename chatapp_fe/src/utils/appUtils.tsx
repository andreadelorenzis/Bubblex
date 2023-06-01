export function getApiUrl() {
    if (process.env.NODE_ENV === 'development') {
        return process.env.DEV_BACKEND_URL || 'http://localhost:4000';
    } else {
        return process.env.PROD_BACKEND_URL || 'https://chatapp-lv7p.onrender.com';
    }
}
