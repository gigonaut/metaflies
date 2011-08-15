
/**
 * Module dependencies.
 */

var express = require('express');
var nowjs = require('now');
var app = module.exports = express.createServer();
var everyone = nowjs.initialize(app);
var Pub = require('./ctrl/public');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
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



app.get('/spaces/:space_id', function(req, res) {
	res.render('spaces/index', {title: req.param('space_id')})
});

everyone.now.sendBroadcast = function(workspace, message){
	console.log(workspace)
  // everyone.now.filterBroadcast(message, this.now.roomId);
  this.now.receiveBroadcast(message);
}

everyone.now.filterBroadcast = function(message, targetRoomId){
  if(targetRoomId == this.now.roomId){
    this.now.receiveBroadcast(message);
  }
}

// everyone.now.distributeMessage = function(message) {
// 	everyone.now.receiveMessage(message);
// }

app.listen(9393);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// javascript:location.href='http://localhost:9393/workspaces/sweehat/bookmarks/build?location='+encodeURIComponent(location.href)+';name='+encodeURIComponent(document.title)