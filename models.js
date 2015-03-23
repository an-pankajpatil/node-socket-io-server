var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

exports.ObjectId = mongoose.Types.ObjectId;
exports.version = mongoose.version;
var AdminDt = new Object();
AdminDt.email = "pankaj.p@applicationnexus.com";
AdminDt.passwrd = "123India#@!";
exports.AdminDetails = AdminDt;
//mongoose.set('debug', true);
/**
 * UserSchema is used to contain the users in the application.
 * It is central place to store all the user related information
 * @type {Schema}
 */
var memberSchema = new Schema({
    username: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    profile_picture: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    age: String,
    gender: String,
    activation_code: String,
    blocked_users: [],
    status: String,
    geo: {
        lng: Number,
        lat: Number
    },
});
memberSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
// Ensure virtual fields are serialised.
memberSchema.set('toJSON', {
    virtuals: true
})
memberSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});


//we can access the table member using Member variable
exports.Member = mongoose.model('Member', memberSchema);

var adminSchema = new Schema({
    username: String,
    email: String,
    password: String
})

adminSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});



exports.Admin = mongoose.model('Admin', adminSchema);



var chatMessageSchema = new Schema({
    msg: String,
    stream_id    :String,
    from_mem_id  : Schema.Types.ObjectId,
    from_mem_name: String,
    receipient_mem: [{ id: Schema.Types.ObjectId, first_name: String, last_name: String, email: String, read_flag: {default: 'false', type: String} }],
    blocked_id:[],
    msg_type: String,
    display: {
        type: String,
        default: "true"
    },
    created_at: {
        type   : Date,
        index  : true,
        default: Date.now
    },
    
})

chatMessageSchema.index({ from_mem_name: 1, to_mem_name: 1, msg_type: 1, organisation_id: 1});

exports.Chatmessage = mongoose.model('Chatmessage', chatMessageSchema);



/*** Common methods which will be used in models ***/

exports.comparePassword = function(candidatePassword, actualPassword, cb) {
    bcrypt.compare(candidatePassword, actualPassword, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}; 

/*** Common methods which will be used in models ***/

mongoose.connect('mongodb://localhost/cmdb', function(err) {
    if(err)
        throw err;
});