var https = require('https');

exports.serve = function(req, res, user_key, search_string) {
	youtubeSearch(req, res, user_key, search_string);
}

function youtubeSearch(req, res, user_key, search_string) 
{
	if(search_string.indexOf("karaoke") == -1) 
	{
		search_string += " karaoke";
	}
	
	var youtube_path = '/youtube/v3/search';
	youtube_path += '?key='+user_key;
	youtube_path += '&part=id';
	youtube_path += '&topicId=/m/04c5p';
	youtube_path += '&type=video';
	youtube_path += '&maxResults=30';
	youtube_path += '&q='+encodeURIComponent(search_string);
	var options = {
		host: 'www.googleapis.com',
		path: youtube_path
	};
	https.request(options, function(https_res) {
		var res_str = '';
		https_res.on('data', function (chunk) {
			res_str += chunk;
		});
	
		https_res.on('end', function () {
			var results = {};
			try {
				results = JSON.parse(res_str);
			} catch(e) {
				console.log("Error parsing results from Youtube: "+e);
			}
			
			var video_ids_array = [];
			for(var video_item in results.items)
			{
				video_ids_array.push(results.items[video_item].id.videoId);
			}
			
			if(video_ids_array.length > 0)
			{
				youtubeVideoSearch(res, user_key, video_ids_array.join(","));
			}
			else
			{
				res.end("{}");
			}
			
		});
	}).end();
}

function youtubeVideoSearch(res, user_key, video_ids)
{
	var youtube_path = '/youtube/v3/videos';
	youtube_path += '?key='+user_key;
	youtube_path += '&part=snippet,statistics';
	youtube_path += '&fields=items(id,snippet(publishedAt,title,description,thumbnails(default)),statistics)';
	youtube_path += '&id='+video_ids;
	var options = {
		host: 'www.googleapis.com',
		path: youtube_path
	};
	https.request(options, function(https_res) {
		var res_str = '';
		https_res.on('data', function (chunk) {
			res_str += chunk;
		});
	
		https_res.on('end', function () {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(res_str);
		});
	}).end();
}