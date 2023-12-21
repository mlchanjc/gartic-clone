import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { Stage, Layer, Line } from "react-konva";
import _ from "lodash";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { Context } from ".";

const Drawing = () => {
	const { roomId } = useParams("roomId");
	const [tool, setTool] = useState("pen");
	const { lines, setLines } = useContext(Context);
	const isDrawing = useRef(false);
	const parentRef = useRef();
	const [isParentRefReady, setIsParentRefReady] = useState(false);

	useEffect(() => {
		if (parentRef.current) {
			setIsParentRefReady(true);
		}
		return () => {
			setLines((prev) => []);
		};
	}, []);

	const updateLinesRef = useRef();
	updateLinesRef.current = async () => {
		socket.emit("updateDrawing", { lines, roomId });
	};

	//Update lines at most once per 0.05s
	const updateLines = useCallback(
		_.throttle(() => updateLinesRef.current(), 50),
		[]
	);

	const handleMouseDown = (e) => {
		if (tool === "clear") {
			setLines([]);
			return;
		}
		isDrawing.current = true;
		const pos = e.target.getStage().getPointerPosition();
		setLines([...lines, { tool, points: [pos.x, pos.y] }]);
	};

	const handleMouseMove = (e) => {
		// no drawing - skipping
		if (!isDrawing.current) {
			return;
		}
		const stage = e.target.getStage();
		const point = stage.getPointerPosition();

		let lastLine = lines[lines.length - 1];
		// add point
		lastLine.points = lastLine.points.concat([point.x, point.y]);
		// replace last
		lines.splice(lines.length - 1, 1, lastLine);
		setLines(lines.concat());
		updateLines();
	};

	const handleMouseUp = () => {
		isDrawing.current = false;
	};

	const handleMouseLeave = () => {
		isDrawing.current = false;
	};

	return (
		<div className="w-full h-full" ref={parentRef}>
			{isParentRefReady && (
				<>
					<select
						value={tool}
						onChange={(e) => {
							setTool(e.target.value);
						}}
					>
						<option value="pen">Pen</option>
						<option value="eraser">Eraser</option>
						<option value="clear">Clear</option>
					</select>
					<Stage
						width={parentRef.current?.offsetWidth}
						height={parentRef.current?.offsetHeight}
						onMouseLeave={handleMouseLeave}
						onMouseDown={handleMouseDown}
						onMousemove={handleMouseMove}
						onMouseup={handleMouseUp}
					>
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
				</>
			)}
		</div>
	);
};

export default Drawing;
