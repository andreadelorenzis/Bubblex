import React, { useState } from 'react'
import "./roomCreator.css"
import ErrorAlert from '../errorAlert/ErrorAlert';
import Modal from '../modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand, faHandPeace } from '@fortawesome/free-solid-svg-icons'

export default function RoomCreator({ onSubmit, onClose }: any) {
    const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState<any>({
        username: '',
        roomName: ''
    });

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (formData.roomName.trim() === "") {
            setError("Please, add a name for the room");
            return;
        }
        if (formData.username.trim() === "") {
            setError("Please, add a username so that others can identify you.");
            return;
        }

        onSubmit({
            username: formData.username,
            roomName: formData.roomName
        });
        onClose();
    }

    return (
        <>
            <Modal
                header={(
                    <div className='room-creator__header'>
                        <FontAwesomeIcon icon={faHandPeace} style={{ color: '#ffc83d', fontSize: '25px', marginRight: '10px' }} />
                        <h2>Create room</h2>
                    </div>
                )}
                content={(
                    <div className='room-creator'>
                        <div className="room-creatore__form-control">
                            <label htmlFor="username" style={{ marginTop: '10px' }}>Your username:</label>
                            <input name="username" type="text" id="username" value={formData.username} onChange={handleChange} />
                        </div>
                        <div className="room-creatore__form-control">
                            <label htmlFor="roomName" style={{ marginTop: '10px' }}>Room name:</label>
                            <input name="roomName" type="text" id="roomName" value={formData.roomName} onChange={handleChange} />
                        </div>
                        {!!error && <ErrorAlert message={error} onClose={() => { setError("") }} />}
                    </div>
                )}
                footer={(
                    <button className="room-creator__submit-btn" onClick={handleSubmit}>Create room</button>
                )}
                onClose={onClose}
            />
        </>
    )
}
