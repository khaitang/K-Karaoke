var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('databases/songs.db');

//Initialize db_dump
var db_dump = [];
queryDB("SELECT * FROM songs", initializeDbDump);

//Export functions
exports.queryDB = queryDB;
exports.dbDump = function() {
	return db_dump;
};

function queryDB(query_string, callback) {
	var db_result = [];
	db.all(query_string, function(err, rows) 
	{
		if(err === null) {
			console.log("Got results for query: "+query_string);
			db_result = rows;
		}
		else {
			console.log("Database Error: getAllSongs - "+err);
		}
		callback(db_result);
	});
}

function initializeDbDump(data) {
	console.log("Initialize database dump");
	db_dump = data;
}