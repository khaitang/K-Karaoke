//var fs = require('fs');
var song_db = require('./database.js');
var clients = new Array();

exports.addClient 					= addClient;
exports.removeClient 				= removeClient;
exports.updateClientSongQueue 		= updateClientSongQueue;
exports.updateClientPlayerStatus	= updateClientPlayerStatus;

function addClient(socket) {
	clients[socket.id] = {"socket_obj":socket};
}

function removeClient(socket_id) {
	delete clients[socket_id];
}

function updateClientSongQueue(curr_song_list)  {
	console.log("Updating clients with new queue");
	for(var key in clients) {
		clients[key].socket_obj.emit('updatedSongQueue', curr_song_list);
	}
}

function updateClientPlayerStatus(curr_player_status) {
	console.log("Updating clients with new player status");
	for(var key in clients) {
		clients[key].socket_obj.emit('updatedPlayerState', curr_player_status);
	}
}