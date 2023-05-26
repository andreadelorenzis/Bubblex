import React, { useState, useEffect, SetStateAction } from 'react';

export default function Chat({ socket }: any) {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [receiveEvents, setReceiveEvents] = useState<any[]>([]);
    const [message, setMessage] = useState<string>("");
    const [messageReceived, setMessageReceived] = useState<string>("");
    const [room, setRoom] = useState<string>("");

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onReceiveMessage(message: any) {
            console.log(message)
            setMessageReceived(message);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', onReceiveMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_message', onReceiveMessage);
        };
    }, []);

    const sendMessage = () => {
        socket.emit("send_message", { message, room });
    };

    const joinRoom = () => {
        if (room !== "") {
            socket.emit("join_room", room);
        }
    }

    const changeMessageHandler = (event: any) => {
        setMessage(event.target.value);
    }

    const changeRoomHandler = (event: any) => {
        setRoom(event.target.value);
    }

    return (
        <div>
            <input placeholder='Room number' onChange={changeRoomHandler} />
            <button onClick={joinRoom}>Join room</button>
            <input type="text" placeholder='Message' onChange={changeMessageHandler} />
            <button onClick={sendMessage}>Send message</button>
            <h1>Message: </h1>
            {messageReceived}
        </div>
    )
}
