import React, { useEffect, useState } from 'react'
import "./pollForm.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faTrash, faPoll } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid';
import Modal from '../modal/Modal';
import ErrorAlert from '../errorAlert/ErrorAlert';
import { fireError } from '../../utils/appUtils';

export default function PollForm({ onSubmit, onClose }: any) {
    const [question, setQuestion] = useState<string>("");
    const [options, setOptions] = useState<any[]>([]);
    const [optionsNum, setOptionsNum] = useState<number>(1);

    useEffect(() => {
        const uniqueId = uuidv4();
        setOptions((prevOptions: any) => {
            return [...prevOptions, {
                id: uniqueId,
                text: '',
                votes: []
            }]
        });
    }, []);

    const addOption = () => {
        if (optionsNum < 10) {
            const uniqueId = uuidv4();
            setOptions((prevOptions: any) => {
                return [...prevOptions, {
                    id: uniqueId,
                    text: '',
                    votes: []
                }]
            });
            setOptionsNum((prevOptionsNum) => prevOptionsNum + 1);
        }
    }

    const removeOption = (id: string) => {
        if (optionsNum > 1) {
            const updatedOptions = options.filter((option: any) => option.id !== id);
            setOptions(updatedOptions);
            setOptionsNum((prevOptionsNum) => prevOptionsNum - 1);
        }
    }

    const handleQuestionChange = (e: any) => {
        setQuestion(e.target.value);
    }

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>, id: any) => {
        const updatedOptions = options.map((option: any) => {
            if (option.id === id) {
                return { ...option, text: e.target.value };
            }
            return option;
        });
        setOptions(updatedOptions);
    }

    const handleSubmit = () => {
        if (question.trim() === "") {
            fireError("Please, add a question")
            return;
        }
        if (options.length <= 1) {
            fireError("Please, add at least two options")
            return;
        }

        onClose();
        onSubmit('poll', { question, options });
    };

    return (
        <>
            <Modal
                header={(<span className='poll-modal__header'>
                    <FontAwesomeIcon icon={faPoll} style={{ fontSize: '40px' }} />
                    <h2>Poll</h2>
                </span>)}
                content={(
                    <div className='poll-form'>
                        <label htmlFor="question" style={{ marginTop: '10px' }}>Question:</label>
                        <input type="text" id="question" onChange={handleQuestionChange} value={question} />
                        <hr style={{ width: '100%', color: '#ddd' }} />
                        <label className='poll-form__options__label'>Options:</label>
                        <div className='poll-form__options'>
                            {options.map((option: any) => {
                                return (
                                    <div key={option.id} className='poll-form__option'>
                                        <input
                                            type="text"
                                            id={option.id}
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(e, option.id)}
                                        />
                                        <button onClick={() => removeOption(option.id)}>
                                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '17px', marginLeft: '15px' }} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="poll-form__add-btn" onClick={addOption}>
                            <FontAwesomeIcon icon={faPlusCircle} style={{ fontSize: '20px', marginRight: '7px', color: 'green' }} /> Add option
                        </button>
                    </div>
                )}
                footer={(
                    <button onClick={handleSubmit} className='poll-form__submit-btn'>Create poll</button>
                )}
                onClose={onClose}
            />
        </>
    );
}
