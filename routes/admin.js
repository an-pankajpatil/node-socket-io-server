var models = require('../models');
/*
 * Admin module
 * login/ add/ edit admin
 *
 */


//check if the login details are valid and send the data
exports.loginAdmin = function(req, res) {
    console.log(JSON.stringify(req.body));
	var uname = req.body.username;
    var passwd = req.body.passwd;
	
    // fetch user and test password verification
    models.Admin.findOne({ username: uname }, {}, function(err, user) {
        //check if error
        if (err) {
            //send back the error
            res.status(400);
        }
        //console.log(user);
        // test a matching password
	if(user) {
        models.comparePassword(passwd, user.password, function(e, isMatch) {
            //check if error
            if(e) {
                //send back the error
                res.status(400);
            }
            //is the password match
		console.log(isMatch);
            if(isMatch && isMatch==true) {
                //send user data as the password is matched
                res.send(user);
            } else {
                //send error message as the password not matched
                //res.send("Password not valid");
                res.status(400).send("Password not valid");
            }
            
        });
	} else {
		res.status(400).send("Username not valid");
	}
    }); 
    
    
};


//update the admin user
exports.updateAdmin = function(req, res) {
    models.Admin.findOne({
        _id: req.body.admid
    }, function(err, result) {
        if(result) {
            result.username = req.body.username;
            result.email = req.body.email;
            result.password = req.body.password;
            //save the updated data to database
            result.save(function(err,data) {
                if(data) {
                    //send back the data saved
                    res.send(data);
                } else {
                    res.send("Problem occured while saving the data. Please try again.");
                }
            });
            
        } else {
            
            res.send("Looks like your session is expired. Please logout and login again.");
        }
    });
};

//add admin users
exports.addAdmin = function(req,res) {
    // get connection
    var admin = new models.Admin;
    admin.username = 'admin';
    admin.password = 'test123';
    admin.email = 'admin@test.com';
    admin.save(function(e, data) {
        if(e) {
            res.send(e.err);
        }
        if (data) {
            res.send(data);
        }
    });
    
};
