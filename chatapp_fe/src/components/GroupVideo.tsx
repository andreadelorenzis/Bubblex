import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { v4 as uuidv4 } from 'uuid';

const videoConstraints = {
    width: {
        max: 300
    },
    height: {
        max: 300
    }
};

const Video = ({ peer, socketID }: any) => {
    const ref: any = useRef();

    useEffect(() => {
        peer.on("stream", (stream: any) => {
            console.log("dentro")
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <video id={socketID} className="video" playsInline autoPlay ref={ref}></video>
    );
}

export default function GroupVideo({ socket }: any) {
    const [localStream, setLocalStream] = useState<any>();
    const [peers, setPeers] = useState<any>({});
    const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
    const myVideoRef: any = useRef();
    const peerVideoRefs: any = useRef([]);
    const senders: any = useRef([]);


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false }).then((stream: any) => {
            console.log('Init local stream');
            myVideoRef.current.srcObject = stream;
            console.log(myVideoRef.current);
            setLocalStream(stream);
            init();
        }).catch(e => alert(`getusermedia error ${e.name}`))
    }, []);

    const init = () => {
        socket.on('initReceive', (socketID: any) => {
            console.log("INIT RECEIVE " + socketID);
            addPeer(socketID, false);
            socket.emit('initSend', socketID);
        });

        socket.on('initSend', (socketID: any) => {
            console.log("INIT SEND " + socketID);
            addPeer(socketID, true);
        });

        socket.on('removePeer', (socketID: any) => {
            console.log("REMOVING PEER " + socketID);
            removePeer(socketID);
        });

        socket.on('disconnect', () => {
            console.log('GOT DISCONNECTED');
            for (let socketID in peers) {
                removePeer(socketID);
            }
        });
    }

    /**
     * Creates a new peer connection and sets the event listeners
     * @param {String} socketID 
     *                 ID of the peer
     * @param {Boolean} am_initiator 
     *                  Set to true if the peer initiates the connection process.
     *                  Set to false if the peer receives the connection. 
    */
    const addPeer = (socketID: any, amInitiator: boolean) => {
        const newPeer: any = new SimplePeer({
            initiator: amInitiator,
            stream: localStream,
            config: configuration,
        });

        newPeer.on('signal', (data: any) => {
            socket.emit('signal', {
                signal: data,
                socketID: socketID
            });
        });

        newPeer.on('stream', (stream: any) => {
            console.log("STREAMING FOR " + socketID);
            setTimeout(() => {
                const videoEL: any = document.getElementById(socketID);
                videoEL.srcObject = stream;
            }, 3000);
        });

        const updatedPeers = {
            ...peers,
            [socketID]: newPeer
        }
        setPeers(updatedPeers);

        console.log(updatedPeers);
    }


    /**
     * Remove a peer with given socketID. 
     * Removes the video element and deletes the connection
     * @param {String} socketID 
    */
    const removePeer = (socketID: any) => {
        const videoEl: any = document.getElementById(socketID);
        const tracks: any = videoEl.srcObject.getTracks();
        tracks.forEach((track: any) => {
            track.stop();
        });
        videoEl.srcObject = null;
        if (peers[socketID]) peers[socketID].destroy();

        const peersCopy = { ...peers };
        delete peersCopy[socketID];
        setPeers(peersCopy);
    }

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia().then((stream: any) => {
            const screenTrack = stream.getTracks()[0];
            senders.current.find((sender: any) => sender.track.kind === 'video').replaceTrack(screenTrack);
            screenTrack.onended = function () {
                senders.current.find((sender: any) => sender.track.kind === "video").replaceTrack(myVideoRef.current.getTracks()[1]);
            }
        });
    };

    /**
     * RTCPeerConnection configuration 
     */
    const configuration = {
        // Using From https://www.metered.ca/tools/openrelay/
        "iceServers": [
            {
                urls: "stun:openrelay.metered.ca:80"
            },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject"
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject"
            },
            {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject"
            }
        ]
    }

    return (
        <div>
            {Object.keys(peers).map((peer: any, index: any) => {
                return (
                    <h1>video {index + 2}</h1>
                );
            })}
            <div>
                <h1>Video 1</h1>
                <video className="video" ref={myVideoRef} autoPlay playsInline ></video>
            </div>
            {Object.keys(peers).map((key: any, index: any) => {
                const uniqueKey = uuidv4();
                return (
                    <div key={uniqueKey}>
                        <h1>Video {index + 2}</h1>
                        <Video key={uniqueKey} peer={peers[key]} socketID={key} />
                    </div>
                );
            })}
            <button onClick={shareScreen}>Share screen</button>
        </div>
    )
}
