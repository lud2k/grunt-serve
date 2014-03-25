/*
 * grunt-serve
 * https://github.com/lud2k/grunt-serve
 *
 * Copyright (c) 2014 Ludovic Cabre
 * Licensed under the MIT license.
 */

'use strict';

var connect = require('connect'),
	http = require('http'),
	childProcess = require("child_process");

module.exports = function(grunt) {
	// register serve task
	grunt.registerTask('serve', 'Starts a http server that can be called to run tasks.', function() {
		// control when the task should end
	    var done = this.async();
	    
		// get options
		var options = this.options({
			port: 9000,
			silently: false
		});
		
		// start an HTTP server
		http.createServer(function(request, response) {
			// forward request
			handleRequest(request, response, grunt, options);
			
		}).listen(options.port);

		// handle SIGINT signal properly
		process.on('SIGINT', function() {
			// terminate task
		    done();
		});
		
    	// a few messages
        grunt.log.write('Server is running on port '+options.port+'...\n');
        grunt.log.write('Press CTRL+C at any time to terminate it.\n');
	});
};

function handleRequest(request, response, grunt, options) {
	// extract info form url
	var url = request.url,
		match = /\/([^\/?#]+)(\/([^\/?#]+))?/.exec(url);
	
	// is it a favicon request?
	if (url == '/favicon.ico') {
		// just return 404
        response.writeHead(404);
		return;
	}
	
	if (!match) {
		writeError(response, '<b>Invalid request: Missing parameters.</b>\n'+
				'Url should contain the name of one of the aliases or tasks to be ran.\n\n'+
				'<b>Exemples:</b>\n'+
				'- http://'+request.headers.host+'/{{alias}}\n'+
				'- http://'+request.headers.host+'/{{task1}},{{task2}},...\n'+
				'- http://'+request.headers.host+'/{{tasks}}/{{file}}\n\n'+
				'<b>Available Aliases:</b>\n'+
				aliasesToString(options.aliases)
				);
		return;
	}
	
	// get tasks to execute
	var task = match[1],
		output = match[3],
		tasks = task,
		contentType;

	// is this task an alias?
	var aliases = options.aliases;
	if (aliases && aliases[task]) {
		// run the tasks of the alias
		tasks = aliases[task].tasks;
		output = aliases[task].output;
		contentType = aliases[task].contentType;
		
	} else {
		// treat task as a list of tasks comma separated
		tasks = task.split(',')
	}
	
	// execute tasks
	childProcess.exec('grunt '+tasks.join(' '), function(error, stdout, stderr) {
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
			var err = formatStdout(stderr) || '(no error output)\n',
				out = formatStdout(stdout) || '(no standard output)\n';
			writeError(response, '<b>An error happened while running tasks!</b>\n\n'+
					'Standard Ouput:\n'+out+'\n'+
					'Standard Error:\n'+err);
			return;
		}
		
	    // the the output stdout?
	    if (output == 'stdout' || !output) {
		    // write stdout
	        response.writeHead(200, {"Content-Type": "text/html"});
	    	response.end('<html><body><pre>'+formatStdout(stdout)+'</pre></body></html>');
		    
	    } else {
			if (grunt.file.exists(output)) {
			    // write file and headers
			    response.writeHead(200, headersForOutput(output, contentType));
				response.end(grunt.file.read(output));
				
			} else {
				writeError(response, '<b>Could not find output file: '+output+'</b>\n'+
						'The file \''+output+'\' was supposed to be ouputed here but couldn\'t be found.');
			}
	    }
	});
};

function aliasesToString(aliases) {
	var ret = '';
	for (var alias in aliases) {
		if (ret) ret += '\n'; 
		ret += '- '+alias;
	}
	if (!ret) {
		ret = '(no aliases were configured)';
	}
	return ret;
}

function headersForOutput(output, contentType) {
	if (!contentType) {
		// default content type
		contentType = 'text/plain';
		
		// check output extension
		if (output.match(/\.js$/i)) {
			contentType = 'text/javascript';
		} else if (output.match(/\.css$/i)) {
			contentType = 'text/css';
		} else if (output.match(/\.xml$/i)) {
			contentType = 'text/xml';
		} else if (output.match(/\.json$/i)) {
			contentType = 'text/json';
		} else if (output.match(/\.html$/i)) {
			contentType = 'text/html';
		}
	}
	return {'Content-Type': contentType};
}

function writeError(response, error) {
    response.writeHead(200, {"Content-Type": "text/html"});
	response.end('<html><body><pre>'+error+'</pre></body></html>');
}

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
	return stdout.replace(/\n+/, '\n');
}
