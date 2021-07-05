`use strict`
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const APP_CONFIG = require('../config/config.js');
const USER_MODEL = require('../models/user-model.js');
const catchAsync = require('../utils/catch-async.js');
const ServerError = require('../utils/app-error.js');
const sendEmail = require('../services/email.js');


const signJWT = payloadId => {
   return jwt.sign({id: payloadId}, APP_CONFIG.jwtSecret, {
      expiresIn: APP_CONFIG.jwtExpiresIn,
   });
};


const createSendToken = (currentUser, statusCode, response) => {

   // IMPLEMENT JWT => PAYLOAD (=> id: newUser._id) + SECRET
   const jWebToken = signJWT(currentUser._id);
   const cookieOptions = {
      expires: new Date(Date.now() * APP_CONFIG.jwtExpiresIn * 24 * 60 * 60 * 1000), // convert from days to milliseconds
      httpOnly: true, // cookie cannot be accessed or modified by the browser
   };

   // SET COOKIE 'secure' OPTION to 'true' ONLY IN PROD. MODE FOR https
   console.log(process.env.NODE_ENV)
   if (process.env.NODE_ENV === `production`) cookieOptions.secure = true;

   console.log(response.cookie)
   // ATTACH A COOKIE TO THE RES. OBJ.
   response.cookie(`jwtcookie`, jWebToken, cookieOptions)

   // HIDE THE USER. PASSWORD IN THE RES.
   currentUser.user_password = undefined;

   // SEND TO CLIENT
   response.status(statusCode).json({
      status: 'success',
      jWebToken,
      data: { 
         user: currentUser,
      },
   });
};


exports.signup = catchAsync(async (req, res, next) => {

   // // CREATE THE NEW USER DOCUMENT IN THE DB. HERE
   // const newUser = await USER_MODEL.create(req.body,) // 'model.create' always returns a promise
   
   
   // // MTD. 2
   // const newUser = await USER_MODEL.create({
   //    user_first_name: req.body.user_first_name,
   //    user_last_name: req.body.user_last_name,
   //    user_email: req.body.user_email,
   //    user_password: req.body.user_password,
   //    user_password_confirm: req.body.user_password_confirm
   // });
   

   // // IMPLEMENT JWT > PAYLOAD + SECRET
   // const jWebToken = jwt.sign( {id: newUser._id}, process.env.JWT_SECRET, {
   //    expiresIn: process.env.JWT_EXPIRES_IN
   // });
   
   
   // res.status(201).json({
   //    status: 'success',
   //    jWebToken,
   //    data: { 
   //       user: newUser
   //    }
   // });


   // CREATE NEW USER MTD. 3 > BEST MTD.
   const newUser = new USER_MODEL({
      user_first_name: req.body.user_first_name,
      user_last_name: req.body.user_last_name,
      user_role: req.body.user_role,
      user_email: req.body.user_email,
      user_password: req.body.user_password,
      user_password_confirm: req.body.user_password_confirm,
   });

   // model.save SEEMS TO BE BETTER PRACTICE THAN model.create bcos. the pre.save m-ware is forced to run
   await newUser.save((mongooseSaveErr, savedUser) => {
      if (mongooseSaveErr) {
         next(new ServerError(`newUserSaveErr: ${mongooseSaveErr}`, 400, `signupErr`));
      } else {
         createSendToken(newUser, 201, res);
      };
   });
   
}, `userSignupFn.`);


// login CONTROLLER
exports.login = catchAsync(async (req, res, next) => {

   // LOGGING IN A USER INVOLVES SIGNING A JWT TOKEN...
   
   const { user_email, user_password } = req.body // USING DESTRC.

   // >> LOGIN CHECKLIST >>

      // 1. CHECK IF EMAIL && PASSWORD EXIST IN req.body
      if(!user_email || !user_password) {
         return next(new ServerError(`Please provide an email and password..`, 401, `userLoginFn`));
      };

      // 2. CHECK IF THE USER EXISTS && THEIR PASSWORD IS CORRECT
      const dbUser = await USER_MODEL.findOne({ user_email }).select(`+user_password`); // the 'user_password' field is de-selected by default in USER_MODEL; this is how to re-select it

      if (!dbUser || !(await dbUser.comparePasswords(user_password, dbUser.user_password))) {
         return next(new ServerError(`Invalid email or password`, 401, `userLoginFn`));
      };

      // 3. IF EVERYTHING IS OK, SIGN THE JWT && SEND BACK TO CLIENT
      createSendToken(dbUser, 200, res);
}, `userLoginFn.`);


// PROTECT ROUTES CONTROLLER FN.
exports.protectRoute = catchAsync(async(req, res, next) => {

   let headerToken;

   // 1. Try to get the JWT token from the req. header 
   if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)) {
      headerToken = req.headers.authorization.split(' ')[1];
   };
   
   // check if the token exists
   if (!headerToken) {
      return next(new ServerError(`Unauthorized. You must be signed in to access this resource.`, 401, `protectRouteFn.`));
   };

   // 2. Verify the token's signature
   const decodedToken = await promisify(jwt.verify)(headerToken, APP_CONFIG.jwtSecret);
   // console.log({decodedToken})

   // 3. Verify if the the user trying to access the route still exists
   const currentUser = await USER_MODEL.findById(decodedToken.id);
   if (!currentUser) { return next(new ServerError(`The user that owns this token no longer exists`, 401, `protectRouteFn.`))}

   // 4. Throw err if user changed their password after the token was issued
   if (currentUser.checkPasswordChanged(decodedToken.iat)) {
      return next(new ServerError(`User recently changed their password. Please login again.`, 401, `protectRouteFn.`));
   };

   // 5. store the user on the req. obj for future use
   req.user = currentUser;

   // 6. grant access to protected route
   next();

}, "protectRouteFn.");


exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      // roles is an array of roles => ['user', 'admin', 'manager']
      if (!(roles.includes(req.user.user_role))) {
         return next(new ServerError(`You do not have permission to perfom this action. Contact the admin.`, 403, `restrictToFn`));
      };
      next();
   };
};


exports.forgotPassword = catchAsync(async(req, res, next) => {

   // 1. Get user based on the POSTed email
   const dbUser = await USER_MODEL.findOne({user_email: req.body.user_email});

   if(!dbUser) {
      return next(new ServerError(`There is no user with that email address [ ${req.body.user_email} ].`, 404, `forgotPasswordFn`));
   };

   // 2. Generate the random reset token
   const passwordResetToken = dbUser.createPasswordResetToken();

   // 2b. save the reset token & expiry date on the USER_MODEL doc.
   await dbUser.save({validateBeforeSave: false});

   // 3.Send it to the user's email address
   const passwordResetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${passwordResetToken}`;
   const emailText = `Submit a PATCH request with your new user_password and user_password_confirm to: ${passwordResetURL}\nIf you didn't forget your password, please ignore this email.`;

   // HANDLE ERR. THAT MIGHT OCCUR IN SENDING EMAIL
   try {
      
      await sendEmail({
         emailAddr: req.body.user_email,
         emailSubject: `Your password reset token. Valid for 30 min. only.`,
         emailText,
      });
      
      res.status(200).json({
         status: `success`,
         message: `A password reset URL was just sent to email address [ ${req.body.user_email} ]`,
      });
      
   } catch (sendEmailErr) {

      dbUser.password_reset_token = undefined;
      dbUser.password_reset_expires = undefined;
      await dbUser.save({validateBeforeSave: false});

		console.error((`sendEmailErr: ${sendEmailErr.message}`));

      return next(new ServerError(`There was an error sendng the password reset email. Check your internet connection. Try again later. ${sendEmailErr.message}`, 500, `forgotPasswordTryCatch`))
   };
   
}, `forgotPasswordFn`);


exports.resetPassword = catchAsync(async(req, res, next) => {

   // 1. Get the user based on the token

      // 1a. Encrypt/hash the token (send via email) and compare with token in DB
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      // 1b. Query the db, and find the matching user
      const dbUser = await USER_MODEL.findOne({
         user_password_reset_token: hashedToken, 
         user_password_reset_expires: { $gt:Date.now() }
      });

   // 2. If the token has not expired, and the user exists, set the new password
   if (!dbUser) { return next(new ServerError(`The token is invalid or has expired`, 400, `resetPasswordFn`))}
   console.log(req.body.user_password, req.body.user_password_confirm)
   dbUser.user_password = req.body.user_password;
   dbUser.user_password_confirm = req.body.user_password_confirm;
   dbUser.user_password_reset_token = undefined;
   dbUser.user_password_reset_expires = undefined;
   await dbUser.save();
   
   // 3. Update the 'user_password_changed_at' property for the user
   
   // 4. Log the user in, and send the JWT to the client
   // EVERYTHING IS OK, SIGN THE JWT && SEND BACK TO CLIENT
   createSendToken(dbUser, 200, res);
   
	next();

}, `resetPasswordFn`);


exports.updatePassword = catchAsync(async(req, res, next) => {

   // 1. Query the db, and find the matching user
   const currentUser = await USER_MODEL.findById(req.user.id).select('+user_password');

   // 2. Check that the POSTed current password is correct
   if (!currentUser.comparePasswords(req.body.current_password, currentUser.user_password)) {
      return next(new ServerError(`The password provided is incorrect.`, 401));
   };

   // 3. If so, update the password
   currentUser.user_password = req.body.user_password;
   currentUser.user_password_confirm = req.body.user_password_confirm;
   
   // 3b. save the user
   // currentUser.findByIdAndUpdate will NOT work as intended ..
   await currentUser.save();

   // 4. Log the user back in with the password; send JWT 
   createSendToken(currentUser, 200, res);

}, `updatePasswordFn`);