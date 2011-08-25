var socket = io.connect('http://localhost');
var Metaflies = {};

var messageTemplate = new EJS({url: '/ejs/message.ejs'});
var bookmarkTemplate = new EJS({url: '/ejs/bookmark.ejs'});
var replyTemplate = new EJS({url: '/ejs/reply.ejs'});

Metaflies.getWorkspace = function() {
	path = window.location.pathname.split('/');
	return path[path.length - 1];
}

Metaflies.postMessage = function(message) {
	var self = this;
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
	})
}

Metaflies.postReply = function(message) {
	var self = this;
	var workspace = self.getWorkspace();
	$.ajax({
		url: ['http:/', workspace, 'posts'].join('/'),
		method: 'POST',
		data: JSON.stringify(message)
	})
}

Metaflies.receiveMessage = function(data) {
	var html = messageTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveReply = function(data) {
	
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
		var message = $('#message').val();
		
		self.postMessage({message: message});
		$('#message').val('');
		return false;
	});
	
	$('.reply_form').submit(function(evt) {
		
	})
}

$(document).ready(function() {
	Metaflies.init();
});

