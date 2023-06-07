import React, { useState, useEffect, useRef } from 'react'
import "./video.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideoCamera, faVideoSlash, faEllipsisVertical, faVolumeXmark, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'

export default function Video({ peerID, stream, addVideoRef, amOwner, socket }: any) {
    const [isMenuOpened, setIsMenuOpened] = useState<any>(false);
    const [isMutedForMe, setIsMutedForMe] = useState<any>(false);
    const [isMutedForAll, setIsMutedForAll] = useState<any>(false);
    const [isCameraHiddenForAll, setIsCameraHiddenForAll] = useState<any>(false);

    const [menuPosition, setMenuPosition] = useState<any>(null);
    const [menuOrientation, setMenuOrientation] = useState<string>("above");

    const ref: any = useRef<any>();
    const menuRef: any = useRef<any>();

    useEffect(() => {
        addVideoRef(ref);
    }, []);

    useEffect(() => {
        if (!!stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        const handleOutsideClick = (e: any) => {
            if (isMenuOpened && menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpened(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMenuOpened]);

    const handleMenuClick = (e: any) => {
        e.stopPropagation();

        if (isMenuOpened) {
            setIsMenuOpened(false);
        } else {
            setIsMenuOpened(true);

            // set menu position
            const button = e.target;
            const buttonRect = button.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const menuHeight: number = 400;
            const menuWidth: number = 200;
            let top: any = buttonRect.top;
            let left: any = buttonRect.left;

            // Check if the menu goes beyond the top edge
            if (buttonRect.top - menuHeight < 0) {
                top = buttonRect.bottom;
                setMenuOrientation("below");
            }

            // Check if the menu goes beyond the right edge
            if (buttonRect.left + menuWidth > viewportWidth) {
                left = buttonRect.right - menuWidth;
                setMenuOrientation("left");
            }

            // Check if the menu goes beyond the bottom edge
            if (buttonRect.bottom + menuHeight > viewportHeight) {
                top = buttonRect.top - menuHeight;
                setMenuOrientation("above");
            }

        }
    }

    const toggleMuteForMe = (e: any) => {
        e.stopPropagation();
        setIsMutedForMe(!isMutedForMe);
        setIsMenuOpened(false);
    }

    const toggleMuteForAll = (e: any) => {
        e.stopPropagation();
        if (isMutedForAll) {
            setIsMutedForAll(false);
            socket.emit('unmuteForAll', peerID);
        } else {
            setIsMutedForAll(true);
            socket.emit('muteForAll', peerID);
        }
        setIsMenuOpened(false);
    }

    const toggleCameraForAll = (e: any) => {
        e.stopPropagation();
        if (isCameraHiddenForAll) {
            setIsCameraHiddenForAll(false);
            socket.emit('showCamForAll', peerID);
        } else {
            setIsCameraHiddenForAll(true);
            socket.emit('hideCamForAll', peerID);
        }
        setIsMenuOpened(false);
    }

    let menuOrientationClass: string = "above";
    switch (menuOrientation) {
        case 'above':
            menuOrientationClass = "videocall__videos__user-card__menu--above";
            break;
        case 'below':
            menuOrientationClass = "videocall__videos__user-card__menu--below";
            break;
        case 'left':
            menuOrientationClass = "videocall__videos__user-card__menu--left";
            break;
        default:
            menuOrientationClass = "videocall__videos__user-card__menu--above";
    }

    return (
        <div className='videocall__videos__user-card__video__container'>
            <video className="videocall__videos__user-card__video" playsInline autoPlay ref={ref}></video>
            {/* amOwner &&  */<button onClick={handleMenuClick} className={isMenuOpened ? 'videocall__videos__user-card__video__button--active' : ''}>
                <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: '20px', color: '#d6d9dc' }} />
            </button>}
            {isMenuOpened && amOwner &&
                <div
                    className={'videocall__videos__user-card__menu ' + menuOrientationClass}
                    ref={menuRef}>
                    <ul>
                        <li>
                            <button onClick={toggleMuteForMe} title='Mute only for me'>
                                <FontAwesomeIcon icon={isMutedForMe ? faVolumeHigh : faVolumeXmark} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isMutedForMe ? 'Unmute for me' : 'Unmute for all'}
                            </button>
                        </li>
                        <li>
                            <button onClick={toggleMuteForAll} title={isMutedForAll ? 'Enable microphone for all' : 'Mute microphone for everyone'}>
                                <FontAwesomeIcon icon={isMutedForAll ? faVolumeHigh : faVolumeXmark} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isMutedForAll ? 'Unmute for all' : 'Mute for everyone'}
                            </button>
                        </li>
                        <li>
                            <button onClick={toggleCameraForAll} title={isCameraHiddenForAll ? 'Show camera for everyone' : 'Hide camera for everyone'}>
                                <FontAwesomeIcon icon={isCameraHiddenForAll ? faVideoCamera : faVideoSlash} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isCameraHiddenForAll ? 'Show for everyone' : 'Hide for everyone'}
                            </button>
                        </li>
                    </ul>
                    <div className='triangle'></div>
                </div>}
            {!amOwner && <button onClick={toggleMuteForMe}><FontAwesomeIcon icon={isMutedForMe ? faVolumeXmark : faVolumeHigh} style={{ fontSize: '20px', color: '#d6d9dc' }} /></button>}

        </div>
    );
}