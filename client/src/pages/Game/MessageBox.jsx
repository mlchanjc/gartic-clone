import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { Context } from ".";

const MessageBox = () => {
	const { roomId } = useParams("roomId");
	const { messages, setMessages } = useContext(Context);
	const [message, setMessage] = useState("");
	const listRef = useRef(null);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages]);

	useEffect(() => {
		socket.on("message", (message, callback) => {
			if (messages.length >= 50) {
				let temp = messages;
				temp.shift();
				setMessages((prev) => [...temp, message]);
			} else setMessages((prev) => [...prev, message]);
		});

		return () => {
			socket.off("message");
		};
	}, []);

	const handleSubmit = (e) => {
		if (e.key === "Enter" && message) {
			socket.emit("message", { message, roomId }, () => {
				setMessage((prev) => "");
			});
		}
	};

	const handleInputMessage = (e) => {
		if (e.target.value.length < 121) setMessage(e.target.value);
	};

	return (
		<div className="w-full md:w-1/2 flex flex-col items-center justify-between rounded-xl p-4 relative h-full">
			<div className="absolute -top-4 left-0 rounded-lg px-2 py-1 bg-green-400">Guess here!</div>
			<div className="overflow-y-auto w-full" ref={listRef}>
				{messages.map(({ message, player, color }, i) => {
					return (
						<div key={`message_${i}`} className="overflow-hidden">
							{player && <span className="text-xs mr-1 text-blue-400">{player.player}</span>}
							<span style={{ color: `${color}` }} className="text-xs">
								{message}
							</span>
						</div>
					);
				})}
			</div>
			<input onKeyDown={handleSubmit} value={message} onChange={handleInputMessage} className="px-1 border-2 border-gray-400 rounded-md w-full focus:border-gray-700 focus:outline-none" />
		</div>
	);
};

export default MessageBox;
