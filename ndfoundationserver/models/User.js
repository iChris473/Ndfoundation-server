
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    stateOfOrigin: {
        type: String,
        required: true
    },
    placeOfBirth: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {timestamps: true} )

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next()
    }
    
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
    next()
})

UserSchema.methods.getSignedToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
}

UserSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

    return resetToken
}


module.exports = mongoose.model("User", UserSchema)

// 41820b22928dc1a2763c7800cef42ebb46583c6e2394d9f36283a765aef8e81949fedc