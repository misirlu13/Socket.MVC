Socket.MVC
==========

Socket.MVC extends the usability of Socket.io in an MVC environment.  The current version of Socket.MVC has only been tested in an application using Express.  Future releases will be tested using the different frameworks that Socket.io supports.  Socket.MVC does not care which version of Socket.io you use, the only thing it wants to do is give you the freedom to emit from any file in your application at any time.

## Install

First you will need a version of Socket.io.  The fastest way to accomplish this is using NPM.

    npm install socket.io

Next use NPM to install Socket.MVC

	npm install socket.mvc

## How to use

app.js
```js
var express = require('express');
var routes = require('./routes');
var app = module.exports = express.createServer('127.0.0.1');
var io = require('socket.io');
var socketMVC = require('socket.mvc');

socketMVC.init(io, app, './routes/socket.js');
```

routes/socket.js
```js
module.exports = function (socket) {
	//You can declare all of your socket listeners in this file, but it's not required

	socket.on('login', function() {
		console.log('logged in')
	});
};
```

controllers/index.js
```js
var socketMVC = require('socket.mvc');

/*Login logic*/
socketMVC.emit('logged in');
```

### How to get the most out of Socket.MVC

In the example above you see 3 arguments being passed into the init function.  The first is Socket.io, the second your express app, and the third is a path to the file holding all of your socket listeners.  You do not have to place all of your socket listeners in a separate JS file, but it will make your life easier.  The best feature of Socket.MVC is that you can simply require the module, and then just send an emit, or a broadcast or any other information through the websocket inside any function in any file of the application.

## API

### Init

Init takes up to 4 different arguments.

`socketMVC.init('socket.io', 'app', 'path', 'config')`
  - `Socket.io` This is simply a `var` that is equal to `require('socket.io')`
  - `App` This is your Express application once the server is created
  - `Path` This is a path to your socket listener file
  - `Config` This is an obj that you can pass to configure your socket.io module

The `Config` object is structured as the following:
```js
{
	configure: {
		production: {
			set: [{key: 'value'}],
			enable: [{key: 'value'}]
		},
		development: {
			set: [{key: 'value'}],
			enable: [{key: 'value'}]
		}
	},
	set: [{key: 'value'}],
	enable: [{key: 'value'}]
}
```
Each `set` and `enable` property can accept a single object, or an array of object.  The key will be the option and the value will be the value of the option.  Please refer to your version of Socket.io for the proper configuration options.

### On
The on event registers a listener for Socket.io, but it is preferred that you use this method inside a socket listener file.  If you choose to use the API it will still work, but what takes place is that Socket.MVC will store your `on` events in a queue, and when a client connects to Socket.io the listeners will then be registered asynchronously.

### Socket.io API's
Since Socket.MVC is just a wrapping mechanism for Socket.io, all of the same API's can be used using the Socket.MVC module.  Please see a list of all of the API's available by visiting the Socket.io Github page, or http://socket.io (depending on your version)
