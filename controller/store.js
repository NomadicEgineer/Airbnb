
const {Home}=require('../model/homeModel')

const userModel = require('../model/userModel');

const path = require('path');
const rootDir = require('../util/mainPath');
const fs = require('fs');




// home detail page
exports.getHomeDetail=(req,res,next)=>{
  const homeId = req.params.homesId;
  console.log(homeId);

  Home.findById(homeId).then((rows)=>{
    console.log("rows : ", rows);
    const home=rows;
    console.log("home obj : ", home)
    if(!home){
      console.log("Home not found")
      res.status(302).redirect('/store/homes')
    }else{
      res.render('store/home-detail',{Home:home,isLoggedIn:req.isLoggedIn,user:req.session.user})
    }
  }).catch( err => console.log(err) )
}


// fetch all homes 
exports.getHomes = (req,res,next)=>{
  // return a array of objects
  Home.find().then((rows)=>{
    console.log("isLogged in " , req.isLoggedIn)
      res.render('store/home-List' , {registeredHomes:rows, isLoggedIn:req.isLoggedIn,user:req.session.user} )
  })
  .catch( err => console.log("error while fetching data " , err))
}



exports.getBookings = (req,res,next)=>{
  Favourite.getFavourites((favArr)=>{
          res.render('store/booking',{FavHomeArr:favArr,isLoggedIn:req.isLoggedIn,user:req.session.user})
  })
}


exports.postBookings = (req,res,next)=>{
    
}


// get all the s home 
exports.getFavourites = async (req, res, next) => {

    const getuser = req.session.user;

    const userFavDocsArr = await userModel.findById(getuser._id).populate('favourites');
    console.log("user fav docs arr :", userFavDocsArr);

      res.render("store/favourites", {
        FavArray: userFavDocsArr.favourites,
        pageTitle: "Favourites",
        isLoggedIn:req.isLoggedIn,
        user:req.session.user
       } ) 
}


// add home to favourites
exports.postFavourites = async (req, res, next) => {
  try {
    const favouriteHomeId = req.params.homeId;
    console.log("favourite home id :", favouriteHomeId);

    const sessionUser = req.session.user;
    const user=await userModel.findById(sessionUser._id);

    if(!user.favourites.includes(favouriteHomeId)){
         user.favourites.push(favouriteHomeId);
         await user.save();
      }

    res.redirect("/store/favourite-list");
  } catch (err) {
    console.log(err);
    next(err);
  }
};


exports.getReserveList = (req,res,next)=>{
  res.render('store/reserve',{isLoggedIn:req.isLoggedIn,user:req.session.user})
}


// delete fav home
exports.postDelFav=async (req,res)=>{
  console.log("home id before deleting is : ", req.params.homeId)
  const homeId= req.params.homeId;

  const sessionUser = req.session.user;
  const user=await userModel.findById(sessionUser._id);

  if(user.favourites.includes(homeId)){
    user.favourites = user.favourites.filter(favId => favId.toString() !== homeId.toString());
    await user.save();
  }

  // when ever we get the homeid from req it is in string format
  // but the mongoose db object ids are not in string format so we need to convert them to string format using toString() method

    res.redirect('/store/favourite-list')
}


exports.downloadRulesFile=async (req,res)=>{
    const getHome =await Home.findById(req.params.filename)
    console.log("user login value " , req.session.isLoggedIn)

    if(!req.session.isLoggedIn){ 
       return res.status(403).redirect('/login');
    }
    const housePath = path.join(rootDir, getHome.pdf);
    res.download(housePath);
}
