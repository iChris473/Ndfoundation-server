

const express = require("express");
const router = express.Router()

const userController = require("../controller/userController");

// Create Applicant
router.post("/user/create", userController.createUser)
// get all users
router.get("/user/get", userController.getAllUsers)
// get all users
router.get("/user/get/:id", userController.getOneUSer)
// login user
router.post("/user/siginin", userController.loginUser)
// update users account
router.put("/user/update/:id", userController.updateUser)
// forgot password
router.post("/user/forgotpassword", userController.forgotPassword)
// reset password
router.put("/user/resetpassword", userController.resetPassword)

// "firstName":"Christian",
// "lastName":"Ndubuisi",
// "middleName":"Joseph",
// "dob":"18/03/2000",
// "stateOfOrigin":"Ebonyi",
// "placeOfBirth":"Delta",
// "institution":"ATBU",
// "grade":"First Class",
// "email":"chris@gmail.com",
// "password":"test"



module.exports = router