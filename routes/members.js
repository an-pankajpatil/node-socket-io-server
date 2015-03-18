//include database models
var models = require('../models');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: models.AdminDetails.email,
        pass: models.AdminDetails.passwrd
    }
});
//function to list all the members from database
exports.getList = function(req, res) {
    //query to list all members
    models.Member.find({},{},function(err,data) {
        //check if query is successfull.
        if(data) {
            //check if data is empty
            if(data.length > 0) {
                //send members list
                res.send(data);
            } else {
                //send message as data is empty
                res.send("There are no members.");
            }
        } else {
            //query is unsuccessfull send message
            if(err) {
                res.send(err.err);
            } else {
                res.send("Members are not listed at this time, please try again later.");
            }
            
        }
        
    });
};


//Invite members

exports.invitemember = function(req, res) {
    var date = new Date();
    var components = [
        date.getYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ];
    //generate activation code;
    var activation_code = components.join("");
    /*
    console.log("===Send Invite===");
    console.log(JSON.stringify(req.body));
    console.log("===Send Invite===");
    */
    var msg = "";
    if(req.body.message) {
        msg = req.body.message;
    }
    models.Member.findOne({email:req.body.email},{_id:1}, function(e, rec) {
        if(!rec) {
            //send email with activation code
            transporter.sendMail({
                from: 'Admin Invitation <'+models.AdminDetails.email+'>',
                to: req.body.email,
                subject: 'Invitation to join Sample Chat',
                genrateTextFromHTML: true,
                html: '<p>Hi '+req.body.first_name+'!</p><p>Your invitation code is as follows <br/> '+activation_code+'</p><p></p><p></p><p>Thank You,<br/>Administrator</p>'
            }, function(error,rd) {
                if(error){
                    console.log("1");
                    console.log(error);
                } else {
                    //mail send successfully now save the details in database.
                    var members = new models.Member;
                    var fname = req.body.first_name.toLowerCase();
                    var lname = req.body.last_name.toLowerCase();
                    members.first_name = req.body.first_name;
                    members.last_name = req.body.last_name;
                    members.username = fname+'_'+lname;
                    members.email = (req.body.email).toLowerCase();
                    members.activation_code = activation_code;
                    members.status = 'Inactive';
                    members.save(function(e, data) {
                        //console.log(JSON.stringify(e));
                        if (data) {
                            //send the message after saving the data
                            res.send("Email "+req.body.email+" successfully added.");
                        } else {
                            res.status(400).send("Error occurred. Please check manage members page if data is added or not.");
                        }
                    });
                }

            });
        } else {
            res.status(400).send("Email "+req.body.email+" was not added as they are already members of involved members.");
        }
    });

    //res.send("Success");
}

