import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { VscSend } from "react-icons/vsc";
import { FaArrowLeft } from "react-icons/fa";
// https://backend-chat-production-b553.up.railway.app/ws
// 'http://localhost:8080/ws'
var stompClient = null;

const ChatRoom = () => {

    const [visible, setVisible] = useState(false)
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const connect = () => {
        let Sock = new SockJS('https://backend-chat-production-b553.up.railway.app/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    }

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    const onPrivateMessage = (payload) => {
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            };

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });
    }

    const registerUser = () => {
        connect();
    }

    const handleVisible = () => {
        if (visible) {
            setVisible(false);
        } else {
            setVisible(true);
        }
    }

    return (
        <div className="container w-full max-sm:p-0">
            {userData.connected ?
                <div className="chat-box max-sm:w-full max-sm:m-0 max-sm:h-[100vh]">
                    <div className="member-list max-sm:w-[100%] ">
                        <ul>
                            <li onClick={() => { setTab("CHATROOM") }} onMouseUp={handleVisible} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index} onMouseUp={handleVisible}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    {tab === "CHATROOM" && <div className={` ${visible?'max-sm:absolute':'max-sm:hidden'}  ${visible ? 'max-sm:left-0' : ''}  max-sm:h-[100vh] max-sm:bg-[#5f5f5f] max-sm:w-full max-sm:m-0`}>
                        <div className='xl:hidden lg:hidden md:hidden sm:visible max-sm:flex max-sm:justify-between max-sm:px-2 bg-[#1a1a1a] max-sm:h-[3em] max-sm:text-[white] max-sm:place-items-center '>
                            <h2 onClick={handleVisible}><FaArrowLeft/></h2>
                            <h2>{tab}</h2>
                        </div>
                        {/* ${chat.senderName === userData.username ? 'bg-[blueviolet]':'bg-[#1a1a1a]'} */}
                        <ul className="chat-messages" >
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}flex gap-2 `} key={index}>
                                    {chat.senderName !== userData.username && <div className="bg-[#1a1a1a] rounded-br-[8px] rounded-bl-[27%] rounded-tr-[8px]  text-[blueviolet] p-[6px] text-[15px] flex justify-center items-center h-[3em]">{chat.senderName}</div>}
                                    <div className={`message-data text-white font-bold bg-[#1a1a1a] rounded-[6px] py-[6px] px-[14px] flex`}><p className='p'>{chat.message}</p></div>
                                    {chat.senderName === userData.username && <div className="bg-[#1a1a1a] rounded-br-[27%] rounded-bl-[8px] rounded-tl-[22%]  text-[blueviolet] p-[6px] text-[15px] flex justify-center items-center h-[3em] self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message mt-2 gap-2  bg-[#1a1a1a] py-[6px] px-[20px]">
                            <textarea cols={100}  placeholder="enter the message" value={userData.message} onChange={handleMessage}  style={{resize:'none',overflowY :'hidden'}} className='rounded-[4px] '></textarea>
                            {/* <input type="text" className="h-12" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> */}
                            <button type="button" className="" onClick={sendValue}><VscSend className='text-[blueviolet] text-[40px] bg-black p-[6px] rounded-full' /></button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && <div className={`chat-content  max-sm:${visible ? 'absolute' : 'hidden'} max-sm:${visible?'left-0':''} max-sm:h-[100vh] max-sm:bg-[#5f5f5f] max-sm:w-full max-sm:m-0`}>
                        <div className='xl:hidden lg:hidden md:hidden sm:visible max-sm:flex max-sm:justify-between max-sm:px-2 bg-[#1a1a1a] max-sm:h-[3em] max-sm:text-[white] max-sm:place-items-center'>
                            <h2 onClick={handleVisible}><FaArrowLeft className='text-[blueviolet]'/></h2>
                            <h2>{tab}</h2>
                        </div>
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"} `} key={index}>
                                    {/* {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>} */}
                                    <div className={`message-data ${chat.senderName === userData.username ? 'bg-[blueviolet] rounded-bl-[8px] rounded-tl-[12px] rounded-br-[12px] ':'bg-[#1a1a1a] rounded-bl-[12px] rounded-tr-[12px] rounded-br-[8px]'} text-white font-bold py-[6px] px-[14px]`}>{chat.message}</div>
                                    {/* {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>} */}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message max-sm:mt-2 flex items-center">
                            <input type="text" className="input-message bg-black text-white h-[2.5em]" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="" onClick={sendPrivateValue}><VscSend className='text-[blueviolet] text-[40px] bg-black p-[6px] rounded-full' /></button>
                        </div>
                    </div>}
                </div>
                :
                <div className="register max-sm:static max-sm:p-[20px] max-sm:flex-col max-sm:gap-2 ">
                    <input className='border-b-2 border-[#d06aff] focus:outline-none '
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                        margin="normal"
                    />
                    <button type="button" onClick={registerUser} className='bg-black rounded-[8px]'>
                        connect
                    </button>
                </div>}
        </div>
    )
}

export default ChatRoom