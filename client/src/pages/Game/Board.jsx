import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PreGame from "./PreGame";
import Choosing from "./Choosing";
import socket from "../../socket";
import DrawingBoard from "./DrawingBoard";
import Result from "./Result";
import End from "./End";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Board = () => {
	const navigate = useNavigate();
	const { roomId } = useParams("roomId");
	const [room, setRoom] = useState(null);
	const [wordChoice, setWordChoice] = useState([]);
	const [countdown, setCountdown] = useState({ toggle: false, duration: 0 });
	const player = JSON.parse(localStorage.getItem("player")) ? JSON.parse(localStorage.getItem("player")).substring(0, 12) : "Player";

	useEffect(() => {
		socket.emit("joinRoom", { player, roomId }, ({ room, error }) => {
			if (room) setRoom((prev) => room);
			if (error) {
				alert(error);
				navigate("/");
			}
		});

		socket.on("newRound", (room, callback) => {
			setRoom((prev) => room);
			setCountdown((prev) => {
				return { toggle: false, duration: 0 };
			});
		});

		socket.on("wordChoice", (words, callback) => {
			setWordChoice((prev) => words);
			setCountdown((prev) => {
				return { toggle: false, duration: 0 };
			});
		});

		socket.on("startGuess", () => {
			setRoom((prev) => {
				return { ...prev, state: "GUESSING" };
			});
			setCountdown((prev) => {
				return { toggle: true, duration: 60 };
			});
		});

		socket.on("endRound", (room, callback) => {
			setRoom((prev) => room);
			setCountdown((prev) => {
				return { toggle: false, duration: 0 };
			});
		});

		socket.on("endGame", (room, callback) => {
			setRoom((prev) => room);
			setCountdown((prev) => {
				return { toggle: false, duration: 0 };
			});
		});

		return () => {
			socket.off("newRound");
			socket.off("wordChoice");
			socket.off("startGuess");
			socket.off("endRound");
		};
	}, []);

	useEffect(() => {
		if (room?.state === "BREAK")
			setCountdown((prev) => {
				return { toggle: true, duration: 6 };
			});
	}, [room]);

	const RenderBoard = () => {
		switch (room.state) {
			case "WAITING":
				return <PreGame owner={room.owner === socket.id} />;
			case "CHOOSING_WORD":
				return <Choosing isPainter={room.painter === socket.id} words={wordChoice} />;
			case "GUESSING":
				return <DrawingBoard isPainter={room.painter === socket.id} />;
			case "BREAK":
				return <Result room={room} />;
			case "END":
				return <End room={room} />;
			default:
				return <div>error</div>;
		}
	};

	return room ? (
		<div className="h-full relative">
			{countdown.toggle && (
				<div className="absolute top-1 right-1 z-10 pointer-events-none">
					<CountdownCircleTimer
						size={60}
						strokeWidth={5}
						isPlaying={countdown.toggle}
						duration={countdown.duration}
						colors={["#00FF00", "#FFFF00", "#FF0000"]}
						colorsTime={[countdown.duration, countdown.duration / 2, 0]}
					>
						{({ remainingTime }) => <p>{remainingTime}</p>}
					</CountdownCircleTimer>
				</div>
			)}
			<RenderBoard />
		</div>
	) : (
		<div>no room</div>
	);
};

export default Board;
