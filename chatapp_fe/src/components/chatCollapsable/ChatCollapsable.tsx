import React, { useEffect, useState } from 'react'
import "./chatCollapsable.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage, faPlusCircle, faSmile, faPaperPlane, faUser, faUpload, faCode, faPoll } from '@fortawesome/free-solid-svg-icons'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Modal from '../modal/Modal'
import PollForm from '../pollForm/PollForm'
import Message from '../message/Message'
import PollMessage from '../pollMessage/PollMessage'

export default function ChatCollapsable({ collapse, onCollapse }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState<any>("")
    const [userColors, setUsersColors] = useState<any>({});
    const [emojiMenuOpened, setEmojiMenuOpened] = useState<boolean>(false);
    const [messageOptionsOpened, setMessageOptionsOpened] = useState<boolean>(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
    const [newMessagesArrived, setNewMessagesArrived] = useState<boolean>(true);

    useEffect(() => {
        const users = [
            { id: 1, name: 'User 1', profileImg: 'https://firebasestorage.googleapis.com/v0/b/chatapp-ce281.appspot.com/o/images%2Fprofile_picture.jpg?alt=media&token=e5eca9ce-fdfe-44e8-965e-61fb825e2200' },
            { id: 2, name: 'User 2' },
            { id: 3, name: 'User 3' },
            { id: 4, name: 'User 4' },
            { id: 5, name: 'User 5' },
        ];
        setUsers(users);
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
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']; // List of available colors
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
    }, []);

    useEffect(() => {
        const msgContainer: any = document.getElementById('msg-container');
        if (!!msgContainer) {
            msgContainer.scrollTop = msgContainer?.scrollHeight;
        }
        if (collapse) {
            setNewMessagesArrived(true);
        }
    }, [messages]);


    const togglePollModalOpen = () => {
        setIsPollModalOpen(!isPollModalOpen);
    }

    const handleCollapseClick = () => {
        if (collapse) {
            setNewMessagesArrived(false);
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
    }

    const handleCodeSnippetClick = () => {
        setMessageOptionsOpened(false);
    }

    const handlePollClick = () => {
        setMessageOptionsOpened(false);
        togglePollModalOpen();
    }

    const sendMessage = () => {
        setMessages((prevMessages: any) => [...prevMessages, {
            user: users[0],
            content: messageText
        }]);
        setMessageText("");
    }

    const sendPoll = (options: any) => {
        const pollMessage = {
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
    }

    return (
        <div className={`chat-collapse ${collapse ? 'chat-collapse--collapsed' : ''}`}>
            <button className='chat-collapse__button' onClick={handleCollapseClick}>
                <FontAwesomeIcon icon={faMessage} />
                {newMessagesArrived ? <span>3</span> : <></>}
            </button>
            <div id='msg-container' className="chat-collapse__msg-container">
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
                                user={user}
                                userColor={userColor}
                                content={content}
                                question={question}
                                options={options}
                                totalVotes={totalVotes}
                            />
                        } else {
                            return (
                                <Message
                                    user={user}
                                    userColor={userColor}
                                    content={content} />
                            );
                        }
                    })
                }
                <div style={{ marginBottom: '20px' }}></div>
            </div>

            <div className="chat-collapse__input-bar">
                <button onClick={toggleMessageOptionsMenu}>
                    <FontAwesomeIcon icon={faPlusCircle} style={{ marginLeft: '20px', fontSize: '20px' }} />
                </button>
                {messageOptionsOpened && <span className='chat-collapse__input-bar__options-picker'>
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
                </span>}
                <textarea placeholder='Send a message..' rows={1} onChange={handleChange} value={messageText} />
                <button onClick={toggleEmojiMenu}>
                    <FontAwesomeIcon
                        icon={faSmile}
                        style={{ marginRight: '15px', fontSize: '20px' }} />
                </button>
                {emojiMenuOpened && <span className='chat-collapse__input-bar__emoji-picker'>
                    <Picker data={data} onEmojiSelect={handleEmojiChange} />
                </span>}
                <button onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '25px', fontSize: '20px' }} />
                </button>
            </div>
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
