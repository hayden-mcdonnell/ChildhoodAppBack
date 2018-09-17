var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');

var app = express();




app.use(bodyParser.urlencoded({
    extended: false
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
    
    var form = new formidable.IncomingForm();
    var user;
    form.parse(req, (err, fields, files) => {})

    process.chdir('./ProfilePics');

    form.on('field', function (name, file){
        if (!fs.existsSync(file)){
            fs.mkdirSync(file);
        }
        user = file;
    });

    form.on('fileBegin', function (name, file){
        file.path = './' + user + '/profilePic.JPG';
    });

    form.on('end', function() {
        
        process.chdir('../');
        console.log(process.cwd());
    });
 });

 app.post('/api/getProfilePic', function(req, res){
    
    var path = "./ProfilePics/" + req.body.User + "/profilePic.JPG";
    if (fs.existsSync(path))
    {
        res.sendFile(path, {"root": __dirname});
    }
    else{
        res.sendFile("./noPic.JPG", {"root": __dirname})
    }
 })

 app.post('/api/milestonePic', function(req, res){
    var form = new formidable.IncomingForm();
    var user = '.';
    form.parse(req, (err, fields, files) => {})
    
    process.chdir('./MilestonePics');

    form.on('field', function (name, file){
        if (!fs.existsSync(file)){
            fs.mkdirSync(file);
        }
        user += '/' + file;
        process.chdir('./' + file);
    });

    form.on('fileBegin', function (name, file){
        file.path = './' + file.name;
    });

    form.on('end', function() {
        process.chdir('../../../');
        console.log(process.cwd());
    });
 });

 app.post('/api/getMilestonePics', function(req, res){
    var fpath = "./MilestonePics/" + req.body.User;
    var final = [];

    

    if (fs.existsSync(fpath))
    {
      var milestoneFolders = fs.readdirSync(fpath); //List of milestone folders
      if(milestoneFolders[0] == '.DS_Store')   //Removes .DS_Store file
      {
        milestoneFolders.splice(0,1);  
      }
      for (var i = 0; i < milestoneFolders.length; i++)
      {
          
        app.use('/' + milestoneFolders[i], express.static(fpath + '/' + milestoneFolders[i]));

        console.log(milestoneFolders[i]);
        var myFolder = {
            folder: milestoneFolders[i],
            files: []
        }
       
        fs.readdir(fpath + '/' + milestoneFolders[i], (err, files) => {         
            files.forEach(file => {
                
                myFolder.files.push(file);
                
            });
            
            console.log(myFolder);
          }) 
      }
      //res.send(milestoneFolders);
    }
    else{
        console.log("no");
    }
 })

app.listen(3000);
console.log('Running on port 3000....');