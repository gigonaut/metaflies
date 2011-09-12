var Workspace = require('./workspace');

function Workspacer() {
	this.workspaces = {};
}
//all callbacks are standard (err, data)
Workspacer.prototype.addWorkspace = function(workspace, callback) {
	var self = this;
	if (self.workspaces[workspace.name]) {
		callback("exists", null);
	} else {
		self.workspaces[workspace.name.toString()] = new Workspace(workspace);
		// console.log(self.workspaces);
		callback(null, workspace);
	}
}

Workspacer.prototype.getWorkspace = function(workspace, callback) {
	var self = this;
	console.log(workspace.name);
	var workspace = self.workspaces[workspace.name];
	if (workspace) {
		callback(null, workspace);
	} else {
		callback('not found', null);
	}
}

Workspacer.prototype.wsCount = function() {
	var self = this;
	return _.size(self.workspaces);
}

Workspacer.prototype.removeWorkspace = function(workspace, callback) {
	var self = this;
	if (self.workspaces[workspace.name]) {
		delete self.workspaces[workspaces.name];
		callback(null, true);
	} else {
		callback('not found', null);
	}
}

Workspacer.prototype.buildWorkspace = function(wdata) {
	return new Workspacer(wdata);
}

Workspacer.prototype.Workspace = Workspace;

module.exports = Workspacer;