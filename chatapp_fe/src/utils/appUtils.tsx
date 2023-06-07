import ErrorAlert from "../components/errorAlert/ErrorAlert";
import { createRoot } from "react-dom/client";

export function getApiUrl() {
    if (process.env.NODE_ENV === 'development') {
        return process.env.DEV_BACKEND_URL || 'http://localhost:4000';
    } else {
        return process.env.PROD_BACKEND_URL || 'https://chatapp-lv7p.onrender.com';
    }
}

export function fireError(message: any, onClose?: any) {
    const container = document.createElement('div');
    container.classList.add('error-handler__container');
    document.body.appendChild(container);

    const errorAlert = document.createElement('div');
    errorAlert.classList.add('error-alert');
    errorAlert.innerText = message;
    container.appendChild(errorAlert);

    setTimeout(() => {
        container.style.transform = 'translate(-50%, 0)';
        setTimeout(() => {
            container.remove();
            onClose?.();
        }, 2000);
    }, 100);

    setTimeout(() => {
        container.classList.add('error-handler__container--hide');
    }, 1800);
}

