import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import "./roomInviter.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faVideoCamera, faVideoSlash, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'

export default function RoomInviter({ socket, onSubmit }: any) {
    const [videoActive, setVideoActive] = useState<boolean>(true);
    const [microphoneActive, setMicrophoneActive] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");

    const userVideo = useRef<any>(null);
    const localStream: any = useRef();
    const navigate = useNavigate();
    const { roomname } = useParams();

    const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    };

    useEffect(() => {
        initCamera();
    }, []);

    const initCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
            userVideo.current.srcObject = stream;
            localStream.current = stream;
            setVideoActive(true);
            setMicrophoneActive(true);
        } catch (err: any) {
            setVideoActive(false);
            setMicrophoneActive(false);
            console.error('Error accessing camera or microphone:', err);
        }
    };

    const handleVideoCameraBtnClick = () => {
        setVideoActive(!videoActive);
    }

    const handleMicrophoneBtnClick = () => {
        setMicrophoneActive(!microphoneActive);
    }

    const handleChange = (e: any) => {
        setUsername(e.target.value);
    }

    const handleSubmit = () => {
        if (username.trim() === "") {
            alert("Please, add a username before entering the videocall.")
            return;
        }
        onSubmit();
        navigate("/videochat/" + roomname + "/" + username);
    }

    return (
        <div className='room-inviter'>
            <div className="room-inviter__nav">
                <h1 className="landing__nav__logo">ChatApp</h1>
            </div>
            <div className="room-inviter__body">
                <div className="room-inviter__body-left">
                    <div className="room-inviter__body-left__video-card">
                        <video className="video" ref={userVideo} autoPlay playsInline></video>
                    </div>
                    <div className="room-inviter__body-left__video-controls">
                        <button
                            title={videoActive ? 'switch off camera' : 'turn on camera'}
                            onClick={handleVideoCameraBtnClick}
                            className={videoActive ? '' : 'inactive'}
                        >
                            <FontAwesomeIcon icon={videoActive ? faVideoCamera : faVideoSlash} className='icon' />
                        </button>
                        <button
                            title={microphoneActive ? 'switch off microphone' : 'turn on microphone'}
                            onClick={handleMicrophoneBtnClick}
                            className={microphoneActive ? '' : 'inactive'}>
                            <FontAwesomeIcon icon={microphoneActive ? faMicrophone : faMicrophoneSlash} className='icon' />
                        </button>
                    </div>
                </div>
                <div className="room-inviter__body-right">
                    <h3>You're about to join the videocall</h3>
                    <h2>{roomname}</h2>
                    <div className="room-creatore__form-control">
                        <label htmlFor="username" style={{ marginTop: '10px' }}>Your username:</label>
                        <input name="username" type="text" id="username" value={username} onChange={handleChange} />
                    </div>
                    <button className="room-inviter__submit-btn" onClick={handleSubmit}>Join in</button>
                </div>
            </div>
        </div>
    )
}
