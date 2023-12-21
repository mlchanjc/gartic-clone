import { useState, useRef, useEffect, useContext } from "react";
import { Stage, Layer, Line } from "react-konva";
import socket from "../../socket";
import { Context } from ".";

const Guessing = () => {
	const { lines, setLines } = useContext(Context);
	const parentRef = useRef();

	useEffect(() => {
		socket.on("updateDrawing", (lines, callback) => {
			setLines((prev) => lines);
		});

		return () => {
			socket.off("updateDrawing");
				setLines(prev => [])
		};
	}, []);

	return (
		<div className="w-full h-full" ref={parentRef}>
			<Stage width={parentRef.current?.offsetWidth} height={parentRef.current?.offsetHeight}>
				<Layer>
					{lines.map((line, i) => (
						<Line
							key={i}
							points={line.points}
							stroke="#df4b26"
							strokeWidth={5}
							tension={0.5}
							lineCap="round"
							lineJoin="round"
							globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
						/>
					))}
				</Layer>
			</Stage>
		</div>
	);
};

export default Guessing;
