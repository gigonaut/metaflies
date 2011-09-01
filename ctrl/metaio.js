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
		var session = socket.handshake.session
		// socket.set('workspace', workspaceId);
		socket.workspace = self.workspacer.workspaces[workspaceId];
		// socket.session = socket.handshake.session;
		socket.currentUser = session.currentUser;
		socket.join(socket.handshake.workspaceId);
		console.log('connected');
		
		socket.on('post sent', function(post) {
			post.nickname = socket.currentUser.nickname;
			post = workspace.addPost(post);
			io.sockets.in(workspaceId).emit('post added', post);
		});
		
		socket.on('reply sent', function(reply) {
			reply.nickname = socket.currentUser.nickname;
			reply = workspace.addReply(reply);
			io.sockets.in(workspaceId).emit('reply added', reply);
		});

		// socket.on('post message', function(data) {
		// 	data.nickname = socket.session.currentUser.nickname;
		// 	data.postedAt = new Date();
		// 	console.log(Workspace.getRandomId(5));
		// 	data.messageId = ['message', Workspace.getRandomId(5)].join('_');
		// 	console.log('wtf???')
		// 	console.log(data.messageId);
		// 	workspace.posts.push(data);
		// 	io.sockets.in(workspaceId).emit('post added', data);
		// });
	});
	
	io.set('authorization', function(data, accept) {
		if (data.headers.referer) {
			
			var reqUrl = url.parse(data.headers.referer);
			//let this be the last path
			workspaceId = reqUrl.pathname.replace('/', '');
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
					console.log(err);
					accept(err.message, false);
				} else {
					data.session = new Session(data, session);
					// accept the incoming connection
					accept(null, true);
				}
			});
			
		} else {
			// if there isn't, turn down the connection with a message
			// and leave the function.
			return accept('No cookie transmitted.', false);
		}
	});
	return self;
}


module.exports = MetaIo;