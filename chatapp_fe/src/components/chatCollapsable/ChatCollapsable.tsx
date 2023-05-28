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

export default function ChatCollapsable({ collapse, onCollapse }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [myUser, setMyUser] = useState<any>({});
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

    const emojiPickerRef = useRef<any>(null);
    const optionsPickerRef = useRef<any>(null);
    const inputBarRef = useRef<any>(null);
    const messageContainerRef = useRef<any>(null);
    const isFirstRender = useRef<any>(null);
    const fileInputRef = useRef<any>(null);

    useEffect(() => {
        const users = [
            { id: 1, name: 'User 1', profileImg: 'https://firebasestorage.googleapis.com/v0/b/chatapp-ce281.appspot.com/o/images%2Fprofile_picture.jpg?alt=media&token=e5eca9ce-fdfe-44e8-965e-61fb825e2200' },
            { id: 2, name: 'User 2' },
            { id: 3, name: 'User 3' },
            { id: 4, name: 'User 4' },
            { id: 5, name: 'User 5' },
        ];
        setUsers(users);
        setMyUser(users[0]);
        setMessages([
            {
                user: users[0],
                content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto nostrum inventore, sequi natus eaque error voluptates neque tempore quae, iste ex nobis at odit veritatis, est aspernatur nisi accusamus architecto!'
            },
            {
                user: users[1],
                content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto nostrum inventore, sequi natus eaque error voluptates neque tempore quae, iste ex nobis at odit veritatis, est aspernatur nisi accusamus architecto!'
            },
            {
                user: users[2],
                content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto nostrum inventore, sequi natus eaque error voluptates neque tempore quae, iste ex nobis at odit veritatis, est aspernatur nisi accusamus architecto!'
            },
            {
                user: users[3],
                content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto nostrum inventore, sequi natus eaque error voluptates neque tempore quae, iste ex nobis at odit veritatis, est aspernatur nisi accusamus architecto!'
            },
            {
                user: users[1],
                content: 'Eccovi il sondaggio',
                contentType: 'poll',
                question: 'Domanda?',
                options: [
                    {
                        text: 'Opzione 1',
                        votes: [users[0], users[1]]
                    },
                    {
                        text: 'Opzione 2',
                        votes: [users[2], users[3]]
                    }
                ]
            }
        ]);

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
        const assignedColors = assignRandomColors(users);
        setUsersColors(assignedColors);

        const container = messageContainerRef.current;
        // Listener to check if I'm scrolled all the way to the bottom
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
    }, []);

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

    const sendMessage = () => {
        if (!!chosenFile) {
            sendFile();
            return;
        }

        setMessages((prevMessages: any) => [...prevMessages, {
            user: users[0],
            content: messageText
        }]);

        // send message

        setMessageText("");
        setChosenFile(null);
    }

    const sendPoll = (options: any) => {
        const pollMessage = {
            sender: users[1],
            content: messageText,
            contentType: 'poll',
            question: pollData?.question,
            options: pollData?.options
        }
        setMessages((prevMessages: any) => [...prevMessages, pollMessage]);

        // send message

        setMessageText("");
        setChosenFile(null);
    }

    const sendFile = () => {
        const data = {
            sender: users[0],
            content: messageText,
            contentType: 'file',
            file: chosenFile,
            fileMetadata: {
                name: fileMetadata.name,
                type: fileMetadata.type,
                size: fileMetadata.size
            }
        };

        // AFTER upload
        const fileMessage = {
            user: users[0],
            content: messageText,
            contentType: 'file',
            fileUrl: 'https://firebasestorage.googleapis.com/v0/b/chatapp-ce281.appspot.com/o/Authentication.png?alt=media&token=bd3b2da8-1589-4634-a65b-2a39c38d8da3',
            fileMetadata: data.fileMetadata
        }

        setMessages((prevMessages: any) => [...prevMessages, fileMessage]);

        // send message

        setMessageText("");
        setChosenFile(null);
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
                        const user = message?.user;
                        const content = message.content;
                        const userColor = userColors[user.id];

                        if (message?.contentType && message?.contentType === 'poll') {
                            const question = message?.question;
                            const options = message?.options;
                            const totalVotes = users.length;

                            return <PollMessage
                                key={index}
                                user={user}
                                userColor={userColor}
                                content={content}
                                question={question}
                                options={options}
                                totalVotes={totalVotes}
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
                                user={user}
                                userColor={userColor}
                                content={content}
                                icon={icon}
                                name={name}
                                type={type}
                                size={size}
                                fileUrl={fileUrl}
                            />
                        } else {
                            return (
                                <Message
                                    key={index}
                                    user={user}
                                    userColor={userColor}
                                    content={content} />
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
                <button onClick={sendMessage} className='chat-collapse__input-bar__send-btn chat-collapse__input-bar__button'>
                    <FontAwesomeIcon icon={faPaperPlane} className='icon' style={{ color: '#1c9dea' }} />
                </button>
            </div>
            {!collapse && newMessagesNotSeen > 0
                ? <div className='chat-collapse__new-messages' onClick={handleScrollBottom}>
                    <span>{newMessagesNotSeen}</span>
                    <div className='triangle'></div>
                </div>
                : <></>}
            {isPollModalOpen && (
                <Modal
                    header={(<span className='poll-modal__header'>
                        <FontAwesomeIcon icon={faPoll} style={{ fontSize: '40px' }} />
                        <h2>Poll</h2>
                    </span>)}
                    content={(<PollForm onSubmit={sendPoll} />)}
                    onClose={togglePollModalOpen}
                />
            )}
        </div>
    )
}
