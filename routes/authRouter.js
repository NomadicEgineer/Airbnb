const express = require('express');
const authRouter = express.Router();

const {getLoginPage,postLoginPage, postLogout,getSignupPage,postSignUp} = require('../controller/authController');

// get login page 
authRouter.get('/login', getLoginPage);

// after login form submit
authRouter.post('/login', postLoginPage);

// after logut form submit
authRouter.post('/logout', postLogout)

// get signup page
authRouter.get('/signup', getSignupPage);

// post singup page
authRouter.post('/signup', postSignUp)

exports.authRouter = authRouter;