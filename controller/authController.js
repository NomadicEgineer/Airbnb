const { check, validationResult } = require('express-validator');
const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const{hash}=require('bcryptjs');
const userModel = require('../model/userModel');



exports.getLoginPage = (req, res, next) => {
  res.render('auth/login', { pageTitle: 'Login', isLoggedIn: false, user:{} });
}

exports.postLoginPage=async (req,res)=>{
    const {email,password}=req.body;
    const user = await userModel.findOne({email:email});
    
    // step1 : check if user exists
    if(!user){
      return res.status(422).render('auth/login',{
        pageTitle:'Login',
        isLoggedIn:false,
        errorMessages:['Invalid email or password'],
        oldInput:{ email: email, password: password },
        user:{}
      });
    }

    // step 2: compare password 
    const isMatch = await bcrypt.compare(password,user.password)   // returns true/false
    if(!isMatch){  
      return res.status(422).render('auth/login',{
        pageTitle:'Login',
        isLoggedIn:false,
        errorMessages:['Invalid Password'],
        oldInput:{ email: email, password: password },
        user:{}
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = user; 
    // res.cookie('isLoggedIn', true);
    // req.isLoggedIn = true;
    res.redirect('/store/homes');

    // if(user.userType==='host'){
    //   res.redirect('/host/home');
    // }else{
    //   res.redirect('/homes');
    // }
}

exports.postLogout=(req,res)=>{
    req.session.destroy(()=>{
      res.redirect('/login');
    });
}


exports.getSignupPage = (req, res, next) => {
  res.render('auth/signup', { pageTitle: 'Signup', isLoggedIn: false, user:{} });
}

exports.postSignUp=[
  
  check('name')
  .notEmpty()
  .withMessage('Name cannot be empty')
  .trim()
  .isLength({min:2})
  .withMessage('Name should be at least 2 characters long')
  .matches(/^[A-Za-z\s]+$/)
  .withMessage('Name should contain only alphabets and spaces'), 
  
  check('email')
  .trim()
  .notEmpty()
  .withMessage('Email cannot be empty')
  .normalizeEmail(),
   
  check('password')
  .trim()
  .notEmpty()
  .withMessage('Password cannot be empty')
  .isLength({min:8})
  .withMessage('Password should be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password should contain at least one uppercase letter') 
  .matches(/[a-z]/)
  .withMessage('Password should contain at least one lowercase letter') 
  .matches(/[0-9]/)
  .withMessage('Password should contain at least one digit')
  .matches(/[\W_]/)
  .withMessage('Password should contain at least one special character'),

  check('confirmPassword')
  .trim()
  .notEmpty()
  .withMessage('Confirm Password cannot be empty')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm Password does not match Password');
    } 
    return true
  }),

  check('userType')
  .notEmpty()
  .withMessage('User Type cannot be empty')
  .isIn(['host', 'guest'])
  .withMessage('User Type must be either host or guest'),
  
  check('terms')
  .custom((value, { req }) => {
    if (value!=='on') {
      throw new Error('You must accept the terms and conditions');
    }
    return true;
  }), 
  
 
  (req,res)=>{ 
    const body = req.body;
    console.log("Signup form data: ", body);

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).render('auth/signup',{
        pageTitle:'Signup',
        isLoggedIn:false, 
        errorMessages: errors.array().map(err=>err.msg),
        oldInput: {
          name: body.name,
          email: body.email,
          userType: body.userType,
          password: body.password,
          confirmPassword: body.confirmPassword,
          terms: body.terms
        },
        user:{}
    })
  }

  bcrypt.hash(body.password,12).then((hashedPassword)=>{
        // creating new user
    const newUser = new User({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      userType: body.userType
    });
    newUser.save()
    })
    .then(()=>{
      console.log("User registered successfully")
      res.redirect('/login');
    })
    .catch(err=>{console.log(err)});
  }
]