var socket = io.connect('http://localhost');
var Metaflies = {};

var messageTemplate = new EJS({url: '/ejs/message.ejs'});
var bookmarkTemplate = new EJS({url: '/ejs/bookmark.ejs'});
var replyTemplate = new EJS({url: '/ejs/reply.ejs'});

Metaflies.getWorkspace = function() {
	path = window.location.pathname.split('/');
	return path[path.length - 1];
}

Metaflies.receiveMessage = function(data) {
	console.log(data);
	var html = messageTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveReply = function(data) {
	console.log(data);
	var html = replyTemplate.render(data);
	$('#' + data.messageId + ' div.replies').prepend(html);
}

Metaflies.receiveBookmark = function(data) {
	var html = bookmarkTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveReply = function(data) {
	var thread = $('#' + data.parent_id);
	var html = replyTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.init = function() {
	var self = this;
	self.initEvents();
	socket.on('post added', self.receiveMessage);
	socket.on('reply added', self.receiveReply);
	socket.on('bookmark added', self.receiveBookmark);
	// socket.on('message', self.recieve);
}

Metaflies.initEvents = function() {
	var self = this;
	
	$('#name_form').submit(function(evt) {
		var nickname = $('#nickname').val();
		self.setNickname(nickname);
		$('#message').val('');
		$(this).hide();
		return false;
	});
	
	$('#message_form').submit(function(evt) {
		var message = {message: $('#message').val()};
		var workspace = self.getWorkspace();
		var url = ['', workspace, 'posts'].join('/');
		console.log(url);
		$.ajax({
			url: url,
			type: 'POST',
			data: message,
			complete: function(data, other) {
				console.log(data);
				console.log(other);
			}
		});
		
		$('#message').val('');
		return false;
	});
	
	$('.reply_form').live('submit', function(evt) {
		var reply = {};
		var workspace = self.getWorkspace();
		var url = ['', workspace, 'replies'].join('/');
		
		reply.reply = $(this).find('.reply').val();
		reply.messageId = $(this).closest('.message').attr('id');
		console.log(url);
		$.ajax({
			url: url,
			type: 'POST',
			data: reply,
			complete: function(data, other) {
				console.log(data);
				console.log(other);
			}
		});
		$(this).find('.reply').val('');
		return false;
	});
}

$(document).ready(function() {
	Metaflies.init();
});
