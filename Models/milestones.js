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
    },
    notes:{
      type: String,
      required: false,
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
  completeMilestones: function(body, eDate){
    Milestones.findById(body.id, function (err, data) {
      data.endDate = eDate;
      data.save();
    }
    )},

    //Changes time for milestone
    changeTime: function(body){
      Milestones.findById(body.milestone, function (err, data) {
        if(body.startDate !== '')
        {
          data.startDate = body.startDate;
        }
        if(body.endDate !== '')
        {
          data.endDate = body.endDate;
        }
       
        data.save();
      }
      )},

      //Add note
      addNote: function(body){
        Milestones.findById(body.id, function (err, data) {
          data.notes += body.note;
          data.save();
        }
        )},
        //Edit note
        editNote: function(body){
          Milestones.findById(body.id, function (err, data) {
            data.notes = body.note;
            data.save();
          }
          )},

        //View notes
        viewNote: function(body, callback){
          Milestones.findById(body.id, function (err, data) {
            return callback(null, data.notes)
          }
          )},
  }

