import "./message.css";
import { format } from "timeago.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

export default function Message({ sender, userColor, content }: any) {
    return (
        <div className="message">
            {!!sender?.profileImg
                ? <img className='message__img' src={sender.profileImg} />
                : <div className='message__icon' style={{ backgroundColor: userColor }}>
                    <FontAwesomeIcon
                        icon={faUser} style={{ fontSize: '15px', color: '#ffffff' }} />
                </div>}
            <div>
                <p className='message__name' style={{ fontWeight: 'bold', color: userColor }}>{sender.name}</p>
                <p className='message__content'>{content}</p>
            </div>
        </div>
    );
}
