var knox = require('knox'),
	fs = require('fs'),
	formidable = require('formidable'),
	_ = require('underscore'),
	http = require('http'),
	url = require('url'),
	util = require('util'),
	conf = require('../conf/conf'),
 	mime = require('mime');

var s3 = knox.createClient({
	key: 'AKIAIHC3WEMCVJRS6LFQ', 
	secret: '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',
	bucket: 'metaflies'
});

var Metaflies = {};

Metaflies.upload = function(req, res, next) {
	var	workspaceName = req.workspace.name;
	var form = new formidable.IncomingForm();

	form.parse(req);

	form.addListener('file', function(field, file) {
		var key = file.path.split('/').pop();
		var ext = file.name.split('.').pop();
		file.name = Metaflies.s3sanitize(file.name);
		var path = [workspaceName, key, file.name].join('/');
		var type = mime.lookup(file.name);
		var s3req = s3.putFile(file.path, path, {'Content-Type': type}, function(err, res) {
			if (!err) {
				var recordData = {
					key: key,
					name: file.name,
					mimeType: mime.lookup(file.name),
					metafliesPath: path,
					creator: req.session.currentUser.nickname,
					filename: file.name
				}
				req.upload = recordData;
				next();
			} else {
				console.log(err);
			}
		})
	});
	
}

Metaflies.s3sanitize = function(name, ext) {
	var suf = name.split('.').pop();
	var pref = name.split('.')[0]
		.toLowerCase() // change everything to lowercase
		.replace(/^\s+|\s+$/g, "") // trim leading and trailing spaces		
		.replace(/[_|\s]+/g, "-") // change all spaces and underscores to a hyphen
		.replace(/[^a-z0-9-]+/g, "") // remove all non-alphanumeric characters except the hyphen
		.replace(/[-]+/g, "-") // replace multiple instances of the hyphen with a single instance
		.replace(/^-+|-+$/g, "") // trim leading and trailing hyphens				
		;
		
		return [pref, suf].join('.');
}

Metaflies.download = function(req, res) {
	var workspace = req.workspace;
	var filename = '' + req.param('upload') + '.' + req.param('ext');
	var key = req.param('key');
	
	var post = _.detect(workspace.posts, function(post) {
		return post.uploadKey == key;
	});
	
	var upload = post.upload;
	file_type = mime.lookup(upload.filename);
	
	var path = [workspace.name, key, upload.name].join('/');
	
	res.writeHead(200, {
		'Content-Type': file_type
	});
	
	var s3req = s3.getFile(path, function(err, s3res) {
	  util.pump(s3res, res);
	});
}

module.exports = Metaflies;