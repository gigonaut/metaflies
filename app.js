
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var Workspace = require('./lib/workspace');
var Workspacer = require('./lib/workspacer');
var workspacer = new Workspacer();
var metaIo = new require('./ctrl/metaio')({app: app, workspacer: workspacer});
var _ = require('underscore');

// var Pub = require('./ctrl/public');


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
	app.set('view options', {title: 'Metaflies', routejs: null, _: _})
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
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

app.get('/:workspace_id', function(req, res) {
	workspacer.getWorkspace({name: req.param('workspace_id')}, function(err, data) {
		if (err) {
			var workspace = new Workspace({name: Workspace.getRandomId()});
			console.log(err);
			res.render('workspaces/new', {workspace: workspace});
		} else {
			var workspace = data;
			var bookmarklet = ['http:/', req.headers.host, req.param('space_id'), 'bookmark'].join('/');
			res.render('workspaces/index', {workspace: workspace, bookmarklet: bookmarklet});
		}
	});
	res.render
});

app.post('/workspaces', function(req, res) {
	var workspace = new Workspace(req.body.workspace);
	workspacer.addWorkspace(workspace, function(err, data) {
		if (err) {
			console.log(err);
			res.redirect('/');
		} else {
			res.redirect('/' + workspace.name);
		}
	});
});

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