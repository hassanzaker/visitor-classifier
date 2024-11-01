import React from 'react';
import { BsPlus } from 'react-icons/bs';

const Sidebar = ({ chats, activeChat, setActiveChat }) => {
    return (
        <div className="sidebar">

            <ul className="chat-list">
                <li
                    className={`chat-item`}
                    onClick={() => setActiveChat(null)}
                >
                    <span className="plus-icon"></span> New Website
                </li>
                {chats.map((chat) => (
                    <li
                        key={chat}
                        className={`chat-item ${activeChat && activeChat === chat ? 'active' : ''}`}
                        onClick={() => setActiveChat(chat)}
                    >
                        {chat}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;