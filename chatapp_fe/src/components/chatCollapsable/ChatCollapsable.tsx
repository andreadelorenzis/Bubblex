import React, { useEffect, useState, useRef } from 'react'
import "./chatCollapsable.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMessage, faPlusCircle, faPlus, faUser, faUpload, faCode, faPoll } from '@fortawesome/free-solid-svg-icons'
import { faFaceSmile, faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Modal from '../modal/Modal'
import PollForm from '../pollForm/PollForm'
import Message from '../message/Message'
import PollMessage from '../pollMessage/PollMessage'
import FileViewer from '../fileViewer/FileViewer'
import FileMessage from '../fileMessage/FileMessage'
import { getTypeName, formatFileSize, getIconByType } from '../../utils/fileUtils'
import CodeEditor from '../codeEditor/CodeEditor'
import CodeMessage from '../codeMessage/CodeMessage'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'

/*

    pollMessages: [
        {
            _id,
            question
            options: [
                {
                    id,
                    text,
                    votes: {
                        name,
                        id
                    }
                }
            ]
        }
    ]

 */

export default function ChatCollapsable({ collapse, onCollapse, socket, roomID, users, myUser }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState<any>("")
    const [userColors, setUsersColors] = useState<any>({});
    const [emojiMenuOpened, setEmojiMenuOpened] = useState<boolean>(false);
    const [messageOptionsOpened, setMessageOptionsOpened] = useState<boolean>(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
    const [pollData, setPollData] = useState<any>({
        question: '',
        options: []
    });
    const [newMessagesNotSeen, setNewMessagesNotSeen] = useState<number>(0);
    const [chosenFile, setChosenFile] = useState<any>(null);
    const [fileMetadata, setFileMetadata] = useState<any>({
        name: '',
        type: '',
        size: ''
    });
    const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

    const emojiPickerRef = useRef<any>(null);
    const optionsPickerRef = useRef<any>(null);
    const inputBarRef = useRef<any>(null);
    const messageContainerRef = useRef<any>(null);
    const isFirstRender = useRef<any>(null);
    const fileInputRef = useRef<any>(null);

    useEffect(() => {
        function onConnect() {
            console.log('Connected')
        }

        function onDisconnect() {
            console.log('Disconnected')
        }

        function onReceiveMessage(message: any) {
            setMessages((prevMessages: any[]) => [...prevMessages, message]);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receiveTextMessage', onReceiveMessage);

        /* socket.emit("joinRoom", roomID); */

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receiveTextMessage', onReceiveMessage);
        };
    }, []);

    useEffect(() => {
        console.log("ALL MESSAGES: ", messages)

        function onUpdatePollMessage(data: any) {
            const updatedMessages = messages.map((message: any) => {
                if (message._id === data.messageID) {
                    const updatedOptions = message.options.map((option: any) => {
                        if (option.id === data.option.id) {
                            const updatedVotes = [...option.votes];
                            updatedVotes.push({
                                name: data.voter.name,
                                id: data.voter.id
                            });
                            return {
                                ...option,
                                votes: updatedVotes
                            };
                        }
                        return option;
                    });
                    return {
                        ...message,
                        options: updatedOptions
                    };
                }
                return message;
            });
            setMessages(updatedMessages);
        }

        socket.on('updatePollMessage', onUpdatePollMessage)
    }, [messages])

    useEffect(() => {
        // Set the color for the usernames
        const assignedColors = assignRandomColors(users);
        setUsersColors(assignedColors);

        // Listener to check if I'm scrolled all the way to the bottom
        const container = messageContainerRef.current;
        const readNewMessagesNotSeen = () => {
            if (!collapse && isNearBottom()) {
                setNewMessagesNotSeen(0);
            }
        }
        if (container.current) {
            container.addEventListener('scroll', readNewMessagesNotSeen);
        }

        return () => {
            container.removeEventListener('scroll', readNewMessagesNotSeen);
        }
    }, [users]);

    useEffect(() => {
        if (isFirstRender.current) {
            // Skip the first render
            isFirstRender.current = false;
            return;
        }

        if (collapse) {
            // set the new message alert on the chat button
            setNewMessagesNotSeen((prevMessagesNotSeen: number) => prevMessagesNotSeen + 1);
        } else {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.user?.id === myUser?.id) {
                // I sent the last message. Scroll to the bottom
                handleScrollBottom();
            } else {
                // set the new messages tooltip inside the chat
                if (!isNearBottom) {
                    setNewMessagesNotSeen((prevMessagesNotSeen: number) => prevMessagesNotSeen + 1);
                }
            }
        }
    }, [messages]);

    useEffect(() => {
        const handleOutsideClick = (event: any) => {
            if (emojiMenuOpened && emojiPickerRef.current && inputBarRef.current &&
                (!emojiPickerRef.current.contains(event.target) && !inputBarRef.current.contains(event.target))) {
                setEmojiMenuOpened(false);
            }

            if (messageOptionsOpened && optionsPickerRef.current && !optionsPickerRef.current.contains(event.target)) {
                setMessageOptionsOpened(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [emojiMenuOpened, messageOptionsOpened]);

    const assignRandomColors = (users: any[]) => {
        const colors = ['#ed4245', '#5865f2', '#faa61a', '#757e8a', '#3ba55c', '#b24ea1']; // List of available colors
        const assignedColors: any = {};

        users.forEach((user) => {
            // Generate a random index within the available colors array
            const randomIndex = Math.floor(Math.random() * colors.length);

            // Assign the color to the user
            assignedColors[user.id] = colors[randomIndex];

            // Remove the assigned color from the available colors array to avoid repetition
            colors.splice(randomIndex, 1);
        });

        return assignedColors;
    }

    const handleScrollBottom = () => {
        const msgContainer: any = document.getElementById('msg-container');
        if (!!msgContainer) {
            msgContainer.scrollTop = msgContainer?.scrollHeight;
        }
    }

    const isNearBottom = (): boolean => {
        const container = messageContainerRef.current;

        // Calculate the distance from the bottom of the container
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

        // Define a threshold value (e.g., 20 pixels) for considering it near the bottom
        const threshold = 20;

        // Check if the distance from the bottom is within the threshold
        const isNearBottom = distanceFromBottom < threshold;

        // Show the alert if not near the bottom
        if (!isNearBottom) {
            alert('New message!');
        }

        return isNearBottom;
    }

    const togglePollModalOpen = () => {
        setIsPollModalOpen(!isPollModalOpen);
    }

    const toggleCodeModalOpen = () => {
        setIsCodeModalOpen(!isCodeModalOpen);
    }

    const handleCollapseClick = () => {
        if (collapse) {
            setNewMessagesNotSeen(0);
        }
        onCollapse();
    }

    const toggleEmojiMenu = () => {
        setEmojiMenuOpened((opened: boolean) => !opened);
    }

    const toggleMessageOptionsMenu = () => {
        setMessageOptionsOpened((prev: boolean) => !prev);
    }

    const handleEmojiChange = (e: any) => {
        const sym = e.unified.split('-');
        const codesArray = sym.map((el: any) => parseInt(el, 16));
        const emoji = String.fromCodePoint(...codesArray);
        setMessageText((prevText: any) => prevText + emoji);
        setEmojiMenuOpened(false);
    };

    const handleChange = (e: any) => {
        setMessageText(e.target.value);
    }

    const handleFileUploadClick = () => {
        setMessageOptionsOpened(false);
        // Trigger the file input click event
        fileInputRef.current.click();
    }

    const handleCodeSnippetClick = () => {
        setMessageOptionsOpened(false);
        toggleCodeModalOpen();
    }

    const handlePollClick = () => {
        setMessageOptionsOpened(false);
        togglePollModalOpen();
    }

    const handleFileInputChange = (event: any) => {
        const file = event.target.files[0];

        // Access file properties
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        const fileType = getTypeName(file.type);
        setFileMetadata({
            name: fileName,
            size: fileSize,
            type: fileType
        });
        setChosenFile(file);
    }

    const handleCloseFileViewer = () => {
        setChosenFile(null);
    }

    const handleClickSendBtn = (e: any) => {
        sendMessage("text");
    }

    const sendMessage = async (messageType?: string, messageData?: any) => {
        const message: any = {
            sender: myUser,
            contentType: messageType,
            textContent: messageText,
            _id: uuidv4()
        }
        if (!!chosenFile) {
            const fileData = await uploadFileToApi();
            message.contentType = 'file';
            message.fileUrl = fileData.fileUrl;
            message.fileMetadata = fileData.fileMetadata;
            setChosenFile(null);
        } else if (messageType === 'poll') {
            message.question = messageData?.question;
            message.options = messageData?.options;
        } else if (messageType === 'code') {
            message.snippet = messageData.code;
            message.language = messageData.language;
        } else {
            // normal message
        }

        // send message via SOCKET and update state
        const data = {
            message: message,
            room: roomID
        }

        // Update state
        socket.emit('sendTextMessage', data);
        setMessages((prevMessages: any) => [...prevMessages, message]);
        setMessageText("");

        // POST message to api
        try {
            await axios.post("http://localhost:4000/api/v1/messages/", message);
        } catch (error) {
            console.error(error);
        }
    }

    const handleVote = (submitData: any) => {
        // update the state
        setMessages((prevMessages: any[]) => {
            return prevMessages.map((message: any) => {
                if (message._id === submitData.messageID) {
                    const updatedOptions = message.options.map((option: any) => {
                        if (option.id === submitData.option.id) {
                            option.votes.push(myUser);
                        }
                        return option;
                    });
                    message.options = updatedOptions;
                }
                return message;
            });
        });

        const data = {
            option: submitData.option,
            voter: myUser,
            messageID: submitData.messageID,
            room: roomID
        }
        socket.emit('votePollOption', data);
    }

    const uploadFileToApi = async () => {
        const formData = new FormData();
        formData.append("contentType", 'file');
        formData.append("textContent", messageText);
        formData.append("senderID", myUser.id);
        formData.append("senderName", myUser.name);
        formData.append("fileName", fileMetadata.name);
        formData.append("fileSize", fileMetadata.size);
        formData.append("fileType", fileMetadata.type);
        formData.append("file", chosenFile);

        try {
            const response = await axios.post("http://localhost:4000/api/v1/messages/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("FILE UPLOAD RESPONSE ", response)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    return (
        <div className={`chat-collapse ${collapse ? 'chat-collapse--collapsed' : ''}`} ref={isFirstRender}>
            <button className='chat-collapse__button' onClick={handleCollapseClick}>
                <FontAwesomeIcon icon={faMessage} color='#d6d9dc' />
                {collapse && newMessagesNotSeen > 0 ? <span>{newMessagesNotSeen}</span> : <></>}
            </button>
            <div
                id='msg-container'
                className="chat-collapse__msg-container"
                style={{ marginBottom: !!chosenFile ? '300px' : '50px' }}
                ref={messageContainerRef}>
                {
                    !!messages && !!users && messages.map((message: any, index: any) => {
                        const sender = message?.sender;
                        const userColor = userColors[sender.id];

                        if (message?.contentType && message?.contentType === 'poll') {
                            const question = message?.question;
                            const options = message?.options;
                            const totalVotes = users.length;

                            return <PollMessage
                                key={index}
                                myUser={myUser}
                                message={message}
                                userColor={userColor}
                                question={question}
                                options={options}
                                totalVotes={totalVotes}
                                onUpdate={handleVote}
                            />
                        } else if (message?.contentType && message?.contentType === 'file') {
                            const fileMetadata = message?.fileMetadata;
                            const icon = getIconByType(fileMetadata?.type, '40px', '#d6d9dc');
                            const name = fileMetadata?.name;
                            const type = fileMetadata?.type;
                            const size = fileMetadata?.size;
                            const fileUrl = message.fileUrl;

                            return <FileMessage
                                key={index}
                                message={message}
                                userColor={userColor}
                                icon={icon}
                                name={name}
                                type={type}
                                size={size}
                                fileUrl={fileUrl}
                            />
                        } else if (message?.contentType && message?.contentType === 'code') {
                            const snippet = message?.snippet;
                            const language = message?.language;

                            return <CodeMessage
                                key={index}
                                message={message}
                                userColor={userColor}
                                code={snippet}
                                language={language}
                            />
                        }
                        else {
                            return (
                                <Message
                                    key={index}
                                    message={message}
                                    userColor={userColor} />
                            );
                        }
                    })
                }
                <div style={{ marginBottom: '80px' }}></div>
            </div>

            <div className="chat-collapse__input-bar" ref={inputBarRef}>
                {!!chosenFile && <div className='file-viewer__container'>
                    <FileViewer file={chosenFile} onClose={handleCloseFileViewer} />
                </div>}
                <button
                    onClick={toggleMessageOptionsMenu}
                    className={`chat-collapse__input-bar__options-btn chat-collapse__input-bar__button ${messageOptionsOpened ? 'chat-collapse__input-bar__button--active' : ''}`}>
                    <FontAwesomeIcon icon={faPlus} className='icon' style={{ color: messageOptionsOpened ? '#ffffff' : '#1c9dea' }} />
                </button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileInputChange} />
                {messageOptionsOpened && <span className='chat-collapse__input-bar__options-picker' ref={optionsPickerRef}>
                    <ul>
                        <li>
                            <button onClick={handleFileUploadClick}>
                                <FontAwesomeIcon icon={faUpload} style={{ marginRight: '10px', fontSize: '20px' }} /> File
                            </button>
                        </li>
                        <li>
                            <button onClick={handleCodeSnippetClick}>
                                <FontAwesomeIcon icon={faCode} style={{ marginRight: '10px', fontSize: '20px' }} /> Code snippet
                            </button>
                        </li>
                        <li>
                            <button onClick={handlePollClick}>
                                <FontAwesomeIcon icon={faPoll} style={{ marginRight: '10px', fontSize: '20px' }} /> Poll
                            </button>
                        </li>
                    </ul>
                    <div className='triangle'></div>
                </span>}
                <textarea placeholder='Send a message..' rows={1} onChange={handleChange} value={messageText} />
                <button
                    onClick={toggleEmojiMenu}
                    className={`chat-collapse__input-bar__emoji-button chat-collapse__input-bar__button ${emojiMenuOpened ? 'chat-collapse__input-bar__button--active' : ''}`}>
                    <FontAwesomeIcon icon={faFaceSmile} className='icon' style={{ color: emojiMenuOpened ? '#ffffff' : '#1c9dea' }} />
                </button>
                {emojiMenuOpened && <span className='chat-collapse__input-bar__emoji-picker'>
                    <div ref={emojiPickerRef}>
                        <Picker data={data} onEmojiSelect={handleEmojiChange} />
                    </div>
                </span>}
                <button onClick={handleClickSendBtn} className='chat-collapse__input-bar__send-btn chat-collapse__input-bar__button'>
                    <FontAwesomeIcon icon={faPaperPlane} className='icon' style={{ color: '#1c9dea' }} />
                </button>
            </div>
            {!collapse && newMessagesNotSeen > 0
                ? <div className='chat-collapse__new-messages' onClick={handleScrollBottom}>
                    <span>{newMessagesNotSeen}</span>
                    <div className='triangle'></div>
                </div>
                : <></>}
            {isCodeModalOpen && (
                <CodeEditor onSubmit={sendMessage} onClose={toggleCodeModalOpen} />
            )}
            {isPollModalOpen && (
                <PollForm
                    onSubmit={sendMessage}
                    onClose={togglePollModalOpen}
                />
            )}
        </div>
    )
}
