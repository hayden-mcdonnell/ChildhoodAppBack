var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const saltRounds = 13;

//Schema
var userSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    img: {
       data: Buffer, 
       contentType: String 
    }
  });

var Users = module.exports = mongoose.model('Users', userSchema);

//authenticates user -- takes email and checks password against database

 module.exports = {
   authenticate: function (email, password, callback) {
    Users.findOne({ email: email })
    .exec(function (err, user) {
        if (err) {
          return callback(err)
        } 
        
        else if (!user) {
          var err = new Error('User not found.');
          console.log(err);
          err.status = 401;
          return callback(err);
        }
        
        bcrypt.compare(password, user.password).then(function(res) {
          if (res === true)
          {
            return callback(null, user);
          }
          else
          {
            var err = new Error('Password incorrect.');
          
            err.status = 400;
            return callback(err);
          }
      }); 
    });
  },

  changePw: function (data, callback){
    Users.findOne({ email: data.email })
    .exec(function (err, user) {

      bcrypt.compare(data.current, user.password, function(err, res) {
        if (res === true){
          bcrypt.hash(data.newpw, saltRounds, function(err, hash) {
            user.password = hash;
            user.save();
          });
        }
        else{
          var err = new Error('Passwords dont match.');
          return callback(err);
        }
      });
    }
    )},
}