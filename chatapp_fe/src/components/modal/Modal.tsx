import React, { useEffect } from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

const Modal = ({ header, content, onClose }: any) => {
    useEffect(() => {
        const handleOutsideClick = (e: any) => {
            if (e.target.classList.contains('modal__overlay')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div className="modal__overlay">
            <div className="modal">
                <div className="modal__header">
                    {header}
                    <button className="modal__close-button" onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} style={{ fontSize: '25px' }} />
                    </button>
                </div>
                <div className="modal__content">{content}</div>
            </div>
        </div>
    );
};

export default Modal;