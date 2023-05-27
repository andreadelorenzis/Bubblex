import React, { ReactNode, useState } from 'react'
import './videocall.css'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faVideoCamera, faMicrophone, faShareFromSquare, faMessage, faPhoneSlash } from '@fortawesome/free-solid-svg-icons'
import ChatCollapsable from '../../components/chatCollapsable/ChatCollapsable'


export default function Videocall({ socket }: any) {
    const [pinnedVideo, setPinnedVideo] = useState<any>(null);
    const [collapse, setCollapse] = useState<boolean>(true);

    const handleVideoClick = (clickedVideoId: any) => {
        if (clickedVideoId === pinnedVideo) {
            // un-pin the video
            setPinnedVideo(null);
        } else {
            // pin the video
            setPinnedVideo(clickedVideoId);
        }
    }

    const handleCollapseClick = () => {
        setCollapse((collapse: boolean) => !collapse);
    }

    const users = [
        { name: 'User1' },
        { name: 'User2' },
        { name: 'User3' },
        { name: 'User4' }
    ];

    const renderNotPinnedVideoBoxes = (): ReactNode => {
        const boxes = [];
        for (let i = 0; i < users.length; i++) {
            if (pinnedVideo !== i) {
                boxes.push(
                    <div
                        id={'' + i}
                        key={i}
                        className="videocall__videos__user-card"
                        onClick={() => handleVideoClick(i)}
                    >
                        <FontAwesomeIcon icon={faUser} />
                        <span className="videocall__user-card__name">{users[i].name}</span>
                    </div>
                );
            }
        }
        return boxes || <></>;
    };

    const renderPinnedVideoBox = (): ReactNode => {
        for (let i = 0; i < users.length; i++) {
            if (pinnedVideo === i) {
                return (
                    <div
                        id={'' + i}
                        key={i}
                        className="videocall__videos__user-card videocall__videos__user-card--active"
                        onClick={() => handleVideoClick(i)}
                    >
                        <FontAwesomeIcon icon={faUser} />
                        <span className="videocall__user-card__name">{users[i].name}</span>
                    </div>
                );
            }
        }
        return <></>
    }

    return (
        <div className='videocall'>
            <h3 className='videocall__title'>Nome stanza</h3>
            <div className={`videocall__container ${!collapse ? 'videocall__container--chat-active' : ''}`}>
                <div className="videocall__videos">
                    {
                        pinnedVideo !== null
                            ? <div className="videocall__videos__pinned">
                                {renderPinnedVideoBox()}
                            </div>
                            : <></>
                    }
                    <div className={`${pinnedVideo === null ? 'videocall__videos__not-pinned--grid' : 'videocall__videos__not-pinned--row'}`}>
                        {renderNotPinnedVideoBoxes()}
                    </div>
                </div>
                <div className="videocall__buttons">
                    <button><FontAwesomeIcon icon={faVideoCamera} /></button>
                    <button><FontAwesomeIcon icon={faMicrophone} /></button>
                    <button><FontAwesomeIcon icon={faShareFromSquare} /></button>
                    <button><FontAwesomeIcon icon={faPhoneSlash} /></button>
                </div>
            </div>
            <ChatCollapsable collapse={collapse} onCollapse={handleCollapseClick} />
        </div>
    )
}
