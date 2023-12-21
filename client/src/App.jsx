import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Error from "./pages/Error";
import socket from "./socket";
import bg from "./assets/bg.png";

function App() {
	socket.on("connect", () => {
		console.log("Socket connected");
	});

	return (
		<div className="min-h-screen font-chango" style={{ backgroundImage: `url(${bg})` }}>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/game/:roomId" element={<Game />} />
					<Route path="*" element={<Error />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
