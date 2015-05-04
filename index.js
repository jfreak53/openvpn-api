var restify = require('restify'),
	fs = require('fs'),
	config = require('./config'),
	fileName = config.fileName,
	logContent,
	ips = [];

var server = restify.createServer({
	name: 'openvpn-api',
	version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/getOnline/:user/:pwd', function ( req, res, next ) {
	if(req.params.user != config.userName) {
		res.send('Username is incorrect');
		return next();
	}

	if(req.params.pwd != config.pwd) {
		res.send('Password is incorrect');
		return next();
	}

	fs.exists(fileName, function( exists ) {
  		if (exists) {
  			fs.readFile(fileName, 'utf8', function ( err,data ) {
				if (err) {
					return console.log(err);
				}

				// console.log(data);
				logContent = data.split("\n");
				// console.log(logContent);
				// console.log(logContent[2]);

				if(logContent[2] == 'ROUTING TABLE') {
					var i = 4;
					var end = '';
					ips = [];
					while(end != 'GLOBAL STATS') {
						// console.log(logContent[i]);

						if(logContent[i] != 'GLOBAL STATS') {
							var newCon = logContent[i].split(',');
							// console.log(newCon);
							ips.push([newCon[0], newCon[1]]);
						} else end = logContent[i];

						// console.log(ips);

						i++;
					} //End While
				} //End GLOBAL STATS If

				res.send(ips);
				return next();
			}); //End ReadFile

  		} else {
  			res.send('Status Log file Not found.');
			return next();
  		} //End Exists If
  	}); //End Exist Function

  	// res.send(ips);
	// return next();
});

server.listen(8080, function () {
	console.log('%s listening at %s', server.name, server.url);
});