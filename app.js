
/**
 * Module dependencies.
 */

var express = require('express'), 
		MemoryStore = express.session.MemoryStore, 
		app = module.exports = express.createServer(), 
		sessionStore = new MemoryStore(),
		Workspace = require('./lib/workspace'),
		Workspacer = require('./lib/workspacer'), 
		workspacer = new Workspacer(), 
		metaIo = new require('./ctrl/metaio')({app: app, workspacer: workspacer, sessionStore: sessionStore}), 
		_ = require('underscore');


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
	app.set('view options', {title: 'Metaflies', routejs: null, _: _})
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
	res.render('workspaces/new', {workspace: workspace})
});

app.get('/:workspace_id', requireWorkspace, function(req, res) {
	console.log('no_error');
	req.session.currentUser = {username: 'ted'}
	var workspaceId = req.param('workspace_id');
	var workspace = req.workspace;
	var bookmarklet = ['http:/', req.headers.host, req.param('workspace_id'), 'bookmark'].join('/');
	res.render('workspaces/show', {workspace: workspace, bookmarklet: bookmarklet});
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
	
})

app.post('/:workspace_id/posts', requireWorkspace, function(req, res) {
	var message = req.body;
	var workspaceId = req.param('workspace_id');
	console.log(message);
	metaIo.io.sockets.in(workspaceId).emit('post added', message);
	
});

app.get('/:workspace_id/bookmark', function(req, res) {
	var location = req.param('location');
	var locationName = req.param('name');
	var info = {location: location, name: locationName}
	var workspace = req.param('space_id')
	metaIo.io.sockets.in(workspace).emit('bookmark added', info)
	res.redirect(req.param('location'));
});

function requireWorkspace(req, res, next) {
	workspacer.getWorkspace({name: req.param('workspace_id')}, function(err, data) {
		if (err) {
			console.log(err);
			res.redirect('/');
		} else {
			req.workspace = data;
			next();
		}
	});
}

function requireAuthorization(req, res, next) {
	var workspace = req.workspace;
	if (!workspace.isPrivate()) {
		next();
	} else {
		
	}
	
}

// app.get('/:space_id', Pub.getWorkspace);
// 
// app.post('/:space_id', Pub.createWorkspace);
// 
// app.post('/:space_id/upload', function(req, res) {
// 	//we will do something here to process the upload;
// });
// 
// 
// 
// app.get('/:space_id/bookmark', Pub.postBookmark);


app.listen(9393);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// javascript:location.href='http://localhost:9393/workspaces/sweehat/bookmarks/build?location='+encodeURIComponent(location.href)+';name='+encodeURIComponent(document.title)


//express and socket session linking


function isURL(s){
  var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
};