// core module
const path=require('path')

// his loads all variables from .env into process.env.
require('dotenv').config();

// external module
const express = require('express')
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
// connection string 
const url= process.env.url ;


const store = new MongoStore({
  uri: url,
  collection: 'sessions'
 });
// routes 

const {authRouter}=require('./routes/authRouter');
const {hostRouter}=require('./routes/hostRouter');
const {errorRouter} = require('./routes/error')
const {storeRouter} = require('./routes/store')

const { default : mongoose } = require('mongoose')

const app = express();
// set the engine template as ejs
app.set('view engine' , 'ejs');

// make static file accessible
app.use(express.static(path.join(__dirname,'public')))

// make upload folder staticly accessible
app.use("/uploads",express.static(path.join(__dirname,'uploads')))
app.use('/host/uploads',express.static(path.join(__dirname,'uploads')))
app.use('/homes/uploads',express.static(path.join(__dirname,'uploads')))

// session created 
app.use(session({
  secret: process.env.secret, // secret key to access the session ID cookie
  resave: false,   // if session not modified, don't save again
  saveUninitialized: true,   // create session even if there is nothing initailized
  store: store  // session store instance
}));


app.use(express.urlencoded());

app.use((req,res,next)=>{
  //  console.log("Cookie " , req.get('Cookie').split('=')[1]);
   const isLoggedIn =req.session.isLoggedIn || false;
    req.isLoggedIn = isLoggedIn;
   next();
});

// check auth of user
app.use(authRouter);

console.log("after the authRoutes")


// middleware to protect host routes
app.use('/host',(req,res,next)=>{
  if(req.session.isLoggedIn && req.session.user.userType==='host'){
    next();
  }else{
    res.redirect('/login');
  }
})
app.use('/host',hostRouter);


app.use('/store',(req,res,next)=>{
  if(req.session.isLoggedIn && req.session.user.userType==='guest'){
      next();
  }else{
    res.redirect('/login')
  }
})
app.use('/store',storeRouter)

// invalid path handling
app.use(errorRouter);

const PORT = process.env.PORT;


mongoose.connect(url).then(()=>{
    console.log("Mongoose connected")
    app.listen(PORT,()=>{
      console.log(`Server at http://localhost:3000`);
    })
}).catch((err)=>{
  console.log(err)
})
