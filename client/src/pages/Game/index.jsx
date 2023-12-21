import { useEffect, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import PlayerList from "./PlayerList";
import MessageBox from "./MessageBox";
import ChatBox from "./ChatBox";
import Board from "./Board";
import { BsFillChatRightDotsFill } from "react-icons/bs";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { BiExit } from "react-icons/bi";

export const Context = createContext();

const ContextProvider = (props) => {
	const [playerList, setPlayerList] = useState(null);
	const [chats, setChats] = useState([]);
	const [messages, setMessages] = useState([]);
	const [lines, setLines] = useState([]);

	return <Context.Provider value={{ playerList, setPlayerList, chats, setChats, messages, setMessages, lines, setLines }}>{props.children}</Context.Provider>;
};

const Game = () => {
	const [chatMode, setChatMode] = useState({ smallScreen: false, chat: false });

	const navigate = useNavigate();

	const handleLeave = () => {
		if (window.confirm("Are you sure to leave?"))
			socket.emit("leaveRoom", null, () => {
				navigate("/");
			});
	};

	const handleResize = (e) => {
		e.preventDefault();
		const width = e.target.innerWidth;
		if (width >= 768)
			setChatMode((prev) => {
				return prev.smallScreen ? { ...prev, smallScreen: false } : prev;
			});
		else if (width < 768)
			setChatMode((prev) => {
				return !prev.smallScreen ? { ...prev, smallScreen: true } : prev;
			});
	};

	useEffect(() => {
		const alertUser = (e) => {
			e.preventDefault();
			e.returnValue = "";
		};

		if (window.innerWidth >= 768) setChatMode({ smallScreen: false, chat: false });
		else setChatMode({ smallScreen: true, chat: false });

		window.addEventListener("beforeunload", alertUser);
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("beforeunload", alertUser);
			window.removeEventListener("resize", handleResize);
			socket.emit("leaveRoom", null, () => {
				navigate("/");
			});
		};
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen select-none">
			<div className="items-center justify-around w-3/5 md:flex hidden">
				<h1 className="text-5xl mb-1">Gartic.clone</h1>
				<button onClick={handleLeave}>
					<BiExit size={30} />
				</button>
			</div>
			<ContextProvider>
				<div className="flex items-center w-full h-full md:w-[700px] lg:w-[900px] xl:w-[1100px] md:h-5/6 gap-x-4">
					<div className="h-1/2 w-1/3 md:h-full absolute md:static bottom-0 left-0 pl-2 pr-1 md:p-0">
						<PlayerList />
					</div>
					<div className="flex flex-col w-full md:w-2/3 h-full rounded-xl gap-y-4">
						<div className="h-1/2 md:h-2/3 absolute md:static top-0 left-0 w-full px-2 pb-2 md:p-0">
							<Board />
						</div>

						<div className="md:static h-1/2 md:h-1/3 absolute top-[52%] left-1/3 w-2/3 md:w-full flex">
							<div className="mr-2 ml-1 md:m-0 w-full h-full bg-white rounded-lg flex relative">
								{chatMode.smallScreen ? (
									<div className="w-full h-full relative">
										<button
											onClick={() =>
												setChatMode((prev) => {
													return { ...prev, chat: !prev.chat };
												})
											}
											className="absolute top-3 right-3 rounded-full p-2 bg-blue-400 z-10"
										>
											{chatMode.chat ? <HiMiniPencilSquare /> : <BsFillChatRightDotsFill />}
										</button>
										<div hidden={!chatMode.chat} className="w-full h-full">
											<ChatBox />
										</div>
										<div hidden={chatMode.chat} className="w-full h-full">
											<MessageBox />
										</div>
									</div>
								) : (
									<>
										<MessageBox />
										<div className="hidden md:block absolute inset-y-4 left-1/2 transform -translate-x-1/2 w-px bg-gray-400"></div>
										<ChatBox />
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</ContextProvider>
		</div>
	);
};

export default Game;
