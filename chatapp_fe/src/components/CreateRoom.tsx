import React from 'react';
import { v1 as uuid } from "uuid";
import { useNavigate } from 'react-router-dom';

export default function CreateRoom(props: any) {
    const navigate: any = useNavigate();

    function create() {
        const id = uuid();
        navigate(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create room</button>
    )
}
