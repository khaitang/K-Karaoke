//GLOBAL VARS
var http = require('http');
var fs = require('fs');
var url = require('url');
var socket_io = require('socket.io');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static')
var user = require('./node_includes/user.js');
var player = require('./node_includes/player.js')
var websearch = require('./node_includes/websearch.js');
var song_db = require('./node_includes/database.js');
var os = require('os');
var __config;
var server;
var websocket;
var static_file;

main();

function main() {
	process.on('uncaughtException', globalErrorHandler);

	getConfig();
	initializeServer();
	initializeWebsockets();
}

function globalErrorHandler (e) {
	console.log("Global error: "+e);
}

function getConfig() {
	try {
		var config_string = fs.readFileSync(__dirname + "/config.json", encoding='utf8');
		__config = JSON.parse(config_string);
	}
	catch(e) {
		console.log("Could not find config.json");
	}
}

function initializeServer() {
	//SERVER
	console.log("Start server on port: "+__config.port);
	server = http.createServer(serverHandler);
	server.listen(__config.port);
	static_file = serveStatic(__config.document_root, {'index':['user.html']});

	websocket = socket_io.listen(server);
}

function serverHandler(req, res) {
	var client_ip = req.connection.remoteAddress;
	console.log("Requested: "+req.url);
	var pathname = url.parse(req.url).pathname;
	var querystring = url.parse(req.url, true).query;

	if(pathname == '/getSongsInDatabase') {
		var songs_in_db_json = song_db.dbDump();
		songs_in_db_json = {"song_list":songs_in_db_json};
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(songs_in_db_json));
	}
	else if(pathname == '/player') {
		req.url = 'player.html';
		var done = finalhandler(req, res);
		static_file(req, res, done);
	}
	else if(pathname == '/getCurrentQueue') {
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(player.getCurrentQueue()));
	}
	else if(pathname == '/getPlayerState') {
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(player.getCurrentState()));
	}
	else if(pathname == '/websearch') {
		var search_string = querystring.search_string;
		console.log("Search querystring: "+search_string);
		websearch.serve(req, res, __config.youtube_key, search_string);
	}
	else if(pathname == '/getServerIp') {
		var server_ip = getServerIp();
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end('{"server_ip":'+JSON.stringify(server_ip)+'}');
	}
	else {
		var done = finalhandler(req, res);
		static_file(req, res, done);
	}
}

function initializeWebsockets() 
{
	websocket.on('connection', function (socket) {
		//ADD TO CLIENT LIST
		user.addClient(socket);
		socket.emit("socketCreated", socket.id);
		
		//DISCONNECT
		socket.on('disconnect', function() {
			console.log("Client disconnect. Deleting "+socket.id+" from list");
			user.removeClient(socket.id);
		});

		//IDENTIFY PLAYER
		socket.on('identifyPlayer', function() {
			console.log("Player client has been created");
			user.removeClient(socket.id);
			player.setClient(socket);
		});
		
		//ADD AND REMOVE SONGS
		socket.on('userRequestToAddSong', function (song) {
			console.log("Adding song: "+JSON.stringify(song));
			player.addSong(song);
			user.updateClientSongQueue(player.getCurrentQueue());
		});

		socket.on('userRequestToUpdateSongQueue', function (new_song_queue) {
			console.log("New song queue: "+JSON.stringify(new_song_queue));
			player.setCurrentQueue(new_song_queue);
			user.updateClientSongQueue(player.getCurrentQueue());
		});

		socket.on('playerPlayingNewSong', function () {
			console.log("Player is playing a new song");
			player.updateCurrentlyPlayingSong();
			user.updateClientSongQueue(player.getCurrentQueue());
			user.updateClientPlayerStatus(player.getCurrentState());
		});

		socket.on('playerStateUpdate', function (player_state) {
			console.log("Player state update: "+player_state.state);
			player.setCurrentState(player_state.state);
			user.updateClientPlayerStatus(player.getCurrentState());
		});
	
		//CONTROLS
		socket.on('playerControl', function (command) {
			console.log("playerControl: "+command);
			player.playerControl(command);
		});
	});
}

function getServerIp() {
	var ifaces = os.networkInterfaces();
	var ip_addresses = [];

	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}

			ip_addresses.push(iface.address+":"+__config.port);
		});
	});

	return ip_addresses;
}