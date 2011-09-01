var socket = io.connect('http://localhost');
var Metaflies = {};

var messageTemplate = new EJS({url: '/ejs/message.ejs'});
var bookmarkTemplate = new EJS({url: '/ejs/bookmark.ejs'});
var uploadTemplate = new EJS({url: '/ejs/upload.ejs'});
var replyTemplate = new EJS({url: '/ejs/reply.ejs'});

Metaflies.getWorkspace = function() {
	path = window.location.pathname.split('/');
	return path[path.length - 1];
}

Metaflies.receivePost = function(data) {
	console.log(data);
	var html = messageTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveUpload = function(data) {
	console.log(data);
	var html = uploadTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveBookmark = function(data) {
	var html = bookmarkTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveReply = function(data) {
	console.log(data);
	var thread = $('#' + data.postId + ' div.replies');
	var html = replyTemplate.render(data);
	thread.prepend(html);
}

Metaflies.init = function() {
	var self = this;
	self.initEvents();
	socket.on('post added', self.receivePost);
	socket.on('reply added', self.receiveReply);
	socket.on('bookmark added', self.receiveBookmark);
	socket.on('upload added', self.receiveUpload);
}

Metaflies.initEvents = function() {
	var self = this;
	
	$('#message_form').submit(function(evt) {
		var post = {message: $('#message').val()};
		var workspace = self.getWorkspace();
		// var url = ['', workspace, 'posts'].join('/');
		if (post.message.length > 0) {
			socket.emit('post sent', post)
		}
		$('#message').val('');
		return false;
	});
	
	$('.reply_form').live('submit', function(evt) {
		var reply = {};
		var workspace = self.getWorkspace();		
		reply.reply = $(this).find('.reply').val();
		reply.postId = $(this).closest('.post').attr('id');
		if (reply.reply.length > 0) {
			socket.emit('reply sent', reply);
		}
		$(this).find('.reply').val('');
		return false;
	});
}

$(document).ready(function() {
	Metaflies.init();
});
