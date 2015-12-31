var express = require('express');
var router = express.Router();
//var err = 'This is is a wrong test';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// to request for register.jade Aziz
router.get('/register', function(req, res, next) {
  res.render('register', {
  	'title': 'Register'
  });
});

//to get connection with login.jade Aziz
router.get('/login', function(req, res, next) {
  res.render('login', {
  	'title': 'Login'
  });
});

router.post('/register', function(req, res, next){
	//Get Form Values
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

// Check Image Field
	if(req.body.profileimage){
		console.log('Uplodaing File ...');

			//File Info..
			var profileImageOriginalName = req.body.profileimage.originalName;
			var profileImageName 		 = req.body.profileimage.name;
			var profileImageMime		 = req.body.profileimage.mimetype;
			var profileImagePath		 = req.body.profileimage.path;
			var profileImageExt			 = req.body.profileimage.extension;
			var profileImageSize		 = req.body.profileimage.size;
	} else {
			//set a default image
			var profileImageName = 'noimage.png';
	}

	//Form Validation by express validation Aziz
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email not valied').isEmail();
	req.checkBody('username','username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);

	// Check for errors by express validation Aziz
	var errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	} else{
		var newUser = new User({ 
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileImageName
		});

		// Create User Aziz
		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		}); 

		// Success Message Aziz
		req.flash('success', 'You are now registered and may log in');

		res.location('/');
		res.redirect('/');
	}
}); // router.post

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy( 
	function(username, password, done){
		User.getUserByUsername(username,function(err, user){
			if(err) throw err;
			if(!user){
				console.log('Unknown user!!!!');
				return done(null, false, {message: 'Unknown user'});
			}

			User.comparePassword(password,user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					console.log('Invalid Password');
					return done(null, false, {message: 'Invalid Password'});
				}

			});
		});
	}
));
router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failueFlash:'Invalid username or password'}), function(req,res){
	console.log('Authencation Successful');
	req.flash('success', 'You are logged in');
	res.redirect('/');
});

//if lougt then don't go any pages, redirect to login page
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
