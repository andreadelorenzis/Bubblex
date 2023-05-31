import React, { useState } from 'react'
import "./roomCreator.css"

export default function RoomCreator({ onSubmit }: any) {
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
            alert("Please, add a name for the room");
            return;
        }
        if (formData.username.trim() === "") {
            alert("Please, add a username so that others can identify you.");
            return;
        }

        onSubmit({
            username: formData.username,
            roomName: formData.roomName
        })
    }

    return (
        <div className='room-creator'>
            <div className="room-creatore__form-control">
                <label htmlFor="username" style={{ marginTop: '10px' }}>Your username:</label>
                <input name="username" type="text" id="username" value={formData.username} onChange={handleChange} />
            </div>
            <div className="room-creatore__form-control">
                <label htmlFor="roomName" style={{ marginTop: '10px' }}>Room name:</label>
                <input name="roomName" type="text" id="roomName" value={formData.roomName} onChange={handleChange} />
            </div>
            <button className="room-creator__submit-btn" onClick={handleSubmit}>Create room</button>
        </div>
    )
}
