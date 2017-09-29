describe('Server', function(){
    var request = require('request'),
        base_url = "http://localhost:9000/",
        server = require('../tasks/serve.js');
    beforeAll(function(){
        var token = "";
    });
    afterAll(function(){
        server.close();
    });
    describe('GET /', function(){
        var data = {};
        beforeAll(function(){
            request.get(base_url, function(error, response, body){
                data.status = response.statusCode;
                data.body = body;
                done();
            });
        });
        it("returns status code 200", function(){
            //expect(true).toBe(true);
            expect(data.status).toBe(200);
        });
    });
    describe('GET /task/*', function(){
        
    });
});