import { Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

export default function Video({ socket }: any) {
    const [stream, setStream] = useState<any>();
    const [myID, setMyID] = useState<string>("");
    const [users, setUsers] = useState<any>({});
    const [receivingCall, setReceivingCall] = useState<boolean>(false);
    const [caller, setCaller] = useState<string>("");
    const [callerSignal, setCallerSignal] = useState<any>();
    const [callAccepted, setCallAccepted] = useState<boolean>(false);

    const userVideo: any = useRef();
    const partnerVideo: any = useRef();

    useEffect(() => {
        async function init() {
            const stream: any = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        }
        init();

        socket.on("myID", (id: string) => {
            setMyID(id);
            console.log(id);
        });
        socket.on("allUsers", (users: any) => {
            console.log(users);
            setUsers(users);
        });

        socket.on("hey", (data: any) => {
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
        })
    }, []);

    const callPeer = (id: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {
                iceServers: [
                    {
                        urls: "stun:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    },
                    {
                        urls: "turn:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    }
                ]
            },
            stream: stream
        });

        peer.on("signal", (data: any) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: myID
            })
        });

        peer.on('error', (err: any) => {
            console.error(err);
        })

        peer.on("stream", (stream: any) => {
            console.log(stream)
            if (partnerVideo.current) {
                partnerVideo.current.srcObject = stream;
            }
        });

        socket.on("callAccepted", (signal: any) => {
            setCallAccepted(true);
            peer.signal(signal);
        });
    }

    const acceptCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        console.log("accepting call", caller, callerSignal);

        peer.on("signal", (data: any) => {
            console.log("Signaling")
            socket.emit("acceptCall", {
                signal: data,
                to: caller
            });
        });

        peer.on("stream", (stream: any) => {
            if (partnerVideo.current) {
                partnerVideo.current.srcObject = stream;
            }
        });

        peer.signal(callerSignal);
    }



    let UserVideo: any;
    if (stream) {
        UserVideo = (
            <video className='video-player' id="user-1" autoPlay playsInline muted ref={userVideo} />
        );
    }

    let PartnerVideo: any;
    if (callAccepted) {
        PartnerVideo = (
            <video className='video-player' id="user-2" autoPlay playsInline ref={partnerVideo}></video>
        );
    }

    let incomingCall: any;
    if (receivingCall) {
        incomingCall = (
            <div>
                <h1>{caller} is calling you</h1>
                <button onClick={acceptCall}>Accept</button>
            </div>
        );
    }

    return (
        <>
            <div id="videos">
                {UserVideo}
                {PartnerVideo}
            </div>
            {
                Object.keys(users).map((key: any) => {
                    if (key === myID) {
                        return null;
                    }
                    return (
                        <button key={key} onClick={() => callPeer(key)}>Call {key}</button>
                    );
                })
            }
            {incomingCall}
        </>
    )
}
