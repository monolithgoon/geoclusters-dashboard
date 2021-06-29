`use strict`
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const appConfig = require('../config/config.js');
const USER_MODEL = require('../models/user-model.js');
const catchAsync = require('../utils/catch-async.js');
const ServerError = require('../utils/app-error.js');


const signJWTToken = payloadId => {
   return jwt.sign({id: payloadId}, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtExpiresIn,
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
   // const jwtToken = jwt.sign( {id: newUser._id}, process.env.JWT_SECRET, {
   //    expiresIn: process.env.JWT_EXPIRES_IN
   // });
   
   
   // res.status(201).json({
   //    status: 'success',
   //    jwtToken,
   //    data: { 
   //       user: newUser
   //    }
   // });


   // CREATE NEW USER MTD. 3 > BEST MTD.
   const newUser = new USER_MODEL({
      user_first_name: req.body.user_first_name,
      user_last_name: req.body.user_last_name,
      user_email: req.body.user_email,
      user_password: req.body.user_password,
      user_password_confirm: req.body.user_password_confirm,
   });


   // IMPLEMENT JWT > PAYLOAD (=> id: newUser._id) + SECRET
   const jwtToken = signJWTToken(newUser._id);
   console.log(jwtToken)


   // model.save SEEMS TO BE BETTER PRACTICE THAN model.create
   await newUser.save((mongooseSaveErr, savedUser) => {
      if (mongooseSaveErr) {
         next(new ServerError(`newUserSaveErr: ${mongooseSaveErr}`, 400, `signupErr`));
      } else {
         res.status(201).json({
            status: 'success',
            jwtToken,
            data: { 
               user: newUser,
            },
         });
      };
   });
});


// login CONTROLLER
exports.login = catchAsync(async (req, res, next) => {

   // LOGGING IN A USER INVOLVES SIGNING A JWT TOKEN...
   
   const { user_email, user_password } = req.body // USING DESTRC.

   // >> LOGIN CHECKLIST >>

      // 1. CHECK IF EMAIL && PASSWORD EXIST IN req.body
      if(!user_email || !user_password) {
         return next(new ServerError(`Please provide an email and password..`, 401, `loginErr`));
      };

      // 2. CHECK IF THE USER EXISTS && THEIR PASSWORD IS CORRECT
      const dbUser = await USER_MODEL.findOne({ user_email }).select(`+user_password`); // the 'user_password' field is de-selected by default in USER_MODEL; this is how to re-select it

      if (!dbUser || !(await dbUser.checkPassword(user_password, dbUser.user_password))) {
         return next(new ServerError(`Incorrect email or password`, 401, `loginErr`));
      };

      // 3. IF EVERYTHING IS OK, SIGN THE JWT && SEND BACK TO CLIENT
      const jwtToken = signJWTToken(dbUser._id);

      res.status(200).json({
         status: `success`,
         jwtToken,
      });
});


// PROTECT ROUTES CONTROLLER FN.
exports.protectRoute = catchAsync(async(req, res, next) => {

   let headerToken;

   // 1. Try to get the JWT token from the req. header 
   if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)) {
      headerToken = req.headers.authorization.split(' ')[1];
   };
   
   // check if the token exists
   if (!headerToken) {
      return next(new ServerError(`Unauthorized. You must be logged in to access this resource.`, 401, `protectRouteErr`));
   };

   // 2. Verify the token's signature
   const decodedToken = await promisify(jwt.verify)(headerToken, appConfig.jwtSecret);
   console.log(decodedToken)

   // 3. Check if the the user trying to access the route exists

   // 4. Check if the user changed their password after the token was issed

   next();
}, "protectRoute");