const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
 
const userSchema = mongoose.Schema({
    email: {
        type:String,
        trim:true,
        unique: 1 
    },
    password: {
        type: String,
        minglength: 5
    },
    name: {
        type:String,
        maxlength: 50
    },
    phone_number: {
        type:String,
        trim:true
    },
    role : {
        type:Number,
        default: 0 
    }
    
}, {
    versionKey: false  
});
 
 
userSchema.pre('save', function( next ) {
    var user = this;
    
    if(user.isModified('password')){    
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
            
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash 
                next()
            })
        })
    } else {
        next()
    }
});
 
 
const User = mongoose.model('User', userSchema, 'user');
 
module.exports = { User }