`use strict`
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller.js')
const authController = require('../controllers/auth-controller.js')


// USER AUTHENTICATION FUNCTIONS
router.post('/signup', authController.signup)
// router.route('/signup').post(authController.protectRoute, authController.signup);
router.post('/login', authController.login)


// USER ADMINISTRATION FUNCTIONS
router
   .route('/')
      .get(authController.protectRoute, userController.getAllUsers)
      .post(authController.protectRoute, userController.createUser);

router
   .route('/:id')
   .get(authController.protectRoute, userController.getUser)
   .patch(authController.protectRoute, userController.updateUser)
   .delete(authController.protectRoute, userController.deleteUser)


module.exports = router;