import React, { ReactNode, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './videocall.css'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faUserCircle, faVideoCamera, faMicrophone, faShareFromSquare, faMessage, faPhoneSlash, faMicrophoneSlash, faVideoSlash, faEllipsisVertical, faVolumeXmark, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import ChatCollapsable from '../../components/chatCollapsable/ChatCollapsable'
import { v4 as uuidv4 } from 'uuid';
import SimplePeer from "simple-peer";
import ErrorAlert from '../../components/errorAlert/ErrorAlert'
import { fireError, getApiUrl } from '../../utils/appUtils'
import Video from '../../components/video/Video'

export default function Videocall({ socket, amOwner, amInvited, initVideoValue, initMicValue }: any) {
    const [pinnedVideo, setPinnedVideo] = useState<any>(null);
    const [collapse, setCollapse] = useState<boolean>(true);
    const [videoActive, setVideoActive] = useState<boolean>(true);
    const [microphoneActive, setMicrophoneActive] = useState<boolean>(true);
    const [showControls, setShowControls] = useState<boolean>(true);
    const [mouseMoved, setMouseMoved] = useState<boolean>(false);
    const [screenShared, setScreenShared] = useState<boolean>(false);
    const [myUser, setMyUser] = useState<any>({});
    const [screenShareStream, setScreenShareStream] = useState<any>(null);
    const [userColors, setUsersColors] = useState<any>({});
    const [isMicMutedByAdmin, setIsMicMutedByAdmin] = useState<boolean>(false);
    const [isCameraHiddenByAdmin, setIsCameraHiddenByAdmin] = useState<boolean>(false);
    const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
    const [isCameraInitialized, setIsCameraInitialized] = useState<boolean>(false);
    const [remoteUsersControls, setRemoteUsersControls] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [pinnedUser, setPinnedUser] = useState<any>(null);
    const [notPinnedUsers, setNotPinnedUsers] = useState<any[]>([]);
    const [peers, setPeers] = useState<any[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<any[]>([]);

    const remoteVideoRefs: any = useRef([]);
    const remotePeerRefs: any = useRef([]);
    const localStream: any = useRef();
    const userVideo: any = useRef();

    /**
     * WebRTC STUN servers
     */
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
    /* const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    }; */

    /**
     * Assign the stream to the local video
     */
    useEffect(() => {
        if (userVideo.current) {
            userVideo.current.srcObject = localStream.current;
        }
    }, [pinnedVideo, notPinnedUsers, users, isCameraInitialized]);

    /**
     * Called when a new user joins the videocall
     */
    const handleUserJoined = useCallback((payload: any) => {
        const signal = payload.signal;
        const caller = payload.caller;

        setUsers((prevUsers: any[]) => {
            const existingUser: any = prevUsers.find((user: any) => user.id === caller.id);

            // Check if the user exists already. If it does, it means that this is a trickled offer
            if (!!existingUser) {
                console.log("Trickle true. ICE candidate received and added")
                const existingPeer: any = peers.find((peer: any) => peer.peerID === caller.id);
                existingPeer?.signal(signal);
            } else {
                // Add the new peer
                console.log(caller.id + " joined the room with ID:");
                const { peer, cleanup }: any = addPeer(signal, caller, localStream.current);
                console.log("Added peer " + caller.id, peer);

                // On 'stream' save the new stream and assign it to the video element of the new peer
                peer.on('stream', (stream: any) => {
                    setRemoteStreams((prevStreams: any) => [...prevStreams, {
                        userID: caller.id,
                        stream: stream
                    }]);
                    setTimeout(() => {
                        const videoEl: any = document.getElementById(caller.id);
                        if (!!videoEl) {
                            videoEl.srcObject = stream;
                        }
                    }, 2000);
                })

                // Add the user to state
                remotePeerRefs.current.push({
                    peerID: caller.id,
                    peer,
                    cleanup
                });
                setPeers((prevPeers: any[]) => [...prevPeers, { peer, peerID: caller.id }]);
                setNotPinnedUsers((prevUsers: any[]) => [...prevUsers, caller]);
                return [...prevUsers, caller]
            }
            return prevUsers;
        });
    }, []);

    /**
     * Called when the other peer accept the signal offers
     */
    const handleReceivingReturnSignal = useCallback((payload: any) => {
        console.log("The user " + payload.id + " accepted my offer.");
        console.log("Now I signal back and complete the handshake with " + payload.id);
        const item = remotePeerRefs.current.find((p: any) => p.peerID === payload.id);

        if (item.peer.signalingState === "stable") {
            console.log("Connection is already stable, ignoring the remote answer.");
            return;
        }

        item.peer.signal(payload.signal);
    }, []);

    useEffect(() => {
        /**
         * Initialize the camera/mic permissions and assign the local stream
         */
        const initCamera = () => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream: any) => {
                // Assign the local stream
                localStream.current = stream;

                // Mute/unmute the mic
                if (initMicValue === true) {
                    unmuteMic();
                } else {
                    muteMic();
                }

                // Hide/Show the camera
                if (initVideoValue === true) {
                    showCam();
                } else {
                    hideCam();
                }

                // Emit the 'joinRoom' socket event
                socket.emit("joinRoom", {
                    roomID: roomID,
                    username: username
                });

                // Set all the participants in the room
                socket.once("allUsers", (data: any) => {
                    // Set the users
                    const usersList: any[] = data.users;
                    const myUser: any = data.myUser;
                    setUsers(usersList);
                    setMyUser(myUser);
                    const peersCopy: any[] = [];

                    // Create a new Peer for every other participant in the room
                    console.log("Now I send an offer to the other peers in the room.");
                    const otherUsers: any[] = usersList.filter((user: any) => user.id !== myUser.id);
                    otherUsers.forEach((user: any) => {

                        // Create the Peer object (this is the initiator of the connection)
                        const userID = user.id;
                        const { peer, cleanup }: any = createPeer(userID, myUser, stream);
                        console.log("Created peer " + userID, peer);

                        // Assign the stream when ready
                        peer.on('stream', (stream: any) => {
                            setRemoteStreams((prevStreams: any) => [...prevStreams, {
                                userID: userID,
                                stream: stream
                            }]);
                            setTimeout(() => {
                                const videoEl: any = document.getElementById(userID);
                                if (!!videoEl) {
                                    videoEl.srcObject = stream;
                                }
                            }, 2000);
                        })

                        // Update the state
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

                // Mic/Camera control events
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
                socket.on("cameraHiddenByUser", (id: any) => {
                    changeRemoteUsersControls('cameraHiddenByUser', id);
                });

                socket.on("cameraShowedByUser", (id: any) => {
                    changeRemoteUsersControls('cameraShowedByUser', id);
                });

                socket.on("micMutedByUser", (id: any) => {
                    changeRemoteUsersControls('micMutedByUser', id);
                });
                socket.on("micUnmutedByUser", (id: any) => {
                    changeRemoteUsersControls('micUnmutedByUser', id);
                });

            }).catch((err: any) => {
                console.error(err)
                setVideoActive(false);
                setMicrophoneActive(false);
                setIsCameraInitialized(true);
            })
        }

        // Send the user to the invite page if it's not the fist user (owner)
        if (!amOwner && !amInvited) {
            navigate("/inviter/" + roomID);
            return;
        }

        // Join the chat room
        socket.emit("joinChat", {
            roomID: roomID,
            username: username
        });

        // Obtain all the user present in this chat
        socket.once("allChatUsers", (data: any) => {
            const usersList: any[] = data.users;
            const myUser: any = data.myUser;
            // Creating all the users
            setUsers(usersList);
            setMyUser(myUser);
            setNotPinnedUsers(usersList);
        });

        // Init local video camera
        initCamera();
        setIsCameraInitialized(true);
    }, []);

    useEffect(() => {
        socket.on("userJoined", handleUserJoined);
        socket.on("receivingReturnSignal", handleReceivingReturnSignal);

        // Cleanup
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

            // Remove destroyed peers from state arrays
            setPeers([]);
            remotePeerRefs.current = [];
        };
    }, [handleUserJoined, handleReceivingReturnSignal]);

    /**
     * Creates a new peer (when I join the room)
     * 
     * @param userToSignalID 
     * @param caller 
     * @param stream 
     * @returns 
     */
    function createPeer(userToSignalID: any, caller: any, stream: any) {
        const callerID: any = caller.id;

        // This is the connection request so 'initator: true'
        const peer = new SimplePeer({
            initiator: true,
            trickle: true,
            stream: stream,
            config: {
                iceServers: iceServers
            }
        });

        // Send the signal to the other peer
        const handleSignal = (signal: any) => {
            console.log("The new peer " + callerID + " sends an offer to " + userToSignalID);
            socket.emit("sendingSignal", { userToSignalID, caller, signal })
        };
        peer.on("signal", handleSignal);

        peer.on('error', (err) => {
            console.error('Peer error:', err);
        });
        const cleanup = () => {
            peer.off("signal", handleSignal);
        };

        return { peer, cleanup };
    }

    /**
     * Add a new peer (when he joins the room)
     * 
     * @param incomingSignal 
     * @param caller 
     * @param stream 
     * @returns 
     */
    function addPeer(incomingSignal: any, caller: any, stream: any) {
        if (users.length >= MAX_USERS_NUM) {
            return;
        }
        const existingUser: any = users.find((user: any) => user.id === caller.id);
        console.log("Existing user 2: ", existingUser)
        const callerID = caller.id;
        const peer = new SimplePeer({
            initiator: false,
            trickle: true,
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

        peer.on('error', (err) => {
            console.error('Peer error:', err);
        });

        // I signal the answer back to the initator
        peer.signal(incomingSignal);

        const cleanup = () => {
            peer.off("signal", handleSignal);
        };

        return { peer, cleanup };
    }

    useEffect(() => {
        // Emit the signal to let the peer know if I'm showing camera/mic or not
        if (!!myUser) {
            if (!videoActive) {
                socket.emit("userHideCamera", myUser.id);
            } else {
                socket.emit("userShowCamera", myUser.id);
            }
            if (!microphoneActive) {
                socket.emit("userMuteMic", myUser.id);
            } else {
                socket.emit("userUnmuteMic", myUser.id);
            }
        }
    }, [videoActive, microphoneActive, users, myUser]);


    useEffect(() => {
        console.log("All peers ", peers);
        console.log("All remote peer refs ", remotePeerRefs?.current)
        console.log("All users ", users);
        console.log("All remote streams ", remoteStreams);
        console.log("My user ", myUser);
        console.log("User colors ", userColors);
        console.log("Remote user controls ", remoteUsersControls);
    }, [peers, users, remoteStreams, remoteUsersControls]);


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

    async function removePeer(id: any) {
        console.log("User " + id + " has LEFT the videocall.");
        const peerObj = remotePeerRefs.current.find((p: any) => p.peerID === id);
        const userObj = users.find((u: any) => u.id === id);

        if (peerObj) {
            console.log("DESTROY CONNECTION for " + peerObj.peerID);
            try {
                console.log("Peer to destroy ", peerObj.peer)
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

    useEffect(() => {
        // Method called right before the browser tab is closed
        const handleBeforeUnload = (e: any) => {
            // If I'm the last user, delete all the messages in the room
            if (users.length === 1) {
                deleteAllMessages();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        socket.on("userLeft", handleUserLeft);

        return (() => {
            socket.off("userLeft", handleUserLeft);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // If I'm the last user, delete all the messages in the room
            if (users.length === 1) {
                deleteAllMessages();
            }
        })

    }, [users, remotePeerRefs, peers, setPeers, setUsers, setNotPinnedUsers, setRemoteStreams, pinnedUser]);

    useEffect(() => {
        // Set the color for the usernames
        const assignedColors = assignRandomColors(users);
        setUsersColors(assignedColors);
    }, [users]);

    const assignRandomColors = (users: any[]) => {
        const colors = ['#ed4245', '#5865f2', '#faa61a', '#757e8a', '#3ba55c', '#b24ea1']; // List of available colors
        const assignedColors: any = {};

        users.forEach((user) => {
            // Check if the user already has an assigned color
            if (userColors[user.id]) {
                // Assign the existing color to the user
                assignedColors[user.id] = userColors[user.id];

                // Remove the color
                const index = colors.indexOf(user.color);
                if (index !== -1) {
                    colors.splice(index, 1); // Remove the color from the available colors
                }
            } else {
                // Generate a random index within the available colors array
                const randomIndex = Math.floor(Math.random() * colors.length);

                // Assign the color to the user
                assignedColors[user.id] = colors[randomIndex];

                // Remove the assigned color from the available colors array to avoid repetition
                colors.splice(randomIndex, 1);
            }
        });

        return assignedColors;
    }

    const changeRemoteUsersControls = (
        event: 'cameraHiddenByUser' | 'cameraShowedByUser' | 'micMutedByUser' | 'micUnmutedByUser',
        userId: string
    ): void => {
        setRemoteUsersControls((prevRemoteUsers: any) => {
            const updatedRemoteUsers: any = { ...prevRemoteUsers };

            switch (event) {
                case 'cameraHiddenByUser':
                    updatedRemoteUsers[userId] = {
                        ...updatedRemoteUsers[userId],
                        videoActive: false,
                    };
                    break;

                case 'cameraShowedByUser':
                    updatedRemoteUsers[userId] = {
                        ...updatedRemoteUsers[userId],
                        videoActive: true,
                    };
                    break;

                case 'micMutedByUser':
                    updatedRemoteUsers[userId] = {
                        ...updatedRemoteUsers[userId],
                        micActive: false,
                    };
                    break;

                case 'micUnmutedByUser':
                    updatedRemoteUsers[userId] = {
                        ...updatedRemoteUsers[userId],
                        micActive: true,
                    };
                    break;

                default:
                    // Handle unsupported event types, if needed
                    break;
            }

            return updatedRemoteUsers;
        });
    };

    const deleteAllMessages = () => {
        console.log("Deleting all messages")
        const deleteAllMessage = async () => {
            try {
                const result = await axios.delete(`${getApiUrl()}/api/v1/messages/room/${roomID}`);
            } catch (error) {
                console.error(error)
            }
        }
        deleteAllMessage();
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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream: any) => {
            // Change local stream track
            localStream.current = stream;
            userVideo.current.srcObject = stream;

            // Change remote stream tracks
            const videoTrack: any = stream.getTracks()[0];
            peers.forEach((peerObj: any) => {
                const peer: any = peerObj.peer;
                const videoTracks = peer.streams[0].getVideoTracks();
                peer.replaceTrack(
                    screenTrack,
                    videoTrack,
                    peer.streams[0]
                );
            });
        }).catch((error: any) => {
            console.error(error);
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

        }).catch((error: any) => {
            console.error(error);
        });
    };

    // Function to update the ref array with the new reference
    const addVideoRef = (ref: any) => {
        remoteVideoRefs.current.push(ref);
    };

    const handleCollapseClick = () => {
        setCollapse((collapse: boolean) => !collapse);
    }

    const handleVideoCameraBtnClick = () => {
        setVideoActive(!videoActive);
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
        fireError("Your video has been blocked by the admin of the call")
    }

    const toggleMicBlockedModal = () => {
        fireError("Your microphone has been blocked by the admin of the call")
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
        socket.off("userJoined", handleUserJoined);
        socket.off("receivingReturnSignal", handleReceivingReturnSignal);
        socket.off("userLeft", handleUserLeft);
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

    const handleShowPlaceholder = () => {
        setShowPlaceholder(!showPlaceholder)
    }

    const renderNotPinnedVideoBoxes = () => {
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
            const remoteStream: any = remoteStreams.find((streamEl: any) => streamEl.userID === user.id);

            boxes.push(
                <div
                    id={user.id}
                    key={user.id}
                    className={classes}
                    onClick={() => pinUser(user)}
                >
                    {user.id === myUser.id
                        ? <video
                            id={uuidv4()}
                            className={`videocall__videos__user-card__video ${!videoActive ? 'videocall__videos__user-card__video--not-active' : ''}`}
                            ref={userVideo}
                            autoPlay
                            playsInline>
                        </video>
                        : <Video
                            peerID={user.id}
                            stream={!!remoteStream ? remoteStream.stream : null}
                            addVideoRef={addVideoRef}
                            amOwner={amOwner}
                            socket={socket}>
                        </Video>}
                    <span className={`videocall__user-card__name ${showControls ? '' : 'videocall--hide'}`}>{user.name}</span>
                    {user.id === myUser.id && <div
                        className={`videocall__videos__user-card__placeholder__icon ${!videoActive ? 'videocall__videos__user-card__placeholder__icon--active' : ''}`}
                        style={{ backgroundColor: userColors[myUser.id] }}
                    >
                        <FontAwesomeIcon icon={faUser} className='icon' color="white" fontSize="50px" />
                    </div>}
                    {!!remoteUsersControls && !!remoteUsersControls[user.id] && !remoteUsersControls[user.id].videoActive && <div
                        className={`videocall__videos__user-card__placeholder__icon videocall__videos__user-card__placeholder__icon--active`}
                        style={{ backgroundColor: userColors[user.id] }}
                    >
                        <FontAwesomeIcon icon={faUser} className='icon' color="white" fontSize="50px" />
                    </div>}
                </div>
            );
        }

        return boxes || <></>;
    }

    const renderPinnedVideoBox = () => {
        if (!!pinnedUser) {
            const remoteStream: any = remoteStreams.find((streamEl: any) => streamEl.userID === pinnedUser.id);

            return (
                <div
                    className="videocall__videos__user-card videocall__videos__user-card--active"
                    onClick={() => pinUser(pinnedUser)}
                >
                    {pinnedUser.id === myUser.id
                        ? <video id={uuidv4()} className={`videocall__videos__user-card__video ${!showPlaceholder ? 'videocall__videos__user-card__video--not-active' : ''}`} ref={userVideo} autoPlay playsInline></video>
                        : <Video
                            peerID={pinnedUser.id}
                            stream={!!remoteStream ? remoteStream.stream : null}
                            addVideoRef={addVideoRef}
                            amOwner={amOwner}
                            socket={socket}>
                        </Video>}
                    <FontAwesomeIcon icon={faUser} />
                    <span className={`videocall__user-card__name ${showControls ? '' : 'videocall--hide'}`}>{pinnedUser.name}</span>
                    {pinnedUser.id === myUser.id && <div
                        className={`videocall__videos__user-card__placeholder__icon ${!videoActive ? 'videocall__videos__user-card__placeholder__icon--active' : ''}`}
                        style={{ backgroundColor: userColors[myUser.id] }}
                    >
                        <FontAwesomeIcon icon={faUser} className='icon' color="white" fontSize="50px" />
                    </div>}
                    {!!remoteUsersControls && !!remoteUsersControls[pinnedUser.id] && !remoteUsersControls[pinnedUser.id].videoActive && <div
                        className={`videocall__videos__user-card__placeholder__icon videocall__videos__user-card__placeholder__icon--active`}
                        style={{ backgroundColor: userColors[pinnedUser.id] }}
                    >
                        <FontAwesomeIcon icon={faUser} className='icon' color="white" fontSize="50px" />
                    </div>}
                </div>
            );
        } else {
            return <></>;
        }
    }

    let videocallClass: any = "videocall ";
    if (users.length === 1) {
        videocallClass += ' videocall--1 ';
    } else if (users.length === 2) {
        videocallClass += ' videocall--2 ';
    } else if (users.length === 3) {
        videocallClass += ' videocall--3 ';
    } else if (users.length === 4) {
        videocallClass += ' videocall--4 ';
    }

    return (
        <div className={videocallClass}>
            <h3 className={showControls ? 'videocall__title' : 'videocall__title videocall--hide'}>{roomID}</h3>
            <div className={`videocall__container ${!collapse ? 'videocall__container--chat-active' : ''}
                                                  ${users.length == 2 ? 'videocall__container--big' : ''}
                                                  ${users.length <= 1 ? 'videocall__container--massive' : ''}`}>
                {!!users && users.length > 0
                    ? <div className="videocall__videos">
                        <div className="videocall__videos__pinned">
                            {renderPinnedVideoBox()}
                        </div>
                        <div className={`${pinnedUser === null ? 'videocall__videos__not-pinned--grid' : 'videocall__videos__not-pinned--row'}`}>
                            {renderNotPinnedVideoBoxes()}
                        </div>
                    </div>
                    : <div className='videocall__videos__user-card__placeholder'>
                        <div className='videocall__videos__user-card__placeholder__icon'>
                            <FontAwesomeIcon icon={faUser} className='icon' color="black" fontSize="50px" />
                        </div>
                    </div>}
                <div className={`videocall__buttons ${showControls ? '' : 'videocall--hide'}`}>
                    <button
                        title={videoActive && !isCameraHiddenByAdmin ? 'switch off camera' : 'turn on camera'}
                        onMouseUp={handleShowPlaceholder}
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
                userColors={userColors}
            />
        </div>
    )
}
