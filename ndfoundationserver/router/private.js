const express = require('express');
const router = express.Router()

const privateController = require('../controller/private')
const {protect} = require('../middleware/auth')

router.get('/', protect, privateController.getPrivateData)

module.exports = router