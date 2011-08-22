var socket = io.connect('http://localhost');
var Metaflies = {}

var messageTemplate = new EJS({url: '/ejs/message.ejs'});

Metaflies.getWorkspace = function() {
	path = window.location.pathname.split('/');
	return path[path.length - 1];
}

Metaflies.send = function(message) {
	var self = this;
	socket.emit('post message', {message: message});
}

Metaflies.setNickname = function(nickname) {
	var self = this;
	socket.emit('set nickname', nickname);
}

Metaflies.receiveMessage = function(data) {
	var html = messageTemplate.render(data);
	$('#messages').prepend(html);
}

Metaflies.receiveReply = function(data) {
	
}

Metaflies.receiveBookmark = function(data) {
	var html = "";
	html += '<div class="bookmark">';
	html += '<p><a href="' + data.location + '" class="bookmark">' + data.name + '</a></p>';
	html += '</div>';
	console.log(html);
	$('#messages').prepend(html);
}

Metaflies.receiveResponse = function(data) {
	
}

Metaflies.init = function() {
	var self = this;
	self.initEvents();
	
	socket.on('receive message', self.receiveMessage);
	socket.on('receive reply', self.receiveReply);
	socket.on('receive bookmark', self.receiveBookmark);
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
		self.send(message);
		$('#message').val('');
		return false;
	});
	
	$('.reply_form').submit(function(evt) {
		
	})
}

$(document).ready(function() {
	Metaflies.init();
});

