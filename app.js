
/**
 * Module dependencies.
 */

var express = require('express'), 
		MemoryStore = express.session.MemoryStore,
		form = require('connect-form');
		app = module.exports = express.createServer(),//form({ keepExtensions: true })), 
		sessionStore = new MemoryStore(),
		conf = require('./conf/conf'),
		Workspace = require('./lib/workspace'),
		Workspacer = require('./lib/workspacer'),
		Metaflies = require('./ctrl/metaflies'), 
		workspacer = new Workspacer(), 
		metaIo = new require('./ctrl/metaio')({app: app, workspacer: workspacer, sessionStore: sessionStore}), 
		_ = require('underscore');


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
	app.set('view options', {title: 'Metaflies', routejs: null, _: _, workspaceCount: 0})
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ store: sessionStore, secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
	var workspace = new Workspace({name: Workspace.getRandomId()});
	res.render('workspaces/new', {workspace: workspace, workspaceCount: workspacer.wsCount()})
});

app.get('/:workspace_id', requireWorkspace, requireAuthorization, requireNickname, function(req, res) {
	console.log('no_error');
	var workspaceId = req.param('workspace_id');
	var workspace = req.workspace;
	var bookmarklet = ['http:/', req.headers.host, req.param('workspace_id'), 'bookmark'].join('/');
	res.render('workspaces/show', {workspace: workspace, bookmarklet: bookmarklet, workspaceCount: workspacer.wsCount()});
});

app.post('/workspaces', function(req, res) {
	var workspace = new Workspace(req.body.workspace);
	workspacer.addWorkspace(workspace, function(err, data) {
		if (err) {
			// console.log(err);
			res.redirect('/');
		} else {
			res.redirect('/' + workspace.name);
		}
	});
});

app.get('/:workspace_id/join', requireWorkspace, function(req, res) {
	var workspace = req.workspace;
	res.render('workspaces/join', {workspace: workspace});
});

app.post('/:workspace_id/join', requireWorkspace, function(req, res) {
	var currentUser = req.session.currentUser || {}
	var workspace = req.workspace;
	currentUser.nickname = req.param('nickname');
	if (workspace.isPrivate() && req.param('password') == workspace.password) {
		currentUser.workspace = workspace.name;
	}
	console.log(currentUser)
	req.session.currentUser = currentUser;
	res.redirect('/' + req.param('workspace_id'))
});

app.post('/:workspace_id/upload', requireWorkspace, requireAuthorization, requireNickname, Metaflies.upload, function(req, res) {
	var upload = req.upload;
	var workspace = req.workspace;
	var currentUser = req.session.currentUser;
	var post = {nickname: currentUser.nickname, uploadKey: req.upload.key, upload: upload}
	console.log('uploading...')
	console.log(post);
	workspace.addPost(post);
	metaIo.io.sockets.in(workspace.name).emit('upload added', post);
	res.redirect('/' + req.param('workspace_id'));
});



app.get('/:workspace_id/bookmark', requireWorkspace, requireAuthorization, requireNickname, function(req, res) {
	var currentUser = req.session.currentUser;
	var location = req.param('location');
	var locationName = req.param('name');
	var post = {nickname: currentUser.nickname, location: location, name: locationName}
	var workspace = req.workspace
	workspace.addPost(post);
	metaIo.io.sockets.in(workspace.name).emit('bookmark added', post)
	res.redirect(req.param('location'));
});


app.get('/d/:workspace_id/:key/:upload.:ext', requireWorkspace, requireAuthorization, requireNickname, Metaflies.download);

app.listen(conf.port || 9393);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

function isURL(s){
  var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
};

function requireWorkspace(req, res, next) {
	workspacer.getWorkspace({name: req.param('workspace_id')}, function(err, data) {
		if (err) {
			console.log(err);
			res.redirect('/');
		} else {
			req.workspace = workspacer.workspaces[req.param('workspace_id')];
			next();
		}
	});
}

function requireAuthorization(req, res, next) {
	var currentUser = req.session.currentUser;
	console.log(currentUser);
	var workspace = req.workspace;
	if (!workspace.isPrivate()) {
		currentUser = currentUser || {};
		req.session.currentUser = currentUser;
		next();
	} else if (currentUser && currentUser.workspace == req.param('workspace_id')) {
		next();
	} else {
		res.redirect('/' + req.param('workspace_id') + '/join');
	}
}

function requireNickname(req, res, next) {
	var currentUser = req.session.currentUser;
	var workspace = req.workspace;
	if (currentUser.nickname) {
		next()
	} else {
		res.redirect('/' + req.param('workspace_id') + '/join');
	}
}
