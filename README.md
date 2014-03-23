# grunt-serve

> Starts a http server that can be called to run tasks

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-serve --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-serve');
```

## The "serve" task

### Overview

This task allows creates a http request that can be called to run tasks.

One possible usage would be "on the fly" generation of the code when you refresh a webpage page.
While developing a website that contains a JavaScript generate with grunt, this allows you to avoid recompiling with grunt every time you
make a change to a source file. Instead of including the real JavaScript file, you can just include a script tag pointing to this
local server <script src="http://localhost:9000/client.js"></script>. Once "http://localhost:9000/client.js" is called by your browser,
if will execute the tasks that you have configured and return you the content of "client.js.

### Options

#### options.port
Type: `Integer`
Default value: `'9000'`

The port that the server should be running on.

#### options.aliases
Type: `Object`
Default value: `'null'`

Aliases you want to configure. Check the examples below!

### Usage Examples

#### Basic Use

In this example, `grunt serve` will start a web server at `http://localhost:9001/`.
If you go to http://localhost:9001/html2js,concat/client.js it will execute the tasks 'html2js' and 'concat' and return the content of the file 'client.js'.
If you go to http://localhost:9001/cssmin/client.css it will execute the task 'cssmin' and return the content of the file 'client.css'.

```javascript
// Project configuration.
grunt.initConfig({
	serve: {
		options: {
			port: 9001
		}
	}
});
```

#### Alias Use

In this example, `grunt serve` will start a web server at `http://localhost:9001/`.
If you go to http://localhost:9001/client.js it will execute the tasks 'html2js' and 'concat' and return the content of the file 'client.js'.

```javascript
// Project configuration.
grunt.initConfig({
	serve: {
		options: {
			port: 9001,
			'client.js': {
				tasks: ['html2js', 'concat'],
				output: 'client.js'
			}
		}
	}
});
```

## Release History

 * 2014-03-23   0.1.0    First Release
