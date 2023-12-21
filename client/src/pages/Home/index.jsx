import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

const Home = () => {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");
	const [player, setPlayer] = useState(JSON.parse(localStorage.getItem("player")) ?? "Player");
	const [defaultMode, setDefaultMode] = useState(true);
	const [fileError, setFileError] = useState("");
	const [customWordList, setCustomWordList] = useState([]);

	useEffect(() => {
		if (defaultMode) setFileError("");
	}, [defaultMode]);

	const handleInputRoomId = (e) => {
		//Number only
		if ((/^[0-9]$/.test(e.nativeEvent.data) || e.nativeEvent.data === null) && e.target.value.length < 6) {
			setRoomId(e.target.value);
		}
	};

	const handleInputName = (e) => {
		//Max player name length 12
		if (e.target.value.length < 13) setPlayer(e.target.value);
	};

	const handleCreateRoom = () => {
		localStorage.setItem("player", JSON.stringify(player));
		socket.emit("createRoom", defaultMode ? null : customWordList, (roomId) => {
			navigate(`/game/${roomId}`);
		});
	};

	const handlePlay = () => {
		localStorage.setItem("player", JSON.stringify(player));
		navigate(`/game/${roomId}`);
	};

	const handleUploadFile = (e) => {
		if (e.target.files) {
			if (e.target.files.length > 1) {
				setFileError("You can only upload 1 file");
				setCustomWordList([]);
			} else if (e.target.files[0].name.substring(e.target.files[0].name.length - 4) !== ".txt") {
				setFileError("You can only upload txt file");
				setCustomWordList([]);
			} else {
				const reader = new FileReader();
				reader.onload = handleFileRead;
				reader.readAsText(e.target.files[0], "UTF-8");
			}
		}
	};

	const handleFileRead = (e) => {
		const content = e.target.result;
		const temp = [];
		content.split("\n").forEach((word) => {
			if (word.trim().toLowerCase() !== "") temp.push(word.trim().toLowerCase());
		});
		if (temp.length < 10) {
			setFileError("At least 10 words should be included");
			setCustomWordList([]);
		} else setCustomWordList(temp);
	};

	return (
		<div className="flex flex-col justify-center items-center min-h-screen select-none">
			<h1 className="text-3xl md:text-6xl text-blue-800 mt-7">Gartic.clone</h1>
			<div className="overflow-auto w-11/12 md:w-[700px] lg:w-[900px] h-full md:h-[62vh] flex flex-col md:flex-row justify-center items-center bg-gray-100 rounded-3xl">
				<div className="mt-8 md:mt-0 w-full md:w-1/2 flex flex-col items-center justify-center gap-y-6">
					<p className="text-4xl text-center">Join room</p>
					<div className="w-4/5 lg:w-2/3">
						<div className="flex flex-col justify-center items-center">
							<label>Name: </label>
							<input className="rounded-md border-2 border-gray-500 p-1" type="text" value={player} onChange={handleInputName} />
						</div>
					</div>
					<div className="w-4/5 lg:w-2/3">
						<div className="flex flex-col justify-center items-center">
							<label>Room: </label>
							<input className="rounded-md border-2 border-gray-500 p-1" type="text" value={roomId} onChange={handleInputRoomId} />
						</div>
					</div>
					<button
						className={`${!roomId.length ? "pointer-events-none bg-gray-300" : "bg-red-300"}  active:translate-x-px active:translate-y-px rounded-lg px-4 py-2`}
						onClick={handlePlay}
					>
						Play
					</button>
				</div>
				<div className="flex md:flex-col w-full md:w-[2px] md:h-full justify-center items-center my-10 md:my-0">
					<div className="w-1/3 h-[1px] md:w-[1px] md:h-1/3 border border-gray-500"></div>
					<p className="-translate-y-[2px] mx-[5px]">or</p>
					<div className="w-1/3 h-[1px] md:w-[1px] md:h-1/3 border border-gray-500"></div>
				</div>
				<div className="w-2/3 md:w-1/2 flex items-center justify-center">
					<div className="w-full flex flex-col items-center gap-y-6">
						<p className="text-4xl text-center">Create room</p>
						<button
							className={`w-5/6 lg:w-2/3 active:translate-x-px active:translate-y-px rounded-lg bg-green-400 p-3 ${defaultMode && "ring-4 ring-green-500"}`}
							onClick={() => setDefaultMode(true)}
						>
							<div className="flex flex-col">
								<p className="text-start text-xl">Default mode</p>
								<p className="text-start text-xs">Play with pre-defined wordlist</p>
							</div>
						</button>
						<button
							className={`w-5/6 lg:w-2/3 active:translate-x-px active:translate-y-px rounded-lg bg-orange-400 p-3 ${!defaultMode && "ring-4 ring-orange-500"}`}
							onClick={() => setDefaultMode(false)}
						>
							<div className="flex flex-col">
								<p className="text-start text-xl">Custom mode</p>
								<p className="text-start text-xs">Upload your own wordlist!</p>
							</div>
						</button>
						<div className="flex flex-col justify-center items-center">
							<div className={`${!defaultMode ? "visible" : "invisible"} flex flex-col justify-center items-center`}>
								<input className=" w-[80px] h-[30px]" onInput={handleUploadFile} type="file" accept=".txt" />
								<p className="text-red-600 ">{fileError}</p>
								<p className={`${!defaultMode && customWordList.length > 0 ? "visible" : fileError === "" ? "invisible" : "hidden"} text-green-600`}>
									File uploaded
								</p>{" "}
							</div>
							<button
								className={`${
									!defaultMode && customWordList.length === 0 ? "pointer-events-none bg-gray-300" : "bg-red-300"
								}  active:translate-x-px active:translate-y-px rounded-lg px-4 py-2 mt-6`}
								onClick={handleCreateRoom}
							>
								Create room
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
