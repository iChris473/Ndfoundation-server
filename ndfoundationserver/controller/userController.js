
require("../models/mongodb")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const sendMail = require('../middleware/sendEmail')
const crypto = require('crypto')

// Register User
exports.createUser = async (req, res) => {

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPassword
    const newUser = new User(req.body)
    try {
        await newUser.save();
        // // hides password from client
        const {password, createdAt, updatedAt, ...others} = newUser._doc
        res.status(201).json(others)

        // sends JSON_WEB_TOKEN
        // const token = user.getSignedToken()

        // res.status(200).json({ success: true, token })
    } catch (err) {
        res.status(500).json(err)
    }
}

// Login User
exports.loginUser = async  (req, res) => {
    try {
        // finds user by email
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("enter correct credentials");

        // compares password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(404).json("enter correct credentials")

        // sends JSON_WEB_TOKEN
        // const token = user.getSignedToken()
        
        // res.status(200).json({success:true, token})
        // // hides password from client
        const {password, createdAt, updatedAt, ...others} = user._doc
        res.status(200).json(others)
        

    } catch (err) {
        res.status(400).json(err)
    }
}

// update users 
exports.updateUser = async (req, res) => {
    // checks if it's user's account
    if(req.body.userID == req.params.id){
        try {
            let cryptedPassword;
            if(req.body.email){
                const currentUser = await User.findById(req.params.id)
                const checkPassword = await bcrypt.compare(req.body.password, currentUser.password);
                !checkPassword && res.status(404).json("enter correct credentials")
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                cryptedPassword = hashedPassword
            }
            if(req.body.oldPassword){
                const currentUser = await User.findById(req.params.id)
                const checkPassword = await bcrypt.compare(req.body.oldPassword, currentUser.password);
                !checkPassword && res.status(404).json("enter correct credentials")
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                cryptedPassword = hashedPassword
                
            }

            cryptedPassword && (req.body.password = cryptedPassword)

        await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true});
        
            res.status(200).json("account updated")
        } catch (err) {
            res.status(404).json(err)
        }
    
    }   else{
        res.status(403).json("you can only update your account")
        }
}


// get users and paginate
exports.getAllUsers = async (req, res) => {
    try {
        let query = User.find();
        const page = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.limit) || 3
        const skip = (page - 1) * pageSize
        const total = await User.countDocuments()
        const pages = Math.ceil( total / pageSize )
        query = query.skip(skip).limit(pageSize)
        const results = await query

        if(page > pages) {
            return res.status(404).json('page not found')
        }

        res.status(200).json({
            count: results.length,
            page,
            pages,
            data: results
        })

    } catch (err) {
        res.status(400).json(err)
    }
}

// get one user 
exports.getOneUSer = async (req, res) => {
    try {
        // finds user by ID
        const user = await User.findById(req.params.id)
        
        // hides password from client
        const {password, createdAt, updatedAt, ...others} = user._doc
        res.status(200).json(others)

    } catch (err) {
        res.status(400).json(err)
    }
}

// Forgot Password

exports.forgotPassword = async (req, res) => {
    const {email} = req.body

    try {
        const user = await User.findOne({email})

        !user && res.status(400).json(err)

        const resetToken = user.getResetPasswordToken()

        await user.save();

        const resetUrl = `http://localhost:3000/resetpassword?resettoken=${resetToken}`

        const message = `
            <h1>You have requested for a password reset</h1>
            <p>Please click the link below to reset your password, This link expires after 10 minutes </p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `

        try {
            await sendMail({
                to: user.email,
                subject: 'Password reset request',
                text: message
            })
            res.status(200).json('Email Sent')
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined

            await user.save()

            res.status(500).json('Email could not be sent')
        }

    } catch (err) {
        res.status(500).json('An error occured sening the email')
    }
}

exports.resetPassword = async (req, res) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.query.resettoken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        })

        !user && res.status(400).json('Invalid Reset Token')

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save()

        res.status(200).json("Password changed")

    } catch (error) {
        res.status(400).json('An error occured while resetting the password')
    }
}