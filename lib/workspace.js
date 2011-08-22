var _ = require('underscore');

function Workspace(options) {
	var self = this;
	
	_.each(options, function(val, key) {
		self[key] = val
	});
	self.posts = [];
}

Workspace.getRandomId = function(size) {
	var self = this;
	size =  size || 10;
	var str = "";
	
	function getRandomChar() {
		var chars = "0123456789abcdefghijklmnopqurstuvwxyz";
		return chars.substr( getRandomNumber(37), 1 );
	}
	
	function getRandomNumber(range) {
		return Math.floor(Math.random() * range);
	}
	
	for (var i = 0; i < size; i++) {
		str += getRandomChar();
	}

	return str;
}

Workspace.prototype.addPost = function(post) {
	//add the message to the list;
	var self = this;
	self.posts.add(post);
}

Workspace.prototype.getLatestPosts = function(count) {
	//get the last *count* messages
	count = count || 20;
}

module.exports = Workspace;