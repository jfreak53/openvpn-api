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
				// console.log(logContent.length);

				for(j = 0; j <= logContent.length-1; j++) {
					if(logContent[j] == 'ROUTING TABLE') {
						var i = j+2;
						var end = '';
						ips = [];
						while(logContent[i] != 'GLOBAL STATS') {
							// console.log(logContent[i]);

							var newCon = logContent[i].split(',');
							// console.log(newCon);
							ips.push([newCon[0], newCon[1]]);

							// console.log(ips);

							i++;
						} //End While
					} //End GLOBAL STATS If
				} //End For Loop

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