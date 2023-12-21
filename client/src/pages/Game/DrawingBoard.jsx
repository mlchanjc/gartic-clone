import Drawing from "./Drawing";
import Guessing from "./Guessing";

const DrawingBoard = ({ isPainter }) => {
	return <div className="h-full bg-white rounded-xl flex flex-col items-center">{isPainter ? <Drawing /> : <Guessing />}</div>;
};

export default DrawingBoard;
