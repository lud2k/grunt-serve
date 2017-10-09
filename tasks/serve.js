/*
 * grunt-serve
 * https://github.com/lud2k/grunt-serve
 *
 * Copyright (c) 2014 Ludovic Cabre
 * Licensed under the MIT license.
 */

'use strict';

var	childProcess = require("child_process"),
	fs = require('fs'),
	dot = require('dot'),
	paths = require('path'),
	contentTypes = require('../data/content_types.js'),
	jwt = require('jsonwebtoken'),
	express = require('express'),
	app = express(),
	server;
// requires

// load all template files
var loadTemplate = function(name) {
		return dot.template(fs.readFileSync(paths.join(__dirname, '..', 'pages', name)))
	},
	indexTmpl = loadTemplate('index.html'),
	notFoundTmpl = loadTemplate('not_found.html'),
	directoryTmpl = loadTemplate('directory.html'),
	errorTmpl = loadTemplate('error.html'),
	successTmpl = loadTemplate('success.html'),
	gruntErrorTmpl = loadTemplate('grunt_error.html'),
	missingTmpl = loadTemplate('missing.html'),
	unauthTmpl = loadTemplate('unauthorized.html');
	
/**
 * Definition of the exported method that will be called by Grunt on initialization.
 */
module.exports = function(grunt) {
	grunt.registerTask('_serve_selftest', 'Test grunt serve', function(){ 
		grunt.log.write('task testing successful'); 
	}); 
	// register serve task
	grunt.registerTask('serve', 'Starts a http server that can be called to run tasks.', function() {
		// control when the task should end
	    var done = this.async();
	    
		// get options
		var options = this.options({
			port: 9000,
			silently: false,
			serve: {
				path: process.cwd()
			}
		});
		
		app.get ('/', function(req, res) {
			try{
				var cert = fs.readFileSync('public.pem');
				var token = req.headers.webtoken;
				jwt.verify(token,cert,{algorithms: ['RS256']}, function(err, payload){
					if(err){
						err = {
							name: 'JsonWebTokenError',
							message: 'invalid signature'
						}
						render(res, 401, unauthTmpl, null, {info: 'unauthorized'});
					} else{
						// forward request
						render(res, 200, indexTmpl, {
							host: req.headers.host,
							aliases: mapToArray(options.aliases, 'name'),
							files: filesInDirectory(grunt, options, '.'),
						}, {info: 'OK'});
					}
				});
			} catch (e) {
				render(res, 500, errorTmpl, {
					error: 'Unexpected JavaScript exception "'+e+'"<br />'+(e && e.stack ? e.stack.replace(/\n+/g, '<br />') : '')
				}, {info: 'Error'});
			}
		});

		app.get ('/task/:taskname', function(req, res) {
			try {
				var cert = fs.readFileSync('public.pem');
				var token = req.headers.webtoken;
				jwt.verify(token,cert,{algorithms: ['RS256']}, function(err, payload){
					if(err){
						err = {
							name: 'JsonWebTokenError',
							message: 'invalid signature'
						}
						render(res, 401, unauthTmpl, null, {info: 'unauthorized'} );
					} else{
						var tasks = req.params.taskname.split(','),
						output = null;
					
						// run tasks
						executeTasks(req, res, grunt, options, tasks, output, null);
						return;
					}
				});
			} catch(e) {
				// show error
				render(res, 500, errorTmpl, {
					error: 'Unexpected JavaScript exception "'+e+'"<br />'+(e && e.stack ? e.stack.replace(/\n+/g, '<br />') : '')
				}, {info: 'Error'});
			}
		});

		server = app.listen(options.port);

		// handle SIGINT signal properly
		process.on('SIGINT', function() {
			// terminate task
		    done();
		});
		
    	// a few messages
        grunt.log.write('Server is running on port '+options.port+'...\n');
        grunt.log.write('Press CTRL+C at any time to terminate it.\n');
	});
}

/**
 * Handles all requests to the server.
 * Each call with trigger a call to the following function.
 */

/* 
function handleRequest(request, response, grunt, options) {
	
	// is this url contains virtual root? If so, remove it
	if (options.virtualRoot) {
		if (path.indexOf(options.virtualRoot) === 0) {
			path = path.substr(options.virtualRoot.length);
		}
	}

	// does this path match an alias?
	var aliasName = path.substr(1);
	var aliases = options.aliases;
	if (aliases && aliases[aliasName]) {
		// get alias configuration
		var tasks = aliases[aliasName].tasks,
			output = aliases[aliasName].output,
			contentType = aliases[aliasName].contentType;
		
		if (!tasks) throw "No tasks were defined for alias: "+aliasName;
		
		// run tasks
		executeTasks(request, response, grunt, options, tasks, output, contentType);
		return;
	}
}
*/

/**
 * Runs Grunt to execute the given tasks.
 */
function executeTasks(request, response, grunt, options, tasks, output, contentType) {
	// execute tasks
	childProcess.exec('grunt '+tasks.join(' '), function(error, stdout, stderr) {
		try {
			// should we print the stdout?
			if (!options.silently) {
				// print stdout
				console.log(stdout);
				
				// print stderr (if any)
				if (stderr) {
					console.log(stderr);
				}
			}
			
			// any error? write logs and return
			if (stderr || error) {
			    render(response, 500, gruntErrorTmpl, {
			    	tasks: tasks,
			    	stdout: formatStdout(stdout),
			    	stderr: formatStdout(stderr)
			    }, {info: 'Error'});
				return;
			}
			
		    // the the output stdout?
		    if (output == 'stdout' || !output) {
			    // write stdout
		    	render(response, 200, successTmpl, {
		    		output: formatStdout(stdout)
		    	}, {info: 'OK'});
			    
		    } else {
		    	// requested output file exists?
				if (grunt.file.exists(output)) {
					// write file
		    		write(response, 200, grunt, output, contentType);
				} else {
					// show file not found
				    render(response, 500, missingTmpl, {
				    	output: output
				    } , {info: 'Error'});
				}
		    }
		} catch(e) {
			// show error
		    render(response, 500, errorTmpl, {
		    	error: 'Unexpected JavaScript exception "'+e+'"<br />'+(e && e.stack ? e.stack.replace(/\n+/g, '<br />') : '')
		    }, {info: 'Error'});
		}
	});
}

/**
 * Renders a json response.
 */
function render(response, code, template, data, info) {
	var json = JSON.stringify({
		statusCode : code,
		text: info
	})
	if (!response.headersSent) {
		response.writeHead(code, {"Content-Type": "application/json"});
	}
    response.end(json);
}

/**
 * Renders a html page and ends the request.
 */


/*
function render(response, code, template, data) {
	var json = JSON.stringify({
		statusCode : code,
		templ : template,
		text: "test123"
	})
	if (!response.headersSent) {
		response.writeHead(code, {"Content-Type": "application/json"});
	}
    response.end(json);
}

/**
 * Renders a html page and ends the request.
 */


/*
function render(response, code, template, data) {
	var html = template(data);
	if (!response.headersSent) {
	    response.writeHead(code, {"Content-Type": "text/html"});
	}
    response.end(html);
} 
*/


/**
 * Writes a file's content to the output and ends the request.
 */
function write(response, code, grunt, file, contentType) {
	var data = fs.readFileSync(file);
	if (!response.headersSent) {
	    response.writeHead(200, headersForOutput(file, contentType));
	}
	response.end(data);
}

/**
 * Converts a map to an array adding the key to the value.
 */
function mapToArray(map, name) {
	var ret = [];
	for (var key in map) {
		map[key][name] = key;
		ret.push(map[key]);
	}
	return ret;
}

/**
 * Returns the list of files in the given directory.
 */
function filesInDirectory(grunt, options, path) {
	var ret = [],
		fullPath = paths.join(options.serve.path, path),
		files = fs.readdirSync(fullPath);
	
	// for each file
	for (var i=0; i<files.length; i++) {
		var file = files[i],
			stats = fs.statSync(paths.join(fullPath, file)),
			isDir = stats.isDirectory();
		
		// skip ., .. and hidden files
		if (file.charAt(0) == '.') continue;
		
		ret.push({
			path: path ? path + '/' + file : file,
			name: file,
			isDir: isDir
		});
	}
	
	return ret;
}

/**
 * Returns the headers that fits the best the output.
 * Will also add headers to prevent caching.
 */
function headersForOutput(path, contentType) {
	// disable caching
	var ret = {
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		'Pragma': 'no-cache',
		'Expires': '0'
	}
	
	// try to auto detect the content type
	if (!contentType) {
		contentType = contentTypes(path);
		if (contentType) {
			ret['Content-Type'] = contentType;
		}
	}
	
	return ret;
}

/**
 * Converts Grunt's stdout into html.
 * (keeping the colors the same)
 */
function formatStdout(stdout) {
	var regex = /\x1B\[(\d+)m/g,
		opened = false,
		colors = {
			'0': '#000000',
			'30': '#000000',
			'31': '#CC0000',
			'32': '#00CC00',
			'33': '#CCCC00',
			'34': '#00CC00',
			'35': '#CC00CC',
			'36': '#00CCCC',
			'37': '#999999'
		},
		match;
	
	// replace all colors markers by html
	while ((match = regex.exec(stdout))) {
		var code = match[1]+'',
			start = stdout.substr(0, match.index),
			end = stdout.substr(match.index+3+code.length);
		
		if (code) {
			var colorEnd = opened ? '</span>' : '',
				colorStart = '<span style="color: '+colors[code]+'">';
			stdout = start + colorEnd + colorStart + end;
			
		} else {
			stdout = start + end;
		}
		
		opened = true;
	}
	
	// replace all line return by the html equivalent
	return stdout.replace(/\n+/g, '<br />');
}
