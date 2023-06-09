import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import "./landingPage.css"
import banner from '../../images/banner.png';
import RoomCreator from '../../components/roomCreator/RoomCreator';
import logo from "../../images/logo.png";

export default function LandingPage({ socket, onSubmit }: any) {
    const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (isRoomModalOpen) {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = 'auto';
        }
    }, [isRoomModalOpen]);

    const toggleRoomCreatorModal = () => {
        setIsRoomModalOpen(!isRoomModalOpen);
    }

    const handleRoomSubmit = (data: any) => {
        const roomname = data.roomName;
        const username = data.username;
        onSubmit();
        navigate("/videochat/" + roomname + "/" + username);
    }

    return (
        <div className='landing'>
            <div className="landing__nav">
                <div className="landing__nav__logo">
                    <img src={logo} />
                    <h1>Bubblex</h1>
                </div>
                <button onClick={toggleRoomCreatorModal} className="landing__nav__button">Create room</button>
            </div>
            <div className="landing__content">
                <div className="landing__content-left">
                    <h1 className='landing__content-left__title'>Interactive Chat & Streaming</h1>
                    <button onClick={toggleRoomCreatorModal} className='landing__content-left__button'>Create room</button>
                </div>
                <div className="landing__content-right">
                    <img className='landing__content-right__banner' src={banner} alt="" />
                    <button onClick={toggleRoomCreatorModal} className='landing__content-right__button'>Create room</button>
                </div>
            </div>
            <div className="landing__footer"></div>
            {isRoomModalOpen && <RoomCreator onSubmit={handleRoomSubmit} onClose={toggleRoomCreatorModal} />}
        </div>
    )
}
