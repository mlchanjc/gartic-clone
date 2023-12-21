import { useEffect, useContext } from "react";
import socket from "../../socket";
import { Context } from ".";
import { FaPaintbrush } from "react-icons/fa6";

const PlayerCard = ({ player }) => {
	return (
		<div className="flex rounded-t-xl items-center h-24 m-2 gap-x-1">
			{player ? (
				<div className="grid grid-flow-col grid-rows-3 rounded-xl relative bg-green-400 w-full px-2">
					{player.isPainter && (
						<div className="absolute top-1 right-1 rounded-full p-2 bg-gray-700">
							<FaPaintbrush color="white" />
						</div>
					)}
					<p className="text-xs md:text-xl truncate">{player.player}</p>
					<p className="text-xs md:text-xl">{`Score: ${player.score}`}</p>
					<p className="text-xs md:text-xl">{player.owner ? "owner" : null}</p>
				</div>
			) : (
				<div className="grid grid-flow-col grid-rows-3 rounded-xl bg-gray-400 w-full px-2 overflow-hidden">
					<p className="text-xs md:text-xl">waiting...</p>
				</div>
			)}
		</div>
	);
};

const PlayerList = () => {
	const { playerList, setPlayerList } = useContext(Context);

	useEffect(() => {
		socket.on("updatePlayer", ({ players, maxPlayer }, callback) => {
			setPlayerList((prev) => {
				return { players, maxPlayer };
			});
		});

		return () => {
			socket.off("updatePlayer");
		};
	}, []);

	return (
		<div className="flex flex-col h-full w-full rounded-xl bg-white overflow-auto">
			{playerList &&
				Array.from({ length: playerList.maxPlayer }).map((item, index) => {
					return <PlayerCard player={playerList.players[index]} key={`player_${index}`} />;
				})}
		</div>
	);
};

export default PlayerList;
