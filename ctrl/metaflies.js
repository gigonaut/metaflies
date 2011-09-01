var knox = require('knox'),
	fs = require('fs'),
	_ = require('underscore'),
	http = require('http'),
	url = require('url'),
	util = require('util'),
 	mime = require('mime');

var s3 = knox.createClient({
	key: 'AKIAIHC3WEMCVJRS6LFQ', 
	secret: '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',
	bucket: 'metaflies'
});

var Metaflies = {};

Metaflies.upload = function(req, res, next) {
	console.log('uploading');
	console.log(req.form);
	// connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  req.form.complete(function(err, fields, files){
		file = files.upload;
		
		file_name = _.last(file.path.split('/'));
		workspace_name = req.workspace.name;
		
		full_path = [workspace_name, file_name].join('/');
		file_type = mime.lookup(file.path);
		
		//the following works for uploading a file to s3 but we are disabling that for the time being.
		fs.readFile(file.path, function(err, buf) {
					
					var s3req = s3.put(full_path, {
					      'Content-Length': buf.length
					    , 'Content-Type': file_type
					  });
					
					  s3req.on('response', function(s3res){
					    if (200 == s3res.statusCode) {
								var recordData = {
									name: file.name, 
									s3url: s3req.url, 
									metafliesPath: full_path,
									mimeType: mime.lookup(full_path),
									creator_id: req.session.currentUser.nickname,
									s3path: full_path,
									filename: file_name
								}
								req.upload = recordData;
								console.log(recordData.mimeType);
								next();
					    }
					  });
					  s3req.end(buf);
				});
  });

  // We can add listeners for several form
  // events such as "progress"
  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });
}

Metaflies.download = function(req, res) {
	var workspace = req.workspace;
	var filename = '' + req.param('upload') + '.' + req.param('ext');
	
	var post = _.detect(workspace.posts, function(post) {
		return post.uploadName == filename;
	});
	var upload = post.upload;
	file_type = mime.lookup(upload.s3path);
	res.writeHead(200, {
		'Content-Type': file_type
	});
	var s3req = s3.getFile(upload.s3path, function(err, s3res) {
	  util.pump(s3res, res);
	});
}

module.exports = Metaflies;

