import React, { useState, useEffect, useRef } from 'react'
import "./pollMessage.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Message from '../message/Message'
import Confetti from 'react-confetti';

export default function PollMessage({
    myUser,
    message,
    userColor,
    question,
    options,
    totalVotes,
    onUpdate
}: any) {
    const [votedOptionID, setVotedOptionID] = useState<any>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const confettiContainerRef: any = useRef(null);

    useEffect(() => {
        for (let i = 0; i < options.length; i++) {
            if (isOptionVoted(options[i])) {
                setVotedOptionID(options[i].id);
                break;
            }
        }
    }, []);

    const calculatePercOption = (votes: number, totalVotes: number) => {
        return Math.round((votes * 100) / totalVotes) || 0;
    }

    const countVoters = () => {
        let count: number = 0;
        for (let i = 0; i < options.length; i++) {
            const votes: any = options[i]?.votes;
            for (let vote in votes) {
                count++;
            }
        }
        return count;
    }

    const isOptionVoted = (option: any) => {
        const votes: any = option.votes;
        for (let j = 0; j < votes.length; j++) {
            const voteUserID = votes[j].id;
            if (myUser.id === voteUserID) {
                return true;
            }
        }
        return false;
    }

    const handleVote = (optionVoted: any) => {
        if (votedOptionID === null) {
            setVotedOptionID(optionVoted.id);
            onUpdate({
                messageID: message._id,
                option: optionVoted
            });
            setShowConfetti(true);
        }
    }

    return (
        <div className='poll-message'>
            <Message message={message} userColor={userColor} />
            <div className="poll-message__results">
                <span className='poll-message__results__question'>{question}</span>
                <div className="poll-message__options">
                    {options.map((option: any, index: any) => {
                        const text = option?.text;
                        const perc = calculatePercOption(option?.votes.length, countVoters());

                        return (
                            <div key={index} className="poll-message__option__container">
                                <input
                                    type="checkbox"
                                    checked={isOptionVoted(option)}
                                    disabled={!!votedOptionID}
                                    onChange={() => handleVote(option)} />
                                <div
                                    key={index}
                                    className={`poll-message__option__bar ${option.id === votedOptionID ? 'poll-message__option__bar--voted' : ''} `}
                                    onClick={() => handleVote(option)}>
                                    <span className='poll-message__option__bar__perc'>{perc}%</span>
                                    <span className='poll-message__option__bar__text'>{text}</span>
                                    <div
                                        className='poll-message__option__bar__fill'
                                        style={{ width: `${perc}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className='poll-message__results__votes'>{countVoters()}/{totalVotes} votes</p>
            </div>
            <div className="poll-message__confetti-container" ref={confettiContainerRef}>
                {showConfetti && (
                    <Confetti
                        width={confettiContainerRef.current.offsetWidth}
                        confettiSource={{
                            x: 200,
                            y: 320,
                            w: 0,
                            h: 0
                        }}
                        height={1000}
                        tweenDuration={1000}
                        recycle={false}
                        onConfettiComplete={() => setShowConfetti(false)}
                        numberOfPieces={40}
                    />
                )}
            </div>
        </div>
    )
}
