`use strict`
const crypto = require('crypto');
const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({

   user_first_name: {
      type: String,
      required: [true, `The user's first name is required`]
   },

   user_last_name: {
      type: String,
      required: [true, `The user's last name is required`]
   },

   user_role: {
      type: String,
      enum: [`user`, `manager`, `admin`],
      required: [true, `The user's role must be specified`],
      default: `user`,
   },

   user_email: {
      type: String,
      required: [true, `The user's email is required`],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
   },

   photo_url: String,

   user_password: {
      type: String,
      required: [true, `The user must have a password`],
      minLength: 10,
      select: false,
   },

   user_password_confirm: {
      type: String,
      required: [true, `The user must confirm their password`],
      validate: {
         // IMPORTANT > This validator only works by calling USER_MODEL.save() OR USER_MODEL.create() & NOT WITH .findOne() && .updateOne() 
         validator: function(el) {
            return el === this.user_password; // the 'this' keyword refers to the current document..
         },
         message: `The password confirmation does not match the original`,
      },
   },

   user_password_changed_at: {
      type: Date,
      required: false,
   },

   user_password_reset_token: String,

   user_password_reset_expires: Date,
});


// THIS PRE-SAVE MIDDDLEWARE RUNS BETWEEN GETTING THE DATA && SAVING IT TO THE DB
userSchema.pre('save', async function(next) {

   // PROCEED TO RETURN THE NEXT M.WARE IF THE P.WORD HAS NOT BEEN MODIFIED OR NEWLY CREATED
   // ie., ONLY RUN THE REMAINING CODE IN THIS M-WARE IF THE PASS. WAS MODIFIED
   if (!this.isModified('user_password')) return next();

   // HASH / ENCRYPT THE PASSWORD WITH COST OF 12
   this.user_password = await bcrypt.hash(this.user_password, 12);

   // DO NOT PERSIST PASS. CONFIRM TO DB
   this.user_password_confirm = undefined;

   next();
});


// SET THE user_password_changed_at PROPERTY
userSchema.pre('save', async function(next) {

   if(!(this.isModified('user_password') || this.isNew)) return next();
   
   // sometimes saving the user to the db is slower than issuing the JWT
   // thus, the pass_changed_at is sometimes persisted AFTER JWT is created
   // this will prevent user from loggin in
   // SOLUTION: set the changed_at prop. 2 seconds in the past..
   this.user_password_changed_at = Date.now() - 2000;

   next();
});


// INSTANCE MTD. => AVAIL. ON ALL DOCS. IN COLL.
userSchema.methods.comparePasswords = async function(candidatePassword, dbUserPassword) {
   // this.passord => not available because de-selected by default; so it must be passed as a param.
   return await bcrypt.compare(candidatePassword, dbUserPassword);
};


userSchema.methods.checkPasswordChanged = function(JWTCreatedTimestamp) {

   if (this.user_password_changed_at) {
      const changedTimestamp = +(this.user_password_changed_at.getTime() / 1000);
      console.log(this.user_password_changed_at, JWTCreatedTimestamp);
      return JWTCreatedTimestamp < changedTimestamp;
   };
   
   // user hasn't changed their password
   return false;
};


userSchema.methods.createPasswordResetToken = function() {
   // does not need to be as cryptographically strong as the jwt token
   
   // init the token
   const unEncryptedResetToken = crypto.randomBytes(32).toString('hex');
   console.log({unEncryptedResetToken}, this.user_password_reset_token)
   
   // encrypt the token => WARNING: this action does not save the data to the model
   this.user_password_reset_token = crypto.createHash('sha256').update(unEncryptedResetToken).digest('hex');

   // specify token expiry => WARNING: this action does not save the data to the model
   this.user_password_reset_expires = Date.now() + 30 * 60 * 1000; // 30 mins.

   // return plain text token; to be sent by email
   return unEncryptedResetToken;
}


const USER_MODEL = mongoose.model('users', userSchema);


module.exports = USER_MODEL;