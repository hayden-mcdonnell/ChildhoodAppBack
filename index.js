var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');

var app = express();

var nodemailer = require('nodemailer');


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

app.post('/api/addNote', function(req, res){
    Milestone.addNote(req.body);
});

app.post('/api/editNote', function(req, res){
    Milestone.editNote(req.body);
});

app.post('/api/viewNote', function(req, res){
    Milestone.viewNote(req.body, function(error, note){
        var payload = {
            note: note
        }
        res.send(payload);
    })
});

app.post('/api/add', function(req, res){
       Milestone.postMilestones(req.body);
       
       var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'childhoodappreadysetgo@gmail.com',
          pass: 'davidMon1'
        }
      });

      var mailOptions = {
        from: 'childhoodappreadysetgo@gmail.com',
        to: 'childhoodapptestemail@gmail.com',
        subject: 'Milestone achieved!!!',
        text: req.body.email + ' has achieved ' + req.body.milestoneName
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
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

 app.post('/api/changeTime', function(req, res){
    Milestone.changeTime(req.body);
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
    });
 });

 app.post('/api/getMilestonePics', function(req, res){
    var fpath = "./MilestonePics/" + req.body.User;
    var final = [];

    

    if (fs.existsSync(fpath))
    {
       fs.readdir(fpath, function(err, filenames) {
           for (var i = 0; i < filenames.length; i++){
               if (filenames[i] === '.DS_Store'){
                 filenames.splice(i, 1)
               }
           }
            filenames.forEach(function(folder) {
                app.use(express.static(fpath + '/' + folder));
                fs.readdir(fpath + "/" + folder, function(err, files) {
                    for (var i = 0; i < files.length; i++){
                        if (files[i] === '.DS_Store'){
                            files.splice(i, 1)
                        }
                    }
                    var temp = {folder, files};
                    //console.log(temp);
                    final.push(temp);
                });
            });
        });
        setTimeout(function(){
            res.send(final);
        }, 50);
      }
      
    else{
        console.log("no");
    }
 })

app.listen(3000);
console.log('Running on port 3000....');