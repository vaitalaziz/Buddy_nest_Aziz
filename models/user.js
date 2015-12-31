var err = 'This is in user.js';
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost/BuddyNest');
var db = mongoose.connection;


//User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password:{
		type: String, required:true, bcrypt:true
	},
	email:{
		type: String
	},
	name:{
		type: String
	}
});

// this object valuse will pass to users.js
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) return callback(err);
		callback(null, isMatch);
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}


module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

// newUser comes from  routes-users.js 
module.exports.createUser = function(newUser, callback){
	bcrypt.hash(newUser.password, 10, function(err, hash){
		if(err) throw err;
		//Set hasehed pw
		newUser.password = hash;
		//create User
		newUser.save(callback);
	});

}