var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');
var mkdirp = require('mkdirp');
var https = require('https');
var http = require('http');

var app = express();
/* --------------------------------------------------- HTTPS STUFF ---------------------------------------------------
var app = express.createServer(credentials);
var privateKey = fs.readFileSync(path_to_key);
var certificate = fs.readFileSync(path_to_certificate');

var credentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);
Also uncomment second Last line
----------------------------------------------------------------------------------------------------------------------*/

var nodemailer = require('nodemailer');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

var User = require('./Models/users');
var Milestone = require('./Models/milestones');

var httpServer = http.createServer(app);



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
    try{
    if (req.body.email && req.body.passWord) {
        User.authenticate(req.body.email, req.body.passWord, function (error, user) {
            var confirmation;
            if (user)
            {
                var data = {
                    _id: user._id,
                    email: user.email
                }
                confirmation= {Confirmation : "Success", Data: data};
            }
            else{
                confirmation = {Confirmation : "Failed", Data: error};
            }
            res.send(confirmation);
       } 
    )}
    }
    catch(err){
        console.log(err);
    }
});

app.post('/api/milestones', function(req, res){
    try{
    Milestone.getMilestones(req.body.email, function(error, milestone) {
        res.send(milestone);
    })       
    }
    catch(err){
        console.log(err);
    }
});

app.post('/api/addNote', function(req, res){
    try{
        Milestone.addNote(req.body);      
    }
    catch(err){
        console.log(err);
    }
});

app.post('/api/editNote', function(req, res){
    try{
    Milestone.editNote(req.body);
    }
    catch (err){
        console.log(err);
    }
});

app.post('/api/viewNote', function(req, res){
    try{

    Milestone.viewNote(req.body, function(error, note){
        var payload = {
            note: note
        }
        res.send(payload);
    })
            
    }
    catch(err){
        console.log(err);
    }
});

app.post('/api/add', function(req, res){
    try{
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
    }
    catch(err){
        console.log(err);
    }
});

app.post('/api/complete', function(req, res){
   try{
    Milestone.completeMilestones(req.body, req.body[5]);
   }
   catch(err){
       console.log(err);
   }
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
     try{
        Milestone.changeTime(req.body);
     }
     catch(err){
         console.log(err)
     }
 });

 app.post('/api/profilePic', function(req, res){
    try{
    var form = new formidable.IncomingForm();
    var user;
    form.parse(req, (err, fields, files) => {})


    form.on('field', function (name, file){
        if (!fs.existsSync('./ProfilePics/' + file)){
            mkdirp('./ProfilePics/' + file);
        }
        user = file;
    });

    form.on('fileBegin', function (name, file){
        file.path = './ProfilePics/' + user + '/profilePic.JPG';
    });
}
catch(err){
    console.log(err);
}
 });

 app.post('/api/getProfilePic', function(req, res){
     try{
    var path = "./ProfilePics/" + req.body.User + "/profilePic.JPG";
    if (fs.existsSync(path))
    {
        res.sendFile(path, {"root": __dirname});
    }
    else{
        
        res.sendFile("./noPic.JPG", {"root": __dirname})
    }}
    catch(err){
        console.log(err);
    }
 })

 app.post('/api/milestonePic', function(req, res){
    try {
    var form = new formidable.IncomingForm();

    var receivedFirst = false;
    var email;
    var milestone;
   
    form.parse(req, (err, fields, files) => {})

    form.on('field', function (name, file){
        if(!receivedFirst){
            if(!fs.existsSync('./MilestonePics/' + file)){
                mkdirp('./MilestonePics/' + file);
            }
            email = file;
        }

       else{
            if(!fs.existsSync('./MilestonePics/' + email + '/' + file)){
                mkdirp('./MilestonePics/' + email + '/' + file);
            }
            milestone = file;
        }
       receivedFirst = true;
    })

    
        form.on('fileBegin', function (name, file){
            file.path = './MilestonePics/' + email + '/' + milestone + '/' + file.name;
        });
    }

    catch(err){
        console.log(err);
    }
 });

 app.post('/api/getMilestonePics', function(req, res){
        var fpath = "./MilestonePics/" + req.body.User;
        var final = [];
        var numOfFiles = 0;

        try{
            if (fs.existsSync(fpath))
            {
            fs.readdir(fpath, function(err, filenames) {
                for (var i = 0; i < filenames.length; i++){
                    if (filenames[i] === '.DS_Store'){
                        filenames.splice(i, 1)
                    }
                }
                    filenames.forEach(function(folder) {
                        //app.use("/" + req.body.User, express.static(fpath + '/' + folder));
                        fs.readdir(fpath + "/" + folder, function(err, files) {
                            
                            for (var i = 0; i < files.length; i++){
                                if (files[i] === '.DS_Store'){
                                    files.splice(i, 1)
                                }
                            }
                            numOfFiles += files.length;
                            
                            var temp = {folder, files};
                            
                            final.push(temp);
                        });
                    });
                    
                });

                setTimeout(function(){
                    var payload = {
                        data: final,
                        length: numOfFiles
                    }
                    res.send(payload);
                }, 50);
            }
            else{
                var payload = {
                    data: 'Empty',
                    length: 0
                }
                res.send(payload);
            }
        }
        catch(err){
            console.log(err);
        }
 })

 app.post('/api/getaMilestonePic', function(req, res){
     try{
     var fpath = "./MilestonePics/" + req.body.User;

     var final = [];

     if (fs.existsSync(fpath)){
        fs.readdir(fpath, function(err, filenames) {
            for (var i = 0; i < filenames.length; i++){
                if (filenames[i] === '.DS_Store'){
                  filenames.splice(i, 1)
                }
            }
             filenames.forEach(function(folder) {
                if (req.body.Milestone === folder){
                    fs.readdir(fpath + "/" + folder, function(err, files){
                        for (var i = 0; i < files.length; i++){
                            if (files[i] === '.DS_Store'){
                                files.splice(i, 1)
                            }
                        }
                        var load = {
                            Milestone: folder,
                            File: files[0]
                        }
                        final.push(load);
                    })
                }
                else{
                    var load = {
                        Milestone: folder,
                        File: "noFile"
                    }
                    final.push(load);
                }
                
                if (req.body.Milestone2 !== null)
                {
                    if (req.body.Milestone2 === folder){
                        fs.readdir(fpath + "/" + folder, function(err, files){
                            for (var i = 0; i < files.length; i++){
                                if (files[i] === '.DS_Store'){
                                    files.splice(i, 1)
                                }
                            }
                            var load = {
                                Milestone: folder,
                                File: files[0]
                            }
                            final.push(load);
                        })
                    }
                    else{
                        var load = {
                            Milestone: folder,
                            File: "noFile"
                        }
                        final.push(load);
                    }
                }
             });
         });
         
     }

     setTimeout(function(){
        var payload = {
            data: final
        }
        res.send(payload);
    }, 50);
}
catch(err){
    console.log(err)
}
 })

 app.post('/api/getMilestonePicsInd', function(req, res){
     try{
     if(req.body.Filename === 'noFile'){
         res.sendFile("./noMilestonePic.png", {"root": __dirname});
     }
     else{
        var path = "./MilestonePics/" + req.body.User + "/" + req.body.Milestone + "/" + req.body.Filename;
        if (fs.existsSync(path)){
            res.sendFile(path, {"root": __dirname});
        }
     }
    }
    catch(err){
        console.log(err);
    }
 })

 httpServer.listen(3000);
//httpsServer.listen(8443);
console.log('Running on port 3000....');