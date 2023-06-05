import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import "./leaveCallPage.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-solid-svg-icons'
import logo from "../../images/logo.png"

export default function LeaveCallPage({ socket }: any) {
    const { roomname, username } = useParams();
    const navigate = useNavigate();

    const handleRejoin = () => {
        socket.connect();
        navigate("/videochat/" + roomname + "/" + username);
    };

    const handleGoHome = () => {
        socket.connect();
        navigate("/");
    };

    return (
        <div className='leave'>
            <div className='leave__logo'>
                <img src={logo} />
                <h1>Bubblex</h1>
            </div>
            <h1 className='leave__subtitle'>You left the call</h1>
            <div className='leave__text__container'>
                <h2>Hope you liked it!</h2>
                <FontAwesomeIcon icon={faHand} style={{ color: '#ffc83d', fontSize: '25px', marginLeft: '15px' }} />
            </div>
            <div className="leave__buttons">
                <button className='leave__buttons__rejoin' onClick={handleRejoin}>Join in again</button>
                <button className='leave__buttons__home' onClick={handleGoHome}>Go back the home</button>
            </div>
        </div>
    )
}
