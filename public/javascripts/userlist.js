/************************************************************* 
* userlist.js
* Handles displaying, updating, and responding to user 
* interactions 
*************************************************************/

//Angular
var list_app = angular.module('listApp', ['ng-sortable']);
list_app.controller('mainController', function($scope, $http) {
	$scope.sortType     = 'song'; // set the default sort type
	$scope.sortReverse  = false;  // set the default sort order
	$scope.searchTerm   = '';     // set the default search/filter term
	$scope.song_list 	= [];
	$scope.youtube_list = [];

	//Get list of songs
	$http.get("/getSongsInDatabase")
		.success(function (response) {
			console.log("Got response: "+response);
			songs_in_db = response;
			$scope.song_list = response.song_list;
		});
});

list_app.controller('playerPopupController', function($scope, $http) {
	$scope.song_queue 	= [];
	$scope.player_state = {"state":"","playing":{"song":"","song_type":"db_song","artist":"none"},"volume":0};
	$scope.playing = ($scope.player_state.state == "playing");
	$scope.queueConfig = {
		animation: 150,
		onStart: function(evt) {
			evt.stopPropagation();
		},
		onSort: function (evt){
			console.log("Sort or remove! New song queue: "+JSON.stringify($scope.song_queue));
			updateQueue($scope.song_queue);
		},
		handle: ".queue_item_handle"
	};

	$scope.removeSong = function(song) {
		var index = $scope.song_queue.indexOf(song);
		$scope.song_queue.splice(index, 1);
		updateQueue($scope.song_queue);
	};

	//Get current queue
	$http.get("/getCurrentQueue")
		.success(function (response) {
			console.log("Got current queue: "+JSON.stringify(response));
			$scope.song_queue = response;
		});

	//Get player state
	$http.get("/getPlayerState")
		.success(function (response) {
			console.log("Got player state: "+JSON.stringify(response))
			$scope.player_state = response;
			$scope.playing = ($scope.player_state.state == "playing");
			updatePlayPauseButton();
		});
});

//INTERNET SEARCH FUNCTIONS
function youtubeSearch()
{
	console.log("Youtube search called");

	//Perform search
	var search_string = $("#query").val();
	if(search_string == "" || search_string == "Search") {
		console.log("Clear internet results");
		var scope = angular.element($("#main_song_list_container")).scope();
		scope.$apply(function() {
			scope.youtube_list = [];
			scope.searchTerm = '';
		});
		return false;
	}
	console.log("Searching youtube for "+search_string);
	//search_string = encodeURIComponent(search_string);

	//Show clear button
	if($("#clear_search_button:visible").length == 0) {
		$("#clear_search_button").show();
	}

	$.ajax({
		method: "GET",
		url: "websearch",
		data: "search_string="+search_string
	})
	.done(function( search_results_json ) {
		//console.log("Got internet search results - "+JSON.stringify(search_results_json));
		/***
		{
			"items": [{
				"id": "Dd9W3PthynU",
				"snippet": {
					"publishedAt": "2014-08-22T17:00:02.000Z",
					"title": "Ed Sheeran - Thinking Out Loud (Karaoke Version)",
					"description": "Valentine's Day Playlist: http://bit.ly/V-list\n\nTo ensure that you never miss a brand new hit song, please subscribe to the Sing King Karaoke channel here: http://bit.ly/119sKFQ\n\nEd Sheeran - Thinking Out Loud (Karaoke Version)\n\nBuy or stream 'The Chosen Ones' featuring 'Thinking Out Loud' here:\n\niTunes: http://bit.ly/SingKingiTunes\nSpotify: http://bit.ly/SingKingSpotify\nGoogle Play: http://bit.ly/SingKingGoogle\nLoudr: http://bit.ly/TheChosen1z\n\nLearn your favourite songs and sing along to them in style with Sing King Karaoke - your number one source for YouTube karaoke and lyrics.\n\nYou can also find us on:\nFacebook - http://on.fb.me/189zrPZ\nTwitter - http://bit.ly/ImhTEt\nGoogle+ - http://bit.ly/1eP2bg1\nInstagram: http://bit.ly/Singstagram\nSnapchat: SingKingKaraoke\n\nIf you wish to use our music in your own YouTube videos, all we ask is that you leave a link to our channel and credit to Sing King for the instrumental in your video description. We also love to check out as many fan videos as possible, so feel free to send us a link for your covers :)",
					"thumbnails": {
						"default": {
							"url": "https://i.ytimg.com/vi/Dd9W3PthynU/default.jpg",
							"width": 120,
							"height": 90
						}
					}
				},
				"statistics": {
					"viewCount": "11660701",
					"likeCount": "25054",
					"dislikeCount": "1609",
					"favoriteCount": "0",
					"commentCount": "1205"
				}
			}]
		}
		****/
		try {
			var scope = angular.element($("#main_song_list_container")).scope();
			scope.$apply(function() {
				scope.youtube_list = search_results_json.items;
			});
		} catch(e) {
			console.log("Error parsing search results. "+ e);
		}
		
	});
	
	return false;
}

function clearSearch() {
	$("#query").val("").focus();
	$("#clear_search_button").hide();
	youtubeSearch();
}

//List functions
function scrollSmoothlyTo(element_id) {
	console.log("Scroll smoothly to "+element_id);
	$('html, body').animate({
		scrollTop: $("#"+element_id).offset().top
	}, 1000);
}











