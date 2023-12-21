const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const natural = require("natural");
const pos = require("pos");

let randomWordModule;
async function loadRandomWordModule() {
	randomWordModule = await import("random-words");
}
loadRandomWordModule();

const router = require("./router.js");
const Room = require("./room.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(router);

io.on("connection", (socket) => {
	socket.on("createRoom", (customWordList, callback) => {
		const roomId = Room.createRoom(socket.id, customWordList);
		callback(roomId);
	});

	socket.on("joinRoom", (data, callback) => {
		const { room, error } = Room.joinRoom({ ...data, id: socket.id });
		if (room) {
			socket.join(room.roomId);
			io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
		}
		callback({ room, error });
	});

	socket.on("leaveRoom", (data, callback) => {
		const { room, player } = Room.leaveRoom({ id: socket.id });
		if (room) {
			const message = `${player?.player} has left the room`;
			socket.broadcast.to(room.roomId).emit("message", { message });
			socket.leave(room.roomId);
			if (room.players.length === 1) {
				reset(room.roomId);
				room.owner = room.players[0].id;
				room.players[0].owner = true;
				io.to(room.roomId).emit("endGame", room);
			} else if (room.players.length > 0 && room.owner === socket.id) {
				room.owner = room.players[0].id;
				room.players[0].owner = true;
			}
			io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
		}
		callback();
	});

	socket.on("disconnect", (data, callback) => {
		const { room, player } = Room.leaveRoom({ id: socket.id });

		//if the player was in a room
		if (room) {
			const message = `${player?.player} has left the room`;
			socket.broadcast.to(room.roomId).emit("message", { message });
			socket.leave(room.roomId);
			if (room.players.length === 1) {
				reset(room.roomId);
				room.owner = room.players[0].id;
				room.players[0].owner = true;
				io.to(room.roomId).emit("endGame", room);
			} else if (room.players.length > 0 && room.owner === socket.id) {
				room.owner = room.players[0].id;
				room.players[0].owner = true;
			}
			io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
		}
	});

	socket.on("message", ({ message, roomId }, callback) => {
		const room = Room.getRoomById(roomId);
		const player = room.players.find((player) => player.id === socket.id);
		if (room.state !== "GUESSING") {
			io.to(roomId).emit("message", { message, player });
		} else {
			if (room.painter === socket.id) io.to(socket.id).emit("message", { message: "You cannot guess as the painter!", color: "red" });
			else if (player.guessed) io.to(socket.id).emit("message", { message: "You have already guessed the answer!", color: "red" });
			else {
				const similarityThreshold = 0.9;
				const jaroWinklerDistance = natural.JaroWinklerDistance(message.toLowerCase(), room.currentWord);
				if (jaroWinklerDistance === 1) {
					player.score += room.guessedCount === 0 ? 30 : room.guessedCount === 1 ? 20 : 10;
					room.guessedCount++;
					player.guessed = true;
					socket.broadcast.to(roomId).emit("message", { message: `${player.player} hit!`, color: "green" });
					io.to(socket.id).emit("message", { message: "Correct!", color: "green" });
					io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
				} else if (jaroWinklerDistance >= similarityThreshold || message.toLowerCase().includes(room.currentWord)) {
					io.to(socket.id).emit("message", { message: "Your guess is close!", color: "#FFCF40" });
				} else {
					io.to(roomId).emit("message", { message, player });
				}
				if (!room.players.some((player) => !player.guessed && !player.isPainter)) {
					clearTimeout(room.countdown);
					end(roomId);
					room.countdown = setTimeout(() => {
						start(roomId);
					}, 6500);
				}
			}
		}
		callback();
	});

	socket.on("chat", ({ chat, roomId }, callback) => {
		const { player } = Room.getPlayerById(socket.id);
		const room = Room.getRoomById(roomId);
		if (room.state !== "GUESSING") {
			io.to(roomId).emit("chat", { chat, player });
		} else {
			const similarityThreshold = 0.9;
			const jaroWinklerDistance = natural.JaroWinklerDistance(chat.toLowerCase(), room.currentWord);
			if (jaroWinklerDistance >= similarityThreshold || chat.toLowerCase().includes(room.currentWord)) {
				io.to(socket.id).emit("chat", { chat: "Your message is too close to the answer!", color: "#FFCF40" });
			} else {
				io.to(roomId).emit("chat", { chat, player });
			}
		}
		callback();
	});

	socket.on("updateDrawing", ({ lines, roomId }, callback) => {
		io.to(roomId).emit("updateDrawing", lines);
	});

	socket.on("startGame", ({ roomId }, callback) => {
		if (Room.getRoomById(roomId).players.length > 1) {
			reset(roomId);
			start(roomId);
		}
	});

	//after painter has chosen a word
	socket.on("chooseWord", ({ roomId, word }, callback) => {
		const room = Room.getRoomById(roomId);
		room.state = "GUESSING";
		room.currentWord = word;
		room.countdown = setTimeout(() => {
			end(roomId);
			room.countdown = setTimeout(() => {
				start(roomId);
			}, 6500);
		}, 60500);
		io.to(roomId).emit("startGuess");
	});
});

/*
	helper functions
*/
const getRandomWord = () => {
	const posTags = ["NN", "VB"];

	let word = randomWordModule.generate();
	let posWord = new pos.Lexer().lex(word);
	let tagger = new pos.Tagger();
	let tag = tagger.tag(posWord)[1];
	while (!tag in posTags) {
		word = randomWordModule.generate();
	}

	return word;
};

//for end round(right after the 60s timer)
const end = (roomId) => {
	const room = Room.endRound(roomId);
	if (room) {
		io.to(room.roomId).emit("endRound", room);
		io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
	}
};

//for start round(right before new painter choose a word)
const start = (roomId) => {
	let room = Room.getRoomById(roomId);
	if (room) {
		if (room.players.some((player) => player.score >= room.winningScore)) {
			room.state = "END";
			io.to(roomId).emit("endGame", room);
		} else {
			room = Room.newRound(roomId);
			let words = [];
			if (room.customWordList) {
				//Reset appearedIndex if only around 20% of words left
				if (room.appearedIndex.length + Math.max(Math.floor(room.customWordList.length * 0.2), 2) >= room.customWordList.length) room.appearedIndex = [];
				for (let i = 0; i < 2; i++) {
					let index;
					do {
						index = Math.floor(Math.random() * room.customWordList.length);
					} while (room.appearedIndex.includes(index));

					words.push(room.customWordList[index]);
					room.appearedIndex.push(index);
				}
			} else {
				words = [getRandomWord(), getRandomWord()];
			}
			io.to(room.painter).emit("wordChoice", words);
			io.to(roomId).emit("newRound", room);
			io.to(room.roomId).emit("updatePlayer", { players: room.players, maxPlayer: room.maxPlayer });
		}
	}
};

const reset = (roomId) => {
	const room = Room.getRoomById(roomId);
	if (room) {
		room.players.forEach((player) => {
			player.guessed = false;
			player.isPainter = false;
			player.score = 0;
		});
		clearTimeout(room.countdown);
		room.state = "WAITING";
		room.appearedIndex = [];
		room.painter = null;
		room.currentWord = "";
		room.guessedCount = 0;
		room.countdown = 0;
	}
};

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));
