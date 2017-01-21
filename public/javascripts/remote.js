/************************************************************* 
* remote.js
* Functions for controlling and updating the remote
*************************************************************/

function removeSong(song, song_file, item_num)
{
	//USE THE SONG ID TIMESTAMP TO REMOVE SONG
	var song_id = 1;
	socket.emit("userRequestToRemoveSong", song_id);
}
