import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import "./roomInviter.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faVideoCamera, faVideoSlash, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import ErrorAlert from '../../components/errorAlert/ErrorAlert'
import logo from '../../images/logo.png'
import { fireError } from '../../utils/appUtils'

export default function RoomInviter({ socket, onSubmit, microphoneActive, videoActive, setVideoActive, setMicrophoneActive }: any) {
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

            if (microphoneActive) {
                unmuteMic();
            } else {
                muteMic();
            }

            if (videoActive) {
                showCam();
            } else {
                hideCam();
            }
        } catch (err: any) {
            setVideoActive(false);
            setMicrophoneActive(false);
            console.error('Error accessing camera or microphone:', err);
        }
    };

    const handleVideoCameraBtnClick = () => {
        if (videoActive) {
            hideCam()
        } else {
            showCam();
        }
    }

    const handleMicrophoneBtnClick = () => {
        if (microphoneActive) {
            muteMic();
        } else {
            unmuteMic();
        }
    }

    const muteMic = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getTracks().find((track: any) => track.kind === 'audio');
            audioTrack.enabled = false;
            setMicrophoneActive(false);
        }
    }

    const unmuteMic = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getTracks().find((track: any) => track.kind === 'audio');
            audioTrack.enabled = true;
            setMicrophoneActive(true);
        }
    }

    const hideCam = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getTracks().find((track: any) => track.kind === 'video');
            videoTrack.enabled = false;
            setVideoActive(false);
        }
    }

    const showCam = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getTracks().find((track: any) => track.kind === 'video');
            videoTrack.enabled = true;
            setVideoActive(true);
        }
    }

    const handleChange = (e: any) => {
        setUsername(e.target.value);
    }

    const handleClickLogo = () => {
        hideCam();
        muteMic();
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            videoTrack.stop();
        }
        socket.disconnect();
        navigate("/");
    }

    const handleSubmit = () => {
        if (username.trim() === "") {
            fireError("Please, add a username before entering the videocall")
            return;
        }
        onSubmit();
        navigate("/videochat/" + roomname + "/" + username);
    }

    return (
        <div className='room-inviter'>
            <div className="room-inviter__nav">
                <div className="landing__nav__logo" onClick={handleClickLogo}>
                    <img src={logo} />
                    <h1>Bubblex</h1>
                </div>
            </div>
            <div className="room-inviter__body">
                <div className="room-inviter__body-left">
                    <div className="room-inviter__body-left__video-card">
                        <video className="video" ref={userVideo} autoPlay playsInline></video>
                        <div
                            className={`room-inviter__body-left__video-card__placeholder__icon ${!videoActive ? 'room-inviter__body-left__video-card__placeholder__icon--active' : ''}`}
                            style={{ backgroundColor: "white" }}
                        >
                            <FontAwesomeIcon icon={faUser} className='icon' color="black" fontSize="50px" />
                        </div>
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
                    <div className="room-inviter__form-control">
                        <label htmlFor="username" style={{ marginTop: '10px' }}>Your username:</label>
                        <input name="username" type="text" id="username" value={username} onChange={handleChange} />
                    </div>
                    <button className="room-inviter__submit-btn" onClick={handleSubmit}>Join in</button>
                </div>
            </div>
        </div>
    )
}
