`use strict`
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller.js')
const authController = require('../controllers/auth-controller.js')


// USER AUTHENTICATION FUNCTIONS
// router.post('/signup', authController.restrictTo(`admin`), authController.signup)
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.route('/forgotPassword').post(authController.forgotPassword)
// router.post('/resetPassword', authController.resetPassword)


// USER ADMINISTRATION FUNCTIONS
router
   .route('/admin')
      .get(authController.protectRoute, authController.restrictTo(`admin`), userController.getAllUsers)
      .post(authController.protectRoute, authController.restrictTo(`admin`), userController.createUser);

router
   .route('admin/user/:id')
   .get(authController.protectRoute, authController.restrictTo(`admin`), userController.getUser)
   .patch(authController.protectRoute, authController.restrictTo(`admin`), userController.updateUser)
   .delete(authController.protectRoute, authController.restrictTo(`admin`), userController.deleteUser)


module.exports = router;