/************************************************************* 
* user.js
* Initialization of global functions and general user JS
*************************************************************/
var socket = io.connect();
var user_info = {"name":""};
var songs_in_db = {};
var current_resolution = "";

$(document).ready(function() {
	initializeSocket();
	setResolution();
});

function initializeSocket() 
{
	socket = io.connect('',{'forceNew': true });
	
	socket.on('updatedSongQueue', function (new_queue) {
		console.log("Song queue update: "+new_queue);
		var scope = angular.element($("#player_popup")).scope();
		scope.$apply(function() {
			scope.song_queue = new_queue;
		});
	});

	socket.on("updatedPlayerState", function(new_player_state) {
		console.log("Player state update: "+JSON.stringify(new_player_state));
		var scope = angular.element($("#player_popup")).scope();
		scope.$apply(function() {
			scope.player_state = new_player_state;
			scope.playing = (new_player_state.state == "playing");
		});

		updatePlayPauseButton();
	});
}

function addSong(type, song_id, song, artist) {
	var	dataToSend = {"type":type, "song_id":song_id, "song":song, "artist":artist, "username":user_info.name};
	console.log("Add new song: "+JSON.stringify(dataToSend));

	//Send add request to server
	socket.emit("userRequestToAddSong", dataToSend);
	closeAddSongPopup();
}

function updateQueue(new_song_queue) {
	console.log("Update to new song queue: "+JSON.stringify(new_song_queue));
	socket.emit("userRequestToUpdateSongQueue", new_song_queue);
}

function updatePlayPauseButton() {
	var scope = angular.element($("#player_popup")).scope();
	var player_is_playing = scope.playing;

	//Update play/pause button
	if(player_is_playing) {
		//Playing so show the PAUSE button
		if(!$("#play_pause_button span").hasClass("glyphicon-pause")) {
			console.log("Show pause button");
			$("#play_pause_button span").removeClass("glyphicon-play").addClass("glyphicon-pause");
		}
	}
	else {
		//Paused, FF, RW, etc...so show the PLAY button
		if(!$("#play_pause_button span").hasClass("glyphicon-play")) {
			console.log("Show play button");
			$("#play_pause_button span").removeClass("glyphicon-pause").addClass("glyphicon-play");
		}
	}
}

function playerControl(command) {
	socket.emit("playerControl", command);
}

function showAddSongPopup(row_data) {
	var song_id 	= $(row_data).data("song_id");
	var type 		= $(row_data).data("type");
	var song 		= $(row_data).data("song");
	var artist 		= $(row_data).data("artist");

	console.log("showAddSongPopup => Song id: "+song_id+", type: "+type+", song: "+song+", artist: "+artist);
	$("#add_song_popup_ok_button").off("click").click(function() {
		addSong(type, song_id, song, artist);
	});

	$("#add_song_popup_songname").html(song);
	$("#add_song_popup_artist").html(artist);
	$('#add_song_popup').modal('show');
}

function closeAddSongPopup() {
	$('#add_song_popup').modal('hide');
}

function togglePlayerPopup() {
	if($("#player_popup:visible").length > 0) {
		$("#player_popup").animate({
			height: "toggle"
		}, 1000, function(){
			$("#overlay").hide();
		});
	}
	else {
		$("#overlay")
			.show()
			.off("click")
			.click(togglePlayerPopup);

		$("#player_popup").animate({
			height: "toggle"
		}, 1000);
	}
}

function toggleSortListPopup() {
	if($("#sort_list_popup:visible").length > 0) {
		$("#sort_list_popup").animate({
			height: "toggle"
		}, 500, function(){
			$("#overlay").hide();
		});
	}
	else {
		$("#overlay")
			.show()
			.off("click")
			.click(toggleSortListPopup);

		$("#sort_list_popup").animate({
			height: "toggle"
		}, 500);
	}
}

function setResolution() {
	if($( window ).width() >= 2000) {
		current_resolution = "2000";
	}
	else if($( window ).width() >= 1000) {
		current_resolution = "1000";
	}
	else if($( window ).width() >= 700) {
		current_resolution = "700";
	}
	else {
		current_resolution = "300";
	}
}
