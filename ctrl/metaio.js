var socks = require('socket.io');
var Socket = require('socket.io');
var url = require('url');
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var Workspace = require('../lib/workspace');


function MetaIo(options) {
	var self = this;
	var app = options.app;
	self.workspacer = options.workspacer;
	self.io = Socket.listen(app);
	self.sessionStore = options.sessionStore;
	
	io.sockets.on('connection', function(socket) {
		var workspaceId = socket.handshake.workspaceId;
		var workspace = self.workspacer.workspaces[workspaceId];
		var currentUser = socket.handshake.session.currentUser;
		socket.set('workspace', workspaceId);
		socket.session = socket.handshake.session;
		socket.join(socket.handshake.workspaceId);

		socket.on('client ready', function() {
			
		});
		socket.on('post message', function(data) {
			console.log(socket.session);
			data.nickname = socket.session.currentUser.nickname;
			data.postedAt = new Date();
			data.message_id = ['message', Workspace.getRandomId(5)].join('_')
			workspace.posts.push(data);
			io.sockets.in(workspaceId).emit('post added', data);
		});
		
		socket.on('set nickname', function(nickname) {
			socket.session.currentUser = {nickname: nickname};
		});
	});
	
	io.set('authorization', function(data, accept) {
		if (data.headers.referer) {
			var reqUrl = url.parse(data.headers.referer);
			//let this be the last path
			workspaceId = reqUrl.pathname.replace('/', '')
			data.workspaceId = workspaceId;
		}
		// check if there's a cookie header
		if (data.headers.cookie) {
			// if there is, parse the cookie
			data.cookie = parseCookie(data.headers.cookie);
			// note that you will need to use the same key to grad the
			// session id, as you specified in the Express setup.
			data.sessionId = data.cookie['connect.sid'];
			data.sessionStore = self.sessionStore;
			sessionStore.get(data.sessionId, function(err, session) {
				if (err) {
					accept(err.message, false);
				} else {
					console.log(session);
					data.session = new Session(data, session);
					// accept the incoming connection
					accept(null, true);
				}
			})
			
		} else {
			// if there isn't, turn down the connection with a message
			// and leave the function.
			return accept('No cookie transmitted.', false);
		}

	});
	return self;
}


module.exports = MetaIo;