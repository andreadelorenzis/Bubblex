import React, { useState, useEffect, useRef } from 'react'
import "./pollMessage.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Message from '../message/Message'
import Confetti from 'react-confetti';

export default function PollMessage({ myUser, sender, userColor, content, question, options, totalVotes, onUpdate, scrollableContainerRef }: any) {
    const [optionsState, setOptionsState] = useState<any[]>([])
    const [votedOptionID, setVotedOptionID] = useState<any>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiPosition, setConfettiPosition] = useState<any>({ top: 0, left: 0 });

    const confettiContainerRef: any = useRef(null);
    const MAX_DURATION = 2000;

    useEffect(() => {
        setOptionsState(options);
        for (let i = 0; i < options.length; i++) {
            if (isOptionVoted(options[i])) {
                setVotedOptionID(options[i].id);
                break;
            }
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollableContainerRef.current && confettiContainerRef.current) {
                const parentRect = scrollableContainerRef.current.getBoundingClientRect();
                const childRect = confettiContainerRef.current.getBoundingClientRect();

                const childPosition = {
                    top: childRect.top - parentRect.top + scrollableContainerRef.current.scrollTop,
                    left: childRect.left - parentRect.left + scrollableContainerRef.current.scrollLeft,
                };

                setConfettiPosition(childPosition);
            }
        };

        if (scrollableContainerRef.current) {
            scrollableContainerRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollableContainerRef.current) {
                scrollableContainerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const calculatePercOption = (votes: number, totalVotes: number) => {
        return Math.round((votes * 100) / totalVotes);
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
            const clonedOptionsState = [...optionsState];

            const optionToUpdate = clonedOptionsState.find(
                (option: any) => option.id === optionVoted.id
            );

            if (optionToUpdate) {
                optionToUpdate.votes.push(myUser);

                setOptionsState(clonedOptionsState);
                setVotedOptionID(optionVoted.id);
                onUpdate({}, optionVoted);
                setShowConfetti(true);
            }
        }
    }

    return (
        <div className='poll-message'>
            <Message sender={sender} userColor={userColor} content={content} />
            <div className="poll-message__results">
                <span className='poll-message__results__question'>{question}</span>
                <div className="poll-message__options">
                    {optionsState.map((option: any, index: any) => {
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
                            y: confettiPosition.top,
                            w: 0,
                            h: 0
                        }}
                        tweenDuration={1000}
                        height={1000}
                        recycle={false}
                        onConfettiComplete={() => setShowConfetti(false)}
                        numberOfPieces={40}
                    />
                )}
            </div>
        </div>
    )
}
