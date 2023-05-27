import React from 'react'
import "./pollMessage.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Message from '../message/Message'

export default function PollMessage({ user, userColor, content, question, options, totalVotes }: any) {
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

    return (
        <div className='poll-message'>
            <Message user={user} userColor={userColor} content={content} />
            <div className="poll-message__results">
                <span className='poll-message__results__question'>{question}</span>
                <div className="poll-message__options">
                    {options.map((option: any) => {
                        const text = option?.text;
                        const perc = calculatePercOption(option?.votes.length, countVoters());

                        return (
                            <div className="poll-message__option__bar">
                                <span className='poll-message__option__bar__perc'>{perc}%</span>
                                <span className='poll-message__option__bar__text'>{text}</span>
                                <div
                                    className='poll-message__option__bar__fill'
                                    style={{ width: `${perc}%` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <p className='poll-message__results__votes'>{countVoters()}/{totalVotes} votes</p>
            </div>
        </div>
    )
}
