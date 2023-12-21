let rooms = [];
let players = [];

/* helper functions */

const getPlayerById = (id) => {
	return players.find((p) => p.id === id);
};

const getRoomById = (roomId) => {
	return rooms.find((room) => room.roomId === roomId);
};

const createRoom = (owner, customWordList) => {
	let roomId;
	do {
		roomId = Math.floor(Math.random() * 90000) + 10000; //from 10000 to 99999
	} while (rooms.some((room) => room.roomId === roomId)); //check if duplicated roomId

	roomId = roomId.toString();

	rooms.push({
		roomId,
		players: [],
		maxPlayer: 12,
		state: "WAITING", //(WAITING,CHOOSING_WORD,GUESSING,BREAK,END)
		painter: null,
		currentWord: "",
		guessedCount: 0, // no.of players have correctly guessed the current word
		owner,
		countdown: 0, //for storing setTimeout
		winningScore: 60,
		customWordList, //if null = default mode
		appearedIndex: [], //for customWordList
	});

	return roomId;
};

const joinRoom = ({ player, roomId, id }) => {
	const room = getRoomById(roomId);
	if (!room) return { error: "The room does not exist" };

	if (room.players.length < room.maxPlayer) {
		if (!room.players.some((p) => p.id === id)) room.players.push({ player, id, guessed: false, score: 0, isPainter: false, owner: id === room.owner ? true : false });
		if (!getPlayerById(id)) players.push({ player, roomId, id });
		else return { error: "You have already joined a room" };

		return { room };
	}
	return { error: "The room is full" };
};

const leaveRoom = ({ id }) => {
	//first check if the player is currently in a room
	const player = getPlayerById(id);
	if (player) {
		const roomId = player.roomId;
		const room = getRoomById(roomId);
		room.players = room.players.filter((p) => p.id !== id);
		players = players.filter((p) => p.id !== id);
		if (room.players.length === 0) removeRoom(roomId);
		return { room, player };
	}
	return { player };
};

const removeRoom = (roomId) => {
	clearTimeout(getRoomById(roomId)?.countdown ?? 0);
	rooms = rooms.filter((room) => room.roomId !== roomId);
};

const setPainter = (roomId) => {
	const room = getRoomById(roomId);
	if (room) {
		room.players.forEach((player) => (player.isPainter = false));
		if (room.painter) {
			for (let i = 0; i < room.players.length; i++) {
				if (room.players[i].id === room.painter) {
					let painter = i < room.players.length - 1 ? room.players[i + 1].id : room.players[0].id;
					room.painter = painter;
					room.players.find((player) => player.id === painter).isPainter = true;
					break;
				}
			}
		} else {
			room.painter = room.players[0].id;
			room.players[0].isPainter = true;
		}
	}
};

const newRound = (roomId) => {
	const room = getRoomById(roomId);
	if (room) {
		room.guessedCount = 0;
		room.state = "CHOOSING_WORD";
		setPainter(roomId);
		return room;
	}
};

const endRound = (roomId) => {
	const room = getRoomById(roomId);
	if (room) {
		room.players.find((player) => player.isPainter).score += Math.min(room.guessedCount * 5, 30);
		room.players.forEach((player) => (player.guessed = false));
		room.state = "BREAK";
		return room;
	}
};

module.exports = { createRoom, joinRoom, leaveRoom, removeRoom, getPlayerById, getRoomById, newRound, endRound };
