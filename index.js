var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var User = require('./Models/users');
var Milestone = require('./Models/milestones');

//Mongoose Connect

mongoose.connect('mongodb://localhost:27017/ChildhoodAppDB', { useNewUrlParser: true });
var db = mongoose.connection;

app.get('/', function(req, res){
    res.send('Yes');
});

app.get('/api/users', function(req, res){
    res.send('usersApi');
});

app.get('/api/milestones', function(req, res){
    res.send('milestonesApi');
});

app.get('/api/add', function(req, res){
    res.send('addApi');
});

app.get('/api/complete', function(req, res){
    res.send('completeApi');
});

app.post('/api/users', function(req, res){
    if (req.body.userName && req.body.passWord) {
        User.authenticate(req.body.userName, req.body.passWord, function (error, user) {
            var confirmation;
            if (user)
            {
                confirmation= {Confirmation : "Success", Data: user};
            }
            else{
                confirmation = {Confirmation : "Failed", Data: error};
            }
            res.send(confirmation);
       } 
    )}
});

app.post('/api/milestones', function(req, res){
    Milestone.getMilestones(req.body.email, function(error, milestone) {
        res.send(milestone);
    })
});

app.post('/api/add', function(req, res){
       Milestone.postMilestones(req.body);
});

app.post('/api/complete', function(req, res){
   
   Milestone.completeMilestones(req.body, req.body[5]);
});

app.post('/api/changepw', function(req, res){
   User.changePw(req.body, function (error){
       if(error)
       {
        res.send(error);
       }
   });
 });

 app.post('/api/profilePic', function(req, res){
    User.uploadUserImage(req.body.uri);
 });

app.listen(3000);
console.log('Running on port 3000....');