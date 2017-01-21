var player_client_socket;
var current_queue = [];
var player_state = {"state":"---","playing":{"song":"---","song_type":"---","artist":"---"},"volume":0};

//EXPORTS
exports.addSong 					= addSong;
exports.getCurrentQueue 			= getCurrentQueue;
exports.setCurrentQueue				= setCurrentQueue;
exports.getCurrentState 			= getCurrentState;
exports.setCurrentState				= setCurrentState;
exports.setClient 					= setClient;
exports.updateCurrentlyPlayingSong 	= updateCurrentlyPlayingSong;
exports.playerControl				= playerControl;

function setClient(socket) {
	player_client_socket = socket;
}

function addSong(song_obj) {
	current_queue.push(song_obj);
	updatePlayerSongQueue();
}

function updatePlayerSongQueue() {
	console.log("Update player song queue");
	if(typeof(player_client_socket) !== "undefined") {
		player_client_socket.emit('updatedSongQueue', current_queue);
	}
}

function updateCurrentlyPlayingSong() {
	var currently_playing = current_queue.splice(0,1);
	console.log("Update current playing song to: "+JSON.stringify(currently_playing));
	if(currently_playing.length > 0) {
		player_state.state = "playing";
		player_state.playing.song = currently_playing[0].song;
		player_state.playing.song_type = currently_playing[0].song_type;
		player_state.playing.artist = currently_playing[0].artist;
	}

	updatePlayerSongQueue();
}

function playerControl(command) {
	if(typeof(player_client_socket) !== "undefined") {
		player_client_socket.emit('playerControl', command);
	}
}

function getCurrentQueue() {
	return current_queue;
}

function setCurrentQueue(new_queue) {
	current_queue = new_queue;
	updatePlayerSongQueue();
}

function getCurrentState() {
	return player_state;
}

function setCurrentState(new_state) {
	player_state.state = new_state;
}
