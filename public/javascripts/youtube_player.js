var yt_player;
//var yt_iframe;
//var doc_selector = document.querySelector.bind(document);

function onYouTubeIframeAPIReady() {
  yt_player = new YT.Player('web_video_screen', {
	events: {
	  'onReady': onPlayerReady,
	  'onStateChange': onPlayerStateChange,
	  'onError': onPlayerError
	}
  });
}

function onPlayerReady(event) {
	console.log("YT player is ready to rock and roll!!!");
	//yt_iframe = doc_selector('#web_video_screen');
	resizePlayers();
}

function onPlayerStateChange(event) {
	var yt_states = {"-1":"unstarted", "0":"ended", "1":"playing", "2":"paused", "3":"buffering", "5":"video cued"};
	console.log("YT player state change: "+yt_states[event.data]);
	if(event.data == 0) //ENDED
	{
		playNext();
	}
}

function onPlayerError(event) {
	console.log("YT player error: "+event.data);
	console.log("Play next song in queue.");
	playNext();
}