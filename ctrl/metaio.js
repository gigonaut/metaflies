var socks = require('socket.io');
var Socket = require('socket.io');
var url = require('url');
var parseCookie = require('connect').utils.parseCookie;


function MetaIo(options) {
	var self = this;
	self.workspacer = options.workspacer;
	
	self.io = Socket.listen(options.app);
	
	io.sockets.on('connection', function(socket) {
		var workspaceId = socket.handshake.workspaceId;
		var workspace = workspacer.workspaces[workspaceId];
		console.log(workspaceId);
		console.log(workspacer);
		socket.session = socket.handshake.sessionID;
		socket.join(workspaceId);
		console.log(socket);


		socket.on('post message', function(data) {
			socket.get('nickname', function(err, nickname) {
				
				if (nickname) {
					data.nickname = nickname;
				}
				data.postedAt = new Date();

				io.sockets.in(workspaceId).emit('receive message', data);
			});
		});
		
		socket.on('set nickname', function(nickname) {
			console.log(nickname);
			socket.set('nickname', nickname, function() {
				socket.emit('ready');
			});
		});
	});
	
	io.set('authorization', function(data, accept) {
		if (data.headers.referer) {
			var reqUrl = url.parse(data.headers.referer);
			//let this be the last path
			reqUrl = reqUrl.pathname.replace('/', '')
			// console.log(reqUrl.pathname.replace('/', ''));
			data.workspaceId = reqUrl.pathname;
		}
		// check if there's a cookie header
			if (data.headers.cookie) {
				// if there is, parse the cookie
				data.cookie = parseCookie(data.headers.cookie);
				// note that you will need to use the same key to grad the
				// session id, as you specified in the Express setup.
				data.sessionID = data.cookie['connect.sid'];
			} else {
				// if there isn't, turn down the connection with a message
				// and leave the function.
				return accept('No cookie transmitted.', false);
			}
			// accept the incoming connection
			accept(null, true);
	});
	return self;
}


module.exports = MetaIo;