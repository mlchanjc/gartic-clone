import socket from "../../socket";
import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Context } from ".";

const End = ({ room }) => {
	const { roomId } = useParams("roomId");
	const [ranking, setRanking] = useState([]);
	const { playerList } = useContext(Context);

	const handleNewGame = () => {
		socket.emit("startGame", { roomId });
	};

	useEffect(() => {
		if (room?.players) {
			const sorted = [...room.players].sort((a, b) => b.score - a.score);
			setRanking(sorted);
		}
	}, []);

	return (
		<div className="h-full bg-white rounded-xl flex flex-col items-center justify-center relative">
			{playerList?.players.find((player) => player.id === socket.id).owner && (
				<button onClick={handleNewGame} className="absolute top-3 right-3 rounded-lg bg-yellow-300 px-4 py-2 text-sm">
					new game
				</button>
			)}
			<p className="text-4xl mt-3">Game Result</p>
			<div className="flex w-5/6 gap-x-2 h-full items-end">
				<div className="h-[65%] w-1/3 bg-gray-400 flex flex-col items-center justify-center gap-y-3">
					<p>{`${ranking[1]?.player ?? ""}`}</p>
					<p className="text-2xl">{`${ranking[1]?.score ?? ""}`}</p>
				</div>
				<div className="h-[90%] w-1/3 bg-yellow-500 flex flex-col items-center justify-center gap-y-3">
					<p>{`${ranking[0]?.player ?? ""}`}</p>
					<p className="text-2xl">{`${ranking[0]?.score ?? ""}`}</p>
				</div>
				<div className="h-[40%] w-1/3 bg-orange-800 flex flex-col items-center justify-center gap-y-3">
					<p>{`${ranking[2]?.player ?? ""}`}</p>
					<p className="text-2xl">{`${ranking[2]?.score ?? ""}`}</p>
				</div>
			</div>
		</div>
	);
};

export default End;
