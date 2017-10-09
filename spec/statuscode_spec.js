var server = require('../tasks/serve.js'),
    base_url = "http://localhost:9000/"
    task_url = "http://localhost:9000/task/_serve_selftest";
    task_url_fail = "http://localhost:9000/task/fail_serve_selftest"

const { createFetch, createStack, enableRecv, header, base, parse } = require('http-client');

describe('Server', function(){
    var options_right= {
        headers : {
            'webtoken' : 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1MDcyODA5OTIsImV4cCI6MTUwNzMxNjk5Mn0.Ogh_OmlziSCYpV16YoNUKhyWDTOfaWZnBfQMahW0pEfrzNrnHybmr0OBHk_YBHdNR0ocOM1bvHD4eH-ClM3JkNpl8bhMaMkmnLtk8Jw9iKX8WH-ecfZ8BQ1OT2ohLYoFHFFnUCfopQEM2v2wEz3iCVGPY4KkQ5lX-wE39D5XEJZyxYlxXM2XLXgEacxtgrbFJeO8ECZ6UcLpjtEr-LGuKVJh5gxdLRKK44fm2sDqtMKR_IMnY6-zBEo5wtr-oJ2JxpzR5UdKR6qZ2xCOaOuvBD36eW-05HK1BWEbEh43WZ7LAGh1MfQU-8clVBEDMvwqr0vgMu1MZ1XnhLoA20bkvA'            
        }
    }   
    var options_wrong= {
        headers : {
            'webtoken' : 'false'            
        }
    }  
    describe('GET / return status code', function(){
        it("401 because it is an unauthorized request without Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(base_url),
                parse('json')
            );
            fetch(base_url).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("401 because it is an unauthorized request with wrong Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(base_url),
                parse('json')
            );
            fetch(base_url, options_wrong).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("200 because it is an authorized request and the url exists", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(base_url),
                parse('json')
            );
            fetch(base_url, options_right).then(function(response){
                expect(response.status).toBe(200);
                done();
            });
        }); 
    });
    describe('GET task/_serve_selftest  return status code', function(){
        it("401 because it is an unauthorized request without Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("401 because it is an unauthorized request with wrong Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url, options_wrong).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("200 because it is an authorized request and the task exists", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url, options_right).then(function(response){
                expect(response.status).toBe(200);
                done();
            });
        });
    });
    describe('GET task/fail_serve_selftest  return status code', function(){
        it("401 because it is an unauthorized request without Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url_fail).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("401 because it is an unauthorized request with wrong Webtoken", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url_fail, options_wrong).then(function(response){
                expect(response.status).toBe(401);
                done();
            });
        });
        it("500 because the task do not exist", function(done){
            const fetch = enableRecv(
                require('node-fetch')
            );
            const stack = createStack(
                base(task_url),
                parse('json')
            );
            fetch(task_url_fail, options_right).then(function(response){
                expect(response.status).toBe(500);
                done();
            });
        });
    });
});