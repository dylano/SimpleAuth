var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    expressSession = require('express-session'),
    User = require('./models/user'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');

// App config
var PORT = 3000;
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost/simpleAuth');

// Auth / Passport config
app.use(require('express-session')({
    secret: 'this is not a dog',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ROUTES 
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req, res) {
    res.render('secret');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/register', function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect('/secret');
        });
    });
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
        successRedirect: '/secret',
        failureRedirect: '/login'}), function(req, res) {
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(PORT, function(){
    console.log(__dirname + ' listening on port ' + PORT + '...');
});
