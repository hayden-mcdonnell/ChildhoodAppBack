var mongoose = require('mongoose');

//Schema
var milestoneSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      trim: true
    },
    milestoneName: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: String,
      required: true,
      trim: true
    },
    endDate: {
      type: String,
      required: true,
      trim: true
    }
  });

var Milestones = mongoose.model('Milestones', milestoneSchema);



module.exports = {
  //returns milestones associated with each email
  getMilestones: function (email, callback) {
    Milestones.find({ email: email })
      .exec(function (err, milestone) {
        if (err) {
          return callback(err)
        } 
        else if (!milestone) {
          var err = new Error('No milestones found.');
          console.log(err);
          err.status = 401;
          return callback(err);
        }
       
        if (milestone) {
          return callback(null, milestone);
        } 
      });
  },
  //runs a insert to insert data into mongodb
    postMilestones: function(datas){
    Milestones.create(datas, function (err, data) {
        
    }
    )},

  //updates milestone progress in database
  completeMilestones: function(id){
    Milestones.findById(id, function (err, data) {
      data.endDate = '1-1-2018';
      data.save();
    }
    )},

  }

