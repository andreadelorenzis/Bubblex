import React, { ReactNode, useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './videocall.css'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faVideoCamera, faMicrophone, faShareFromSquare, faMessage, faPhoneSlash, faMicrophoneSlash, faVideoSlash, faEllipsisVertical, faVolumeXmark, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import ChatCollapsable from '../../components/chatCollapsable/ChatCollapsable'
import { v4 as uuidv4 } from 'uuid';
import SimplePeer from "simple-peer";

/**
 * Considerazioni:
 * 1) Le informazioni sui peer vengono salvate in due array: il primo "remotePeerRefs" è un array di riferimenti
 * che viene usato per gestire la logica di connessione tra peer; il secondo "peers" è un array nello stato che 
 * viene usato per visualizzare gli elementi sullo schermo, come ad esempio i nomi dei vari utenti
 */

const Video = ({ peerID, stream, addVideoRef, amOwner, socket }: any) => {
    const [isMenuOpened, setIsMenuOpened] = useState<any>(false);
    const [isMutedForMe, setIsMutedForMe] = useState<any>(false);
    const [isMutedForAll, setIsMutedForAll] = useState<any>(false);
    const [isCameraHiddenForAll, setIsCameraHiddenForAll] = useState<any>(false);

    const [menuPosition, setMenuPosition] = useState<any>(null);
    const [menuOrientation, setMenuOrientation] = useState<string>("above");

    const ref: any = useRef<any>();
    const menuRef: any = useRef<any>();

    useEffect(() => {
        addVideoRef(ref);
        console.log(amOwner)
    }, []);

    useEffect(() => {
        if (!!stream) {
            console.log("Setted the stream for " + peerID);
            console.log("Video remote stream ", stream)
            ref.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        const handleOutsideClick = (e: any) => {
            if (isMenuOpened && menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpened(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMenuOpened]);

    const handleMenuClick = (e: any) => {
        e.stopPropagation();

        if (isMenuOpened) {
            setIsMenuOpened(false);
        } else {
            setIsMenuOpened(true);

            // set menu position
            const button = e.target;
            const buttonRect = button.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const menuHeight: number = 400;
            const menuWidth: number = 200;
            let top: any = buttonRect.top;
            let left: any = buttonRect.left;

            // Check if the menu goes beyond the top edge
            if (buttonRect.top - menuHeight < 0) {
                top = buttonRect.bottom;
                setMenuOrientation("below");
            }

            // Check if the menu goes beyond the right edge
            if (buttonRect.left + menuWidth > viewportWidth) {
                left = buttonRect.right - menuWidth;
                setMenuOrientation("left");
            }

            // Check if the menu goes beyond the bottom edge
            if (buttonRect.bottom + menuHeight > viewportHeight) {
                top = buttonRect.top - menuHeight;
                setMenuOrientation("above");
            }

        }
    }

    const toggleMuteForMe = (e: any) => {
        e.stopPropagation();
        setIsMutedForMe(!isMutedForMe);
        setIsMenuOpened(false);
    }

    const toggleMuteForAll = (e: any) => {
        e.stopPropagation();
        if (isMutedForAll) {
            setIsMutedForAll(false);
            socket.emit('unmuteForAll', peerID);
        } else {
            setIsMutedForAll(true);
            socket.emit('muteForAll', peerID);
        }
        setIsMenuOpened(false);
    }

    const toggleCameraForAll = (e: any) => {
        e.stopPropagation();
        if (isCameraHiddenForAll) {
            setIsCameraHiddenForAll(false);
            socket.emit('showCamForAll', peerID);
        } else {
            setIsCameraHiddenForAll(true);
            socket.emit('hideCamForAll', peerID);
        }
        setIsMenuOpened(false);
    }

    let menuOrientationClass: string = "above";
    switch (menuOrientation) {
        case 'above':
            menuOrientationClass = "videocall__videos__user-card__menu--above";
            break;
        case 'below':
            menuOrientationClass = "videocall__videos__user-card__menu--below";
            break;
        case 'left':
            menuOrientationClass = "videocall__videos__user-card__menu--left";
            break;
        default:
            menuOrientationClass = "videocall__videos__user-card__menu--above";
    }

    return (
        <div className='videocall__videos__user-card__video__container'>
            <video className="videocall__videos__user-card__video" playsInline autoPlay ref={ref}></video>
            {/* amOwner &&  */<button onClick={handleMenuClick} className={isMenuOpened ? 'videocall__videos__user-card__video__button--active' : ''}>
                <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: '20px', color: '#d6d9dc' }} />
            </button>}
            {isMenuOpened && amOwner &&
                <div
                    className={'videocall__videos__user-card__menu ' + menuOrientationClass}
                    ref={menuRef}>
                    <ul>
                        <li>
                            <button onClick={toggleMuteForMe} title='Mute only for me'>
                                <FontAwesomeIcon icon={isMutedForMe ? faVolumeHigh : faVolumeXmark} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isMutedForMe ? 'Unmute for me' : 'Unmute for all'}
                            </button>
                        </li>
                        <li>
                            <button onClick={toggleMuteForAll} title={isMutedForAll ? 'Enable microphone for all' : 'Mute microphone for everyone'}>
                                <FontAwesomeIcon icon={isMutedForAll ? faVolumeHigh : faVolumeXmark} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isMutedForAll ? 'Unmute for all' : 'Mute for everyone'}
                            </button>
                        </li>
                        <li>
                            <button onClick={toggleCameraForAll} title={isCameraHiddenForAll ? 'Show camera for everyone' : 'Hide camera for everyone'}>
                                <FontAwesomeIcon icon={isCameraHiddenForAll ? faVideoCamera : faVideoSlash} style={{ fontSize: '15px', color: '#d6d9dc', marginRight: '10px' }} />
                                {isCameraHiddenForAll ? 'Show for everyone' : 'Hide for everyone'}
                            </button>
                        </li>
                    </ul>
                    <div className='triangle'></div>
                </div>}
            {!amOwner && <button onClick={toggleMuteForMe}><FontAwesomeIcon icon={isMutedForMe ? faVolumeXmark : faVolumeHigh} style={{ fontSize: '20px', color: '#d6d9dc' }} /></button>}

        </div>
    );
}

export default function Videocall({ socket, amOwner, amInvited, initVideoValue, initMicValue }: any) {
    const [pinnedVideo, setPinnedVideo] = useState<any>(null);
    const [collapse, setCollapse] = useState<boolean>(true);
    const [videoActive, setVideoActive] = useState<boolean>(true);
    const [microphoneActive, setMicrophoneActive] = useState<boolean>(true);
    const [showControls, setShowControls] = useState<boolean>(true);
    const [mouseMoved, setMouseMoved] = useState<boolean>(false);
    const [screenShared, setScreenShared] = useState<boolean>(false);
    const [myUser, setMyUser] = useState<any>({});
    const [initVideo, setInitVideo] = useState<any>(null);
    const [screenShareStream, setScreenShareStream] = useState<any>(null);

    const [isMicMutedByAdmin, setIsMicMutedByAdmin] = useState<boolean>(false);
    const [isCameraHiddenByAdmin, setIsCameraHiddenByAdmin] = useState<boolean>(false);

    const localStream: any = useRef();
    const userVideo: any = useRef();

    const [users, setUsers] = useState<any[]>([]);
    const [pinnedUser, setPinnedUser] = useState<any>(null);
    const [notPinnedUsers, setNotPinnedUsers] = useState<any[]>([]);
    const [peers, setPeers] = useState<any[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
    const remoteVideoRefs: any = useRef([]);
    const remotePeerRefs: any = useRef([]);

    const iceServers: any = [
        {
            urls: "stun:stun.l.google.com:19302",
        },
        {
            urls: "stun:stun2.l.google.com:19305",
        },
        {
            urls: "stun:stun3.l.google.com:19305",
        },
    ]

    const navigate = useNavigate();

    const { roomname, username }: any = useParams();
    const roomID: string = roomname;

    const MAX_USERS_NUM = 4;

    const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    };

    useEffect(() => {
        if (userVideo.current) {
            userVideo.current.srcObject = localStream.current;
        }
    }, [pinnedVideo, notPinnedUsers, users, initVideo]);

    useEffect(() => {
        if (!amOwner && !amInvited) {
            navigate("/inviter/" + roomID);
            return;
        }

        const initCamera = () => {
            console.log("Dentro 1")
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then((stream: any) => {
                console.log("Dentro 2")
                localStream.current = stream;

                if (initMicValue === true) {
                    unmuteMic();
                } else {
                    muteMic();
                }

                if (initVideoValue === true) {
                    showCam();
                } else {
                    hideCam();
                }

                setInitVideo(<video id={uuidv4()} className="videocall__videos__user-card__video" ref={userVideo} autoPlay playsInline></video>)

                socket.emit("joinRoom", {
                    roomID: roomID,
                    username: username
                });

                console.log(username + ' joined room ' + roomID)
                socket.once("allUsers", (data: any) => {
                    console.log("dentro 3")
                    console.log("Setting the stream for the existent participants");
                    const usersList: any[] = data.users;
                    console.log("Received users", data.users)
                    const myUser: any = data.myUser;
                    // Creating all the users
                    setUsers(usersList);
                    setMyUser(myUser);
                    setNotPinnedUsers(usersList);
                    console.log(data);

                    const peersCopy: any[] = [];
                    console.log("Now I send an offer to the other peers in the room.");

                    const otherUsers: any[] = usersList.filter((user: any) => user.id !== myUser.id);
                    otherUsers.forEach((user: any) => {
                        const userID = user.id;
                        const { peer, cleanup }: any = createPeer(userID, myUser, stream);
                        console.log("Created peer " + userID, peer);
                        peer.on('stream', (stream: any) => {
                            setRemoteStreams((prevStreams: any) => [...prevStreams, {
                                userID: userID,
                                stream: stream
                            }]);
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
                            cleanup
                        })
                        peersCopy.push({
                            peer: peer,
                            peerID: userID
                        });
                    })
                    setPeers(peersCopy);
                })

                socket.on("muteMic", () => {
                    muteMic();
                    setIsMicMutedByAdmin(true);
                });

                socket.on("unmuteMic", () => {
                    unmuteMic();
                    setIsMicMutedByAdmin(false);
                });

                socket.on("hideCam", () => {
                    hideCam();
                    setIsCameraHiddenByAdmin(true);
                });

                socket.on("showCam", () => {
                    showCam();
                    setIsCameraHiddenByAdmin(false);
                });

                socket.on("userJoined", handleUserJoined);
                socket.on("receivingReturnSignal", handleReceivingReturnSignal);

            })
        }

        const handleUserJoined = (payload: any) => {
            const signal = payload.signal;
            const caller = payload.caller;

            console.log(caller.id + " joined the room with ID:");

            const peersCopy: any[] = [...peers];

            const { peer, cleanup }: any = addPeer(signal, caller, localStream.current);
            console.log("Added peer " + caller.id, peer);

            setUsers((prevUsers: any[]) => [...prevUsers, caller]);
            setNotPinnedUsers((prevUsers: any[]) => [...prevUsers, caller]);

            if (!peer) {
                return;
            }

            peer.on('stream', (stream: any) => {
                console.log("Setting the stream for user " + caller.id);
                setRemoteStreams((prevStreams: any) => [...prevStreams, {
                    userID: caller.id,
                    stream: stream
                }]);
                setTimeout(() => {
                    const videoEl: any = document.getElementById(caller.id);
                    if (!!videoEl) {
                        console.log("Stream setted for user " + caller.id)
                        videoEl.srcObject = stream;
                    }
                }, 2000);
            })

            remotePeerRefs.current.push({
                peerID: caller.id,
                peer,
                cleanup
            });
            peersCopy.push({ peer: peer, peerID: caller.id });
            console.log("peersCopy ", peersCopy)

            setPeers((prevPeers: any[]) => [...prevPeers, { peer, peerID: caller.id }]);
        }

        const handleReceivingReturnSignal = (payload: any) => {
            console.log("The user " + payload.id + " accepted my offer.");
            console.log("Now I signal back and complete the handshake with " + payload.id);
            const item = remotePeerRefs.current.find((p: any) => p.peerID === payload.id);

            if (item.peer.signalingState === "stable") {
                console.log("Connection is already stable, ignoring the remote answer.");
                return;
            }

            item.peer.signal(payload.signal);
        }

        initCamera();

        return () => {
            socket.off("userJoined", handleUserJoined);
            socket.off("receivingReturnSignal", handleReceivingReturnSignal);

            console.log("Cleaning up peers...");
            remotePeerRefs.current.forEach((p: any) => {
                try {
                    p.peer.destroy();
                    p.cleanup();
                } catch (error) {
                    console.error("Error on destroy: ", error);
                }
            });

        };


    }, []);

    useEffect(() => {
        console.log("All peers ", peers);
        console.log("All users ", users);
        console.log("All remote streams ", remoteStreams);
    }, [peers, users, remoteStreams]);


    useEffect(() => {
        const handleMouseMove = () => {
            setMouseMoved(true);
            setShowControls(true);
        };

        const handleMouseTimeout = () => {
            if (!mouseMoved) {
                setShowControls(false);
            }
            setMouseMoved(false);
        };

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        const timeoutId = setTimeout(handleMouseTimeout, 2000); // Set your desired timeout

        // Clean up event listeners and timeout
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, [mouseMoved]);

    useEffect(() => {
        async function removePeer(id: any) {
            console.log("User " + id + " has LEFT the videocall.");
            console.log("Users: ", users);
            const peerObj = remotePeerRefs.current.find((p: any) => p.peerID === id);
            const userObj = users.find((u: any) => u.id === id);
            console.log("User to delete ", userObj);

            if (peerObj) {
                console.log("DESTROY CONNECTION for " + peerObj.peerID);
                try {
                    await peerObj.peer.destroy();
                    const updatedPeerRefs = remotePeerRefs.current.filter((p: any) => p.peerID !== id);
                    remotePeerRefs.current = updatedPeerRefs;
                } catch (error: any) {
                    console.error("Error on destroy: ", error);
                }
            }

            const updatedPeers = peers.filter((p: any) => p.peerID !== id);
            const updatedUsers = users.filter((u: any) => u.id !== id);
            const updatedRemoteStreams = remoteStreams.filter((s: any) => s.userID !== id);

            setPeers(updatedPeers);
            setUsers(updatedUsers);
            console.log("UPDATED USERS ", updatedUsers)
            setRemoteStreams(updatedRemoteStreams);

            // Check if user was pinned or not
            if (!!pinnedUser && pinnedUser.id === id) {
                setPinnedUser(null);
            } else {
                setNotPinnedUsers(updatedUsers);
            }
        }

        const handleUserLeft = (id: any) => {
            removePeer(id);
        }

        socket.on("userLeft", handleUserLeft);

        return (() => {
            socket.off("userLeft", handleUserLeft);
        })

    }, [users, remotePeerRefs, peers, setPeers, setUsers, setNotPinnedUsers, setRemoteStreams, pinnedUser]);


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

    function createPeer(userToSignalID: any, caller: any, stream: any) {
        const callerID: any = caller.id;

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
            config: {
                iceServers: iceServers
            }
        });

        const handleSignal = (signal: any) => {
            console.log("The new peer " + callerID + " sends an offer to " + userToSignalID);
            socket.emit("sendingSignal", { userToSignalID, caller, signal })
        };

        peer.on("signal", handleSignal);

        const cleanup = () => {
            peer.off("signal", handleSignal);
        };

        return { peer, cleanup };
    }

    function addPeer(incomingSignal: any, caller: any, stream: any) {
        if (users.length >= MAX_USERS_NUM) {
            return;
        }

        const callerID = caller.id;

        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: {
                iceServers: iceServers
            }
        })

        const handleSignal = (signal: any) => {
            console.log("I answer the offer of " + callerID);
            socket.emit("returningSignal", { signal, caller })
        };

        peer.on("signal", handleSignal);

        const cleanup = () => {
            peer.off("signal", handleSignal);
        };

        peer.signal(incomingSignal);

        return { peer, cleanup };
    }


    const stopScreenShare = () => {
        if (!!screenShareStream) {
            const tracks = screenShareStream.getTracks();
            tracks.forEach((track: any) => track.stop()); // Stop each track
            setScreenShareStream(null); // Reset the screenShareStream variable
        }
        setScreenShared(false);
    }

    const shareVideo = (screenTrack: any) => {
        // Stop screen share if not already
        stopScreenShare();

        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then((stream: any) => {
            // Change local stream track
            localStream.current = stream;
            userVideo.current.srcObject = stream;

            // Change remote stream tracks
            const videoTrack: any = stream.getTracks()[0];
            console.log(videoTrack)
            peers.forEach((peerObj: any) => {
                const peer: any = peerObj.peer;
                const videoTracks = peer.streams[0].getVideoTracks();
                console.log(videoTracks);
                peer.replaceTrack(
                    screenTrack,
                    videoTrack,
                    peer.streams[0]
                );
            });


        });
    };

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia().then((stream: any) => {
            // Change local stream track
            localStream.current = stream;
            userVideo.current.srcObject = stream;
            setScreenShareStream(stream);

            // Change remote stream tracks
            const screenTrack: any = stream.getTracks()[0];
            peers.forEach((peerObj: any) => {
                const peer: any = peerObj.peer;
                const videoTrack = peer.streams[0].getVideoTracks()[0];
                console.log(peer.streams[0].getVideoTracks()[0]);
                console.log(stream.getTracks())
                peer.replaceTrack(
                    videoTrack,
                    screenTrack,
                    peer.streams[0]
                );

            });

            screenTrack.onended = function () {
                shareVideo(screenTrack);
                setScreenShared(false);
            }

        });
    };

    // Function to update the ref array with the new reference
    const addVideoRef = (ref: any) => {
        remoteVideoRefs.current.push(ref);
        console.log("Remote refs: ", remoteVideoRefs.current)
    };

    const handleCollapseClick = () => {
        setCollapse((collapse: boolean) => !collapse);
    }

    const handleVideoCameraBtnClick = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getTracks().find((track: any) => track.kind === 'video');
            if (videoActive) {
                setVideoActive(false);
                if (videoTrack && videoTrack.enabled) {
                    videoTrack.enabled = false;
                }
            } else {
                setVideoActive(true);
                if (videoTrack && !videoTrack.enabled) {
                    videoTrack.enabled = true;
                }
            }
        }
    }

    const toggleVideoBlockedModal = () => {
        alert("Video blocked by admin");
    }

    const toggleMicBlockedModal = () => {
        alert("Mic blocked by admin")
    }

    const handleMicrophoneBtnClick = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getTracks().find((track: any) => track.kind === 'audio');
            if (microphoneActive) {
                setMicrophoneActive(false);
                if (audioTrack && audioTrack.enabled) {
                    audioTrack.enabled = false;
                }
            } else {
                setMicrophoneActive(true);
                if (audioTrack && !audioTrack.enabled) {
                    audioTrack.enabled = true;
                }
            }
        }
    }


    const handleShareBtnClick = () => {
        if (screenShared) {
            setScreenShared(false);
            shareVideo(screenShareStream);
        } else {
            setScreenShared(true);
            shareScreen();
        }
    }

    const handleCloseCall = () => {
        hideCam();
        muteMic();
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            videoTrack.stop();
        }
        socket.disconnect();
        navigate("/leave/" + roomID + "/" + username);
    }

    const pinUser = (clickedUser: any) => {
        if (!!pinnedUser) {
            // change the pinned video
            if (pinnedUser.id !== clickedUser.id) {
                setPinnedUser(clickedUser);
                setNotPinnedUsers(users.filter((user: any) => user.id !== clickedUser.id));
            } else {
                // un-pin the video
                setPinnedUser(null);
                setNotPinnedUsers((prevUnpinnedUsers: any) => [clickedUser, ...prevUnpinnedUsers]);
            }
        } else {
            // pin the video
            setPinnedUser(clickedUser);
            setNotPinnedUsers(users.filter((user: any) => user.id !== clickedUser.id));
        }
    }

    const renderNotPinnedVideoBoxes = useMemo((): ReactNode => {
        const boxes = [];

        let classes = 'videocall__videos__user-card';
        if (users.length === 3) {
            classes += ' videocall__videos__user-card--three'
        } else if (users.length === 2) {
            classes += ' videocall__videos__user-card--two'
        } else if (users.length === 1) {
            classes += ' videocall__videos__user-card--one'
        } else {
            classes += ' videocall__videos__user-card--more'
        }

        for (let i = 0; i < notPinnedUsers.length; i++) {
            const user = notPinnedUsers[i];
            if (userVideo.current) {
                console.log(userVideo.current.srcObject)
            }
            const remoteStream: any = remoteStreams.find((streamEl: any) => streamEl.userID === user.id);
            if (!!remoteStream) console.log("Remote stream of " + user.id, remoteStream.stream)

            boxes.push(
                <div
                    id={user.id}
                    key={user.id}
                    className={classes}
                    onClick={() => pinUser(user)}
                >
                    {user.id === myUser.id
                        ? <video id={uuidv4()} className="videocall__videos__user-card__video" ref={userVideo} autoPlay playsInline></video>
                        : <Video
                            peerID={user.id}
                            stream={!!remoteStream ? remoteStream.stream : null}
                            addVideoRef={addVideoRef}
                            amOwner={amOwner}
                            socket={socket}>
                        </Video>}
                    <FontAwesomeIcon icon={faUser} />
                    <span className={`videocall__user-card__name ${showControls ? '' : 'videocall--hide'}`}>{user.name}</span>
                </div>
            );
        }

        return boxes || <></>;
    }, [pinnedVideo, users, notPinnedUsers, initVideo, remoteStreams, showControls]);

    const renderPinnedVideoBox = useMemo((): ReactNode => {
        if (!!pinnedUser) {
            if (userVideo.current) {
                console.log(userVideo.current.srcObject)
            }
            const remoteStream: any = remoteStreams.find((streamEl: any) => streamEl.userID === pinnedUser.id);
            if (!!remoteStream) console.log("Remote stream of " + pinnedUser.id, remoteStream.stream)

            return (
                <div
                    className="videocall__videos__user-card videocall__videos__user-card--active"
                    onClick={() => pinUser(pinnedUser)}
                >
                    {pinnedUser.id === myUser.id
                        ? <video id={uuidv4()} className="videocall__videos__user-card__video" ref={userVideo} autoPlay playsInline></video>
                        : <Video
                            peerID={pinnedUser.id}
                            stream={!!remoteStream ? remoteStream.stream : null}
                            addVideoRef={addVideoRef}
                            amOwner={amOwner}
                            socket={socket}>
                        </Video>}
                    <FontAwesomeIcon icon={faUser} />
                    <span className={`videocall__user-card__name ${showControls ? '' : 'videocall--hide'}`}>{pinnedUser.name}</span>
                </div>
            );
        } else {
            return <></>;
        }
    }, [pinnedVideo, users, notPinnedUsers, initVideo, remoteStreams, showControls]);

    return (
        <div className='videocall'>
            <h3 className='videocall__title'>{roomID}</h3>
            <div className={`videocall__container ${!collapse ? 'videocall__container--chat-active' : ''}
                                                  ${users.length == 2 ? 'videocall__container--big' : ''}
                                                  ${users.length == 1 ? 'videocall__container--massive' : ''}`}>
                <div className="videocall__videos">
                    <div className="videocall__videos__pinned">
                        {renderPinnedVideoBox}
                    </div>
                    <div className={`${pinnedUser === null ? 'videocall__videos__not-pinned--grid' : 'videocall__videos__not-pinned--row'}`}>
                        {renderNotPinnedVideoBoxes}
                    </div>
                </div>
                <div className={`videocall__buttons ${showControls ? '' : 'videocall--hide'}`}>
                    <button
                        title={videoActive && !isCameraHiddenByAdmin ? 'switch off camera' : 'turn on camera'}
                        onClick={isCameraHiddenByAdmin ? toggleVideoBlockedModal : handleVideoCameraBtnClick}
                        className={videoActive && !isCameraHiddenByAdmin ? '' : 'videocall__buttons__button--inactive'}
                    >
                        <FontAwesomeIcon icon={videoActive && !isCameraHiddenByAdmin ? faVideoCamera : faVideoSlash} className='icon' />
                    </button>
                    <button
                        title={microphoneActive && !isMicMutedByAdmin ? 'switch off microphone' : 'turn on microphone'}
                        onClick={isMicMutedByAdmin ? toggleMicBlockedModal : handleMicrophoneBtnClick}
                        className={microphoneActive && !isMicMutedByAdmin ? '' : 'videocall__buttons__button--inactive'}>
                        <FontAwesomeIcon icon={microphoneActive && !isMicMutedByAdmin ? faMicrophone : faMicrophoneSlash} className='icon' />
                    </button>
                    <button
                        title={screenShared && !isCameraHiddenByAdmin ? 'stop sharing' : 'share screen'}
                        className={`videocall__buttons__share ${screenShared && !isCameraHiddenByAdmin ? 'videocall__buttons__share--active' : ''}`}
                        onClick={handleShareBtnClick}
                    >
                        <FontAwesomeIcon icon={faShareFromSquare} className='icon' />
                    </button>
                    <button className='videocall__buttons__phone-btn' title='Close call' onClick={handleCloseCall}>
                        <FontAwesomeIcon icon={faPhoneSlash} className='icon' />
                    </button>
                </div>
            </div>
            <ChatCollapsable
                collapse={collapse}
                onCollapse={handleCollapseClick}
                socket={socket}
                roomID={roomID}
                users={users}
                myUser={myUser}
            />
        </div>
    )
}
