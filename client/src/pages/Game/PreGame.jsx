import { useContext } from "react";
import socket from "../../socket";
import { useParams } from "react-router-dom";
import { Context } from ".";
import { AiOutlineLink } from "react-icons/ai";

const PreGame = ({ owner }) => {
	const { roomId } = useParams("roomId");
	const { playerList } = useContext(Context);

	const handleStart = () => {
		socket.emit("startGame", { roomId });
	};

	const handleCopyLink = (e) => {
		navigator.clipboard.writeText(`http://localhost:5173/game/${roomId}`);
	};

	return (
		<div className="h-full bg-white rounded-xl flex flex-col items-center justify-center gap-y-8">
			{owner ? (
				playerList.players.length > 1 ? (
					<button onClick={handleStart} className="w-1/4 rounded-lg bg-yellow-300 px-8 py-5 text-2xl">
						Start
					</button>
				) : (
					<p className="text-xl">Waiting for more players...</p>
				)
			) : (
				<p className="text-xl">Waiting for owner to start the game</p>
			)}
			<div className="flex flex-col justify-center items-center gap-y-2">
				<button onClick={handleCopyLink} className="flex justify-center items-center active:translate-x-px active:translate-y-px rounded-lg bg-green-400 p-3">
					<p className="text-sm mr-1">Copy room link</p>
					<AiOutlineLink />
				</button>
				<p className="text-sm">or</p>
				<p className="text-sm">{`Share room id: ${roomId}`}</p>
			</div>
		</div>
	);
};

export default PreGame;
