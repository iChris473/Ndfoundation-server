

const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1]
    } 

    if(!token) res.status(401).json('You dont have access to this route')

    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if(!user) res.status(404).json('No user found with this id')

        req.user = user

        next()

    } catch (error) {
        res.status(401).json('No access to this route')
    }
}