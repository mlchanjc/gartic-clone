import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { Context } from ".";

const ChatBox = () => {
	const { roomId } = useParams("roomId");
	const { chats, setChats } = useContext(Context);
	const [chat, setChat] = useState("");
	const listRef = useRef(null);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [chats]);

	useEffect(() => {
		socket.on("chat", (chat, callback) => {
			if (chats.length >= 50) {
				let temp = chats;
				temp.shift();
				setChats((prev) => [...temp, chat]);
			} else setChats((prev) => [...prev, chat]);
		});

		return () => {
			socket.off("chat");
		};
	}, []);

	const handleSubmit = (e) => {
		if (e.key === "Enter" && chat) {
			socket.emit("chat", { chat, roomId }, () => {
				setChat((prev) => "");
			});
		}
	};

	const handleInputChat = (e) => {
		if (e.target.value.length < 121) setChat(e.target.value);
	};

	return (
		<div className="w-full md:w-1/2 flex flex-col items-center justify-between rounded-xl p-4 relative h-full">
			<div className="absolute -top-4 left-0 rounded-lg px-2 py-1 bg-pink-400">Chat</div>
			<div className="overflow-y-auto w-full" ref={listRef}>
				{chats.map(({ chat, player, color }, i) => {
					return (
						<div key={`chat_${i}`} className="overflow-hidden">
							{player && <span className="text-xs mr-1 text-blue-400">{player}</span>}
							<span style={{ color: `${color}` }} className="text-xs">
								{chat}
							</span>
						</div>
					);
				})}
			</div>
			<input onKeyDown={handleSubmit} value={chat} onChange={handleInputChat} className="px-1 border-2 border-gray-400 rounded-md w-full focus:border-gray-700 focus:outline-none" />
		</div>
	);
};

export default ChatBox;
