import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './errorAlert.css';

const ErrorAlert = React.memo(({ message, onClose }: any) => {
    const [show, setShow] = useState<boolean>(false);

    const fire = (message: string) => {
        setShow(true);
        alert("fired")
    };

    const handleClose = () => {
        toast.dismiss();
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {show && <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                closeOnClick
                pauseOnHover
                draggable
            />}
            {toast.error(
                <div className="error-popup">
                    <div className="error-popup-message">{message}</div>
                    <button className="error-popup-close" onClick={handleClose}>
                        Close
                    </button>
                </div>,
                {
                    closeOnClick: false,
                    closeButton: false,
                    className: 'error-popup-container',
                    draggable: true,
                }
            )}
        </>
    );
});

export default ErrorAlert;
