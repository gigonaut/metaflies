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
	post.createdAt = new Date();
	post.postId = 'post_' + self.get36(self.posts.length + 1);
	post.replies = [];
	self.posts.push(post);
	return post;
}

Workspace.prototype.addReply = function(reply) {
	var self = this;
	if (!reply.postId) {
		
	}
	console.log(self.posts);
	console.log(reply);
	var post = self.getPost(reply.postId);
	reply.replyId = 'reply_' + self.get36(post.replies.length + 1);
	post.replies.push(reply);
	return reply;
}

Workspace.prototype.getPost = function(postId) {
	var self = this;
	retPost = _.detect(self.posts, function(post) {
		return post.postId == postId;
	});
	return retPost;
}

Workspace.prototype.get36 = function(size) {
	return size.toString(36);
}

Workspace.prototype.getLatestPosts = function(count) {
	//get the last *count* messages
	count = count || 20;
}

Workspace.prototype.isPrivate = function() {
	var self = this;
	return self.private;
}

Workspace.setPassword = function(password) {
	
}

Workspace.authenticate = function(password) {
	
}
module.exports = Workspace;