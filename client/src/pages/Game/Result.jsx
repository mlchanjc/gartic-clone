import React from "react";
import socket from "../../socket";

const Result = ({ room }) => {
	const renderResult = () => {
		const player = room.players.find((player) => player.id === socket.id);
		if (player?.isPainter) return <p>Get ready for the next round!</p>;
		else if (room.guessedCount === room.players.length - 1) return <p>Everyone guessed it right!</p>;
		else if (room.guessedCount === 0)
			return (
				<div className="flex flex-col items-center">
					<p>{"No one guessed it right:("}</p>
					<p>{`The correct answer is ${room.currentWord}`}</p>
				</div>
			);
		else return <p>{`The correct answer is ${room.currentWord}`}</p>;
	};

	return <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center text-xl">{renderResult()}</div>;
};

export default Result;
