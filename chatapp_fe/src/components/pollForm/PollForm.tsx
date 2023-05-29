import React, { useState } from 'react'
import "./pollForm.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid';

export default function PollForm({ onSubmit }: any) {
    const [question, setQuestion] = useState<string>("");
    const [options, setOptions] = useState<any>({
        'someId': ''
    });
    const [optionsNum, setOptionsNum] = useState<number>(1);

    const addOption = () => {
        const uniqueId = uuidv4();
        setOptions((prevOptions: any) => {
            return {
                ...prevOptions,
                [uniqueId]: ""
            }
        });
        setOptionsNum((prevOptionsNum) => prevOptionsNum + 1);
    }


    const removeOption = (id: string) => {
        if (optionsNum > 1) {
            const optionsCopy: any = { ...options };
            delete optionsCopy[id];
            setOptions(optionsCopy);
            setOptionsNum((prevOptionsNum) => prevOptionsNum - 1);
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: any) => {
        setOptions((prevOptions: any) => {
            return {
                ...prevOptions,
                [id]: e.target.value
            }
        });
    }

    /* const handleSubmit = () => {
        const optionsArray = Object.keys(options).map((option: string) => options[option]);
        onSubmit(optionsArray);
    }; */

    const handleSubmit = () => {
        onSubmit({ question, options });
    };

    return (
        <div className='poll-form'>
            <label htmlFor="question" style={{ marginTop: '10px' }}>Question:</label>
            <input type="text" id="question" />
            <hr style={{ width: '100%', color: '#ddd' }} />
            <label className='poll-form__options__label'>Options:</label>
            <div className='poll-form__options'>
                {Object.keys(options).map((option: any) => {
                    return (
                        <div key={option} className='poll-form__option'>
                            <input
                                type="text"
                                id={option}
                                value={options[option]}
                                onChange={(e) => handleChange(e, option)}
                            />
                            <button onClick={() => removeOption(option)}>
                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: '17px', marginLeft: '15px' }} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <button className="poll-form__add-btn" onClick={addOption}>
                <FontAwesomeIcon icon={faPlusCircle} style={{ fontSize: '20px', marginRight: '7px', color: 'green' }} /> Add option
            </button>
            <button onClick={handleSubmit} className='poll-form__submit-btn'>Create poll</button>
        </div>
    );
}
