var workspacer = new require('../lib/workspacer')();
var metaIo = new require('./metaio')(app, Workspacer);

var PubCtrl = {};

PubCtrl.workspaces = {};

PubCtrl.index = function(req, res) {
	var w = new Workspace({name: Workspace.getRandomId()});
	res.render('public/index', {
   	workspace: w
  });
}

PubCtrl.createWorkspace = function(req, res) {
	var self = this;
	var workspaceData = req.body.workspace;
	console.log(workspaceData);
	//check to see if the workspace exists
	var workspaceId = req.param('space_id');
	var workspace = null;
	if (workspaces[workspaceId]) {
		res.send(409);
	} else {
		workspace = new Workspace(workspaceData);
		workspaces[workspaceId] = workspace;
		console.log(workspace);
		res.send(202);
	}
}


PubCtrl.getWorkspace = function(req, res) {
	var workspace_id = req.param('space_id');
	var workspace = workspaces[workspace_id];
	if (workspace) {
		var bookmarklet = ['http:/', req.headers.host, req.param('space_id'), 'bookmark'].join('/');
		console.log(bookmarklet);
		res.render('spaces/index', {title: req.param('space_id'), bookmarklet: bookmarklet, workspace: workspace});
	} else {
		res.redirect('/');
	}
}

PubCtrl.postBookmark = function(req, res) {
	var location = req.param('location');
	var locationName = req.param('name');
	var info = {location: location, name: locationName}
	var workspace = '/' + req.param('space_id')
	io.sockets.in(workspace).emit('receive bookmark', info)
	res.redirect(req.param('location'));
}

module.exports = PubCtrl;