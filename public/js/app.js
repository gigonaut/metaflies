var Metaflies = {}

Metaflies.getWorkspace = function() {
	path = window.location.pathname.split('/');
	return path[path.length - 1];
}

Metaflies.send = function(message) {
	var self = this;
	now.sendBroadcast(self.getWorkspace, message);
}

Metaflies.receive = function(message) {
	var html = "";
	html += '<div class="message">';
	html += message;
	html += '</div>';
	console.log(html);
	$('#messages').prepend(html);
}

Metaflies.init = function() {
	var self = this;
	now.workspace = self.getWorkspace();
	now.receiveBroadcast = self.receive;
	self.initEvents();
}

Metaflies.initEvents = function() {
	var self = this;
	$('#message_form').submit(function(evt) {
		var message = $('#message').val();
		self.send(message);
		$('#message').val('');
		return false;
	});
}

$(document).ready(function() {
	Metaflies.init();
});

