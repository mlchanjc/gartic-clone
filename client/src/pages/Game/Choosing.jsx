import React from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";

const Choosing = ({ isPainter, words }) => {
	const { roomId } = useParams("roomId");

	const handleChooseWord = (word) => {
		socket.emit("chooseWord", { word, roomId });
	};

	return (
		<div className="flex flex-col justify-center gap-y-8 h-full bg-white rounded-xl">
			{isPainter && <p className="text-center text-xl">Choose a word to draw!</p>}
			<div className="flex items-center justify-evenly">
				{isPainter ? (
					words.map((word, i) => (
						<button
							key={`word_${i}`}
							onClick={() => handleChooseWord(word)}
							className="min-w-fit w-1/4 active:translate-x-px active:translate-y-px rounded-lg bg-yellow-300 px-4 py-5 text-lg"
						>
							{word}
						</button>
					))
				) : (
					<p className="text-xl">Waiting for painter to choose a word</p>
				)}
			</div>
		</div>
	);
};

export default Choosing;
