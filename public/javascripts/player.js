var socket = null;
var song_queue = [];
var songs_in_db = {};

$(document).ready(function() {
	//launchIntoFullscreen(document.documentElement);
	initializeSocket();
	$.getJSON('/getCurrentQueue', function(song_list_items) {
		song_queue = song_list_items;
		if(song_queue.length > 0) {
			setTimeout(function() {
				playNext();
			}, 1000);
		}
	});

	$.getJSON('/getSongsInDatabase', function(song_list_items) {
		songs_in_db = song_list_items;
	});

	$.getJSON('/getServerIp', function(server_ip_addresses) {
		var ip_address = "";
		var ip_address_line = "";
		$.each(server_ip_addresses.server_ip, function(idx, val) {
			ip_address += "http://"+val+"<br>";
			ip_address_line += "http://"+val+" ";
		});
		$("#url_ip").html(ip_address);
		$("#url_ip_line").html(ip_address_line);
	});

	//Resize Players to be as big as possible
	resizePlayers();
});

function playNext() {
	console.log("playNext() called");
	if(next_song_data = getNextSongData()) {
		console.log("Play this next: "+JSON.stringify(next_song_data));
		//HTML5
		if(next_song_data.type == "db_song") {
			var filename = next_song_data.filename;
			$("#video_screen").attr("src", "songs/"+filename);

			//Stop and hide Youtube player
			console.log("Stop and hide youtube player");
			yt_player.stopVideo();
			$("#web_video_screen").hide();
			$("#no_songs_in_queue:visible").hide();

			//Play HTML5 video player
			console.log("Play video: "+filename);
			$("#video_screen").show();
			$("#server_address").show();
			document.getElementById("video_screen").play();
		}
		//YOUTUBE
		else {
			var video_id = next_song_data.song_id;
			yt_player.loadVideoById(video_id, 0, "large");

			//Pause and hide HTML5 player
			document.getElementById("video_screen").pause();
			$("#video_screen").hide();
			$("#no_songs_in_queue:visible").hide();

			//Play youtube player
			console.log("Play web video: "+video_id);
			$("#server_address").show();
			$("#web_video_screen").show();
			yt_player.playVideo();
		}
		
		//REMOVE FROM USER LISTS
		socket.emit("playerPlayingNewSong");
	}
	else {
		console.log("No songs in queue");
		document.getElementById("video_screen").pause();
		yt_player.stopVideo();

		$("#video_screen").hide();
		$("#web_video_screen").hide();
		$("#server_address").hide();
		$("#no_songs_in_queue").show();	
	}
}

function getNextSongData() {
	if(song_queue.length > 0) {
		var next_song = song_queue[0];
		if(next_song.type == "db_song") {
			//returns false if it does not find anything
			return getSongData(next_song.song_id, next_song); 
		}
		else {
			console.log("Return non-db song data");
			return next_song;
		}
	}
	else {
		//No songs in queue
		return false;
	}
}

function getSongData(song_id, return_obj) {
	if(typeof(songs_in_db.song_list) !== "undefined") {
		for(var idx=0; idx<songs_in_db.song_list.length; idx++) {
			song_data = songs_in_db.song_list[idx];
			if(song_data.song_id == song_id) {
				console.log("Found song data for song id: "+song_id);
				if(typeof(return_obj) === "undefined") {
					return_obj = {};
				}
				return_obj.filename = song_data.filename;

				return return_obj;
			}
		}
	}
	console.log("Could not find song data for song id: "+song_id);
	return false;
}

function playPauseSong() 
{
	var new_state = "playing";
	if($("#video_screen").is(":visible"))
	{
		var myVideo = document.getElementById("video_screen");
		if (myVideo.paused)
		{
			console.log("Resume playing - HTML5 video player");
			myVideo.play();
		}
		else
		{
			console.log("Pause playing - HTML5 video player");
			myVideo.pause();
			new_state = "paused";
		}
	}
	else
	{
		if(yt_player.getPlayerState() == 1) //playing
		{
			console.log("Pause Youtube video player");
			yt_player.pauseVideo();
			new_state = "paused";
		}
		else
		{
			console.log("Resume Youtube video player");
			yt_player.playVideo();
		}
	}

	socket.emit("playerStateUpdate", {"state":new_state});
}

function volumeUp()
{
	if($("#video_screen").is(":visible")) {
		console.log("Turn volume up - HTML5 video player");
		var myVideo = document.getElementById("video_screen");
		var new_volume = myVideo.volume + 0.1;
		if(new_volume <= 1.0) { myVideo.volume = new_volume; }
	}
	else {
		console.log("Turn volume up - Youtube video player");
		var new_volume = yt_player.getVolume() + 5;
		if(new_volume <= 100)
		{
			yt_player.setVolume(new_volume);
		}
	}
}

function volumeDown()
{
	if($("#video_screen").is(":visible")) {
		console.log("Turn volume down - HTML5 video player");
		var myVideo = document.getElementById("video_screen");
		var new_volume = myVideo.volume - 0.1;
		if(new_volume >= 0) { myVideo.volume = new_volume; }
	}
	else {
		console.log("Turn volume down - Youtube video player");
		var new_volume = yt_player.getVolume() - 5;
		if(new_volume >= 0)
		{
			yt_player.setVolume(new_volume);
		}
	}
}

function rewindVideo()
{
	if($("#video_screen").is(":visible"))
	{
		console.log("Rewind - HTML5 video player");
		var myVideo = document.getElementById("video_screen");
		if(myVideo.readyState != 0)
		{
			var new_current_time = myVideo.currentTime - 5;
			if(new_current_time >= 0) { myVideo.currentTime = new_current_time; }
		}
	}
}

function fastForwardVideo()
{
	if($("#video_screen").is(":visible"))
	{
		console.log("FastForward - HTML5 video player");
		var myVideo = document.getElementById("video_screen");
		if(myVideo.readyState != 0)
		{
			var new_current_time = myVideo.currentTime + 5;
			if(new_current_time <= myVideo.duration) { myVideo.currentTime = new_current_time; }
		}
	}
}

function initializeSocket() 
{
	socket = io.connect('',{'forceNew': true });
	
	//ADD LISTENERS
	socket.on('socketCreated', function() {
		setTimeout(function () {
			socket.emit("identifyPlayer");
		}, 500);
	});
	
	socket.on('playerControl', function (command) {
		switch(command) 
		{
			case 'skip_song':
				playNext();
				break;
			
			case 'play_pause_song':
				playPauseSong();
				break;
			
			case 'volume_up':
				volumeUp();
				break;
			
			case 'volume_down':
				volumeDown();
				break;

			case 'rewind':
				rewindVideo();
				break;

			case 'fast_forward':
				fastForwardVideo();
				break;
		}
	});

	socket.on('updatedSongQueue', function (new_queue) {
		song_queue = new_queue;

		//PLAY RIGHT AWAY IF NOTHING IS PLAYING
		if($("#no_songs_in_queue").is(":visible"))
		{
			playNext();
		}
	});
}

function resizePlayers()
{
	console.log("Resizing players");
	var w = window.innerWidth;
	var h = window.innerHeight;

	//HTML5 Player
	$("#video_screen").attr("width", w);
	$("#video_screen").attr("height", h);

	//Youtube player
	if(typeof(yt_player) != "undefined") {
		yt_player.setSize(w, h);
	}
}

function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}