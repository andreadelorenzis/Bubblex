import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import SimplePeer from "simple-peer";

/**
 * Quando una persona accede ad una stanza in cui sono presenti altre persone, quella persona diventa l'initiator del collegamento.
 * Il nuovo arrivato notifica tutti gli altri che si è unito con l'evento 'joinVideoRoom'. A quella persona viene restituito un'array dei socket id di tutti gli altri partecipanti ('allUsers'), eccetto se stesso.  Per ognuno degli utenti ricevuti, creo
 * un nuovo peer con initiator: true, ossia invio un'offerta a tutti gli altri partecipanti di connettersi con me, mediante il metodo
 * createPeer(). Quest'azione genera subito un evento di signal, che sul server viene ricevuto. A questo punto, il server genera
 * un evento 'userJoined' che gli altri partecipanti ricevono e dopo il quale chiamano il metodo addPeer(), che permette di accettare
 * la connessione. Mediante peer.signal() viene generato l'evento 'signal', che viene catturato dagli altri partecipanti e il quale 
 * emette a sua volta l'evento 'returningSignal'. Questo viene ricevuto dal server, che invia all'iniziatore l'evento 'receivingReturnedSignal',
 * che viene catturato dall'inizatore. In corrispondenza dell'evento di accettazione da parte dei partecipanti, l'iniziatore deve cercare
 * il peer con che ha appena accettato la connessione, e accettare il segnale di ritorno, e ciò completa l'handshake.
 */

const Video = ({ peerID, stream }: any) => {
    const ref: any = useRef();

    useEffect(() => {
        console.log("Setted the stream for " + peerID);
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <video className="video" playsInline autoPlay ref={ref}></video>
    );
}

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = ({ socket }: any) => {
    const [peers, setPeers] = useState<any[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
    const userVideo: any = useRef();
    const remoteVideoRefs: any = useRef([]);
    const remotePeerRefs: any = useRef([]);
    const params: any = useParams();
    const roomID: string = params.roomID;

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false }).then((stream: any) => {
            userVideo.current.srcObject = stream;
            socket.emit("joinVideoRoom", roomID);
            socket.on("allUsers", (users: any[]) => {
                console.log("Setting the stream for the existent participants");
                const peersCopy: any[] = [];
                console.log("Now I send an offer to the other peers in the room.");
                users.forEach((userID: any) => {
                    const peer = createPeer(userID, socket.id, stream);
                    console.log("Created peer " + userID, peer);
                    peer.on('stream', (stream: any) => {
                        setRemoteStreams((prevStreams: any) => [...prevStreams, stream]);
                        console.log("Setting the stream for user " + userID);
                        setTimeout(() => {
                            const videoEl: any = document.getElementById(userID);
                            if (!!videoEl) {
                                console.log("Stream setted for user " + userID);
                                videoEl.srcObject = stream;
                            }
                        }, 2000);
                    })

                    remotePeerRefs.current.push({
                        peerID: userID,
                        peer,
                    })
                    peersCopy.push({
                        peer: peer,
                        peerID: userID
                    });
                })
                setPeers(peersCopy);
            })

            socket.on("userJoined", (payload: any) => {
                console.log(payload.callerID + " joined the room with ID:");

                const peersCopy: any[] = [...peers];

                const peer = addPeer(payload.signal, payload.callerID, stream);
                console.log("Added peer " + payload.callerID, peer);

                peer.on('stream', (stream: any) => {
                    console.log("Setting the stream for user " + payload.callerID);
                    setRemoteStreams((prevStreams: any) => [...prevStreams, stream]);
                    setTimeout(() => {
                        const videoEl: any = document.getElementById(payload.callerID);
                        if (!!videoEl) {
                            console.log("Stream setted for user " + payload.callerID)
                            videoEl.srcObject = stream;
                        }
                    }, 2000);
                })

                remotePeerRefs.current.push({
                    peerID: payload.callerID,
                    peer,
                });
                peersCopy.push({ peer: peer, peerID: payload.callerID });
                console.log("peersCopy ", peersCopy)

                setPeers((prevPeers: any[]) => [...prevPeers, { peer, peerID: payload.callerID }]);
            });

            socket.on("receivingReturnSignal", (payload: any) => {
                console.log("The user " + payload.id + " accepted my offer.");
                console.log("Now I signal back and complete the handshake with " + payload.id);
                const item = remotePeerRefs.current.find((p: any) => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    useEffect(() => {
        console.log("All peers ", peers);
    }, [peers]);

    function createPeer(userToSignal: any, callerID: any, stream: any) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (signal: any) => {
            console.log("The new peer " + callerID + " sends an offer to " + userToSignal);
            socket.emit("sendingSignal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal: any, callerID: any, stream: any) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
        })

        // Dato che initiator: false, questo evento viene generato quando viene ricevuta un offerta da un nuovo peer
        peer.on("signal", (signal: any) => {
            console.log("I answer the offer of " + callerID);
            socket.emit("returningSignal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function findUserID() {
    }

    function setRemoteVideoStream(ref: any, stream: any) {
        ref.current.srcObject = stream;
    }

    return (
        <div className="container">
            <div>
                <h1>Video 1</h1>
                <video className="video" ref={userVideo} autoPlay playsInline></video>
            </div>
            {remoteStreams.map((remoteStream: any, index: any) => {
                const uniqueKey = uuidv4();

                return (
                    <div key={uniqueKey}>
                        <h1>Video {index + 2}</h1>
                        <Video stream={remoteStream}></Video>
                    </div>
                );
            })}
        </div>
    );
};

export default Room;