var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

var app = express();
var http = require('http'),
    routes = require('./routes'),
    members = require('./routes/members'),
    admin = require('./routes/admin');
var path = require('path');
/***allow cross domain requests Start***/
//CORS middleware
var allowCrossDomain = function(req, res, next) {

    var oneof = false;
    if(req.headers.origin) {
        console.log(req.headers.origin);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;

        //console.log(oneof);

    } else {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4000/');
        oneof = true;
    }
    res.header('Access-Control-Allow-Credentials', true);
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
}

//allow cross domain requests
app.use(allowCrossDomain);

app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
//app.use(session({ resave: true, saveUninitialized: true, secret: 'uwotm8' }));

// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse multipart/form-data
app.use(multer());

app.use(express.static(path.join(__dirname, 'public')));

/***allow cross domain requests End***/

app.get('/', function (req, res) {
  res.send('Hello World!');
});

/***Members Section Start***/
//get all members list
app.get('/members/list', members.getList);
//add member to members table
//app.post('/members/add', members.addMember);
// send invitation mail
app.post('/members/sendInvitation',members.invitemember);
/***Members Section End***/

/***Admin Section Start***/
//Admin Login
app.post('/admin/AdminLogin', admin.loginAdmin);
//Admin update
app.post('/admin/AdminUpdate', admin.updateAdmin);
/***Admin Section Start***/
var models = require('./models');
var io = require('socket.io')();
io.on('connection', function(socket){
    socket.on('message:send', function(data){
        if(data.msg_type=='A') {
            models.Member.find({},{id:1,first_name:1,last_name:1,email:1},function(err,r) {
               //console.log(data); 
                if(r) {
                    var cmessage = new models.Chatmessage;
                    cmessage.msg = data.msg;
                    cmessage.receipient_mem = r;
                    cmessage.stream_id = data.id;
                    cmessage.msg_type = "A";
                    cmessage.from_mem_id = data.id;
                    cmessage.from_mem_name = data.from_name;
                    console.log(JSON.stringify(r));
                    cmessage.save(function(e, rec) {
                        console.log(e);
                        io.emit('message:received', { id: data.id, msg: data.msg, from_mem_id: data.id, from_mem_name: data.from_name, stream_id: data.id, receipient_mem: r, msg_type: "P"});
                    });
                    var h = 0;
                    var lenh = r.length;
                    r.forEach(function(obj) {
                        var recpt   = new Object;
                        recpt.id    = obj._id;
                        recpt.first_name  = obj.first_name;
                        recpt.last_name  = obj.last_name;
                        recpt.email = obj.email;
                        var stream_id = data.id+"_"+obj._id;
                        var rcpt = [];
                        rcpt.push(recpt);
                        var chatmessage = new models.Chatmessage;
                        chatmessage.msg = data.msg;
                        console.log(JSON.stringify(data));
                        chatmessage.receipient_mem = rcpt;
                        chatmessage.stream_id = stream_id;
                        chatmessage.msg_type = "P";

                        chatmessage.from_mem_id = data.id;
                        // console.log("\n\ninside from_mem_id : "+obj);
                        chatmessage.from_mem_name = data.from_name;
                        chatmessage.display = "false";
                        chatmessage.save(function(e, rec) {
                            if (rec) {

                            }
                        });
                });
                              
                }
                
            });
            
        }
    });

});
io.listen(5000);



var server = app.listen(app.get('port'), function () {

  var port = app.get('port');

  console.log('Example app listening on port '+port)

});
