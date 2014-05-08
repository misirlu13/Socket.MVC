var _ = require('underscore'),
	async = require('async'),
	path = require('path');

(function(SocketMVC) {

	var _setSocket = function(socket) {
		SocketMVC.socket = socket;
		SocketMVC.hasInit = true;
		_setMVCMethods();
	};

	var _setMVCMethods = function() {
		for (var name in SocketMVC.socket) {
			SocketMVC[name] = SocketMVC.socket[name];
		}
	}

	var _addToQueue = function(event, cb) {
		SocketMVC.eventQueue.push( 
			function(callback) {
				SocketMVC.socket.on(event, cb);
				callback();
			}
		);
	}

	SocketMVC.socket = null;

	SocketMVC.hasInit = false;

	SocketMVC.eventQueue = [];

	SocketMVC.on = function(event, cb) {
		if (!SocketMVC.hasInit) {
			_addToQueue(event, cb);
			return;
		}

		SocketMVC.socket.on(event, cb);
	}

	SocketMVC.init = function(io, server, socketLibPath, options) {
		var ioM = io.listen(server);

		var configureInit = function(data) {
			var temp, temp2;

			if (_.isObject(data)) {
				for (temp in data) {
					if (temp == 'production') {
						ioM.configure('production', function() {
							for (temp2 in data[temp]) {
								if (temp2 == 'set') {
									setInit(data[temp][temp2]);
								} else if (temp2 == 'enable') {
									enableInit(data[temp][temp2]);
								}
							}
						});
					} else if (temp == 'development') {
						ioM.configure('development', function() {
							for (temp2 in data[temp]) {
								if (temp2 == 'set') {
									setInit(data[temp][temp2]);
								} else if (temp2 == 'enable') {
									enableInit(data[temp][temp2]);
								}
							}
						});
					}
				}
			}
		};

		var setInit = function(data) {
			var temp, i;
			if (_.isArray(data)) {				
				for (i = 0; i < data.length; i++) {
					for (temp in data[i]) {
						ioM.set(temp, data[i][temp]);
					}
				}
			} else if (_.isObject(data)) {
				for (temp in data) {
					ioM.set(temp, data[temp]);
				}
			}
		}

		var enableInit = function(data) {
			var temp, i;
			if (_.isArray(data)) {				
				for (i = 0; i < data.length; i++) {
					for (temp in data[i]) {
						ioM.enable(temp, data[i][temp]);
					}
				}
			} else if (_.isObject(data)) {
				for (temp in data) {
					ioM.enable(temp, data[temp]);
				}
			}
		}

		if (!_.isEmpty(options)) {
			var name;
			for (name in options) {
				if (name == 'configure') {
					configureInit(options[name]);
				} else if (name == 'set') {
					setInit(options[name]);
				} else if (name == 'enable') {
					enableInit(options[name]);
				}
			}
		}

		ioM.sockets.on('connection', function (socket) {
			require(path.resolve(__dirname, '../', '../', '../', socketLibPath))(socket);
			_setSocket(socket);
			async.parallel(SocketMVC.eventQueue, function(err, data) {
				console.log('Finished registering queued events');
			});
			SocketMVC.everyone = function(event, data) {
				ioM.sockets.emit(event, data);
			};
		});
	};

}(exports));

