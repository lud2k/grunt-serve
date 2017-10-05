var request = require('request'),
server = require('../tasks/serve.js'),
base_url = "http://localhost:9000/";

describe('Server', function(){
    var options= {
        url : base_url,
        headers : {
            'webtoken' : 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1MDcyMDQxMjgsImV4cCI6MTUwNzI0MDEyOH0.PmDDa_8ECR0oadbKCOYRDZDoD6U4UQmqrbOTiWZ-nr5WUhfSw-2w1_ZlyAHXynTkQtx8SjXwJc0CPEw1smXF5JzXEOzm0qLoXqLBip4ECRGKZeYRdgtSNZVh2EAlk4BlhIDTv9Qa1Zsom457C3njX7huS646Z6MmzASysfG3HNZwGqO_pkzAHuNLqpsiz8DvboZEUh1KuTTw1KR8ghAQXXTtO-aLjKA_s498yFky6KpQAZ1Gr9k69OgabELR9GAVaWCNvdJqzH6hoEVs_99PHGIsLll08t_G1TjvmyQeS9wWaYT6NaMjkwFbuiKcJpTk9916Uh5RfkLl4Xy14VoOqA'            
        }
    }    
    describe('GET /', function(){

        it("returns status code 401", function(done){
            request.get(base_url).on('response', function(response){
                expect(response.statusCode).toBe(401);                
                done();
            }).on('error', function(err){
                console.error(err);
            });
        });
        it("returns status code 200", function(done){
            request.get(options).on('response', function(response){
                expect(response.statusCode).toBe(200);                
                done();
            }).on('error', function(err){
                console.error(err);
            });
        });
    });
    describe('GET /task/*', function(){
        it("returns status code 401", function(done){
            request.get(base_url).on('response', function(response){
                expect(response.statusCode).toBe(401);              
                done();
            }).on('error', function(err){
                console.error(err);
            });
        });
        it("returns status code 200", function(done){
            request.get(options).on('response', function(response){
                expect(response.statusCode).toBe(200);                
                done();
            }).on('error', function(err){
                console.error(err);
            });
        });
    });
});