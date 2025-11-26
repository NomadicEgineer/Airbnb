
const {Home}= require('../model/homeModel')
const fs = require('fs')
const rootDir = require('../util/mainPath');


// fetch all homes here 
exports.getHostHomeList=(req,res,next)=>{
    Home.find().then((arrHome)=>{
      console.log("Host-home-list fetched !" , arrHome)
      res.render('host/host-home-list' , {registeredHomes:arrHome,isLoggedIn:req.isLoggedIn,user:req.session.user} )
    })
    .catch( err => console.log("error while fetching data " , err))
}

exports.getAddHome=(req,res,next)=>{
  res.render('host/edit-home',{
      pageTitle:"Add Home",
      currentPage:"Home",
      editing:false,
      isLoggedIn:req.isLoggedIn,
      user:req.session.user
    })
}

exports.postAddHome=(req,res,next)=>{
  const {housename,location,price,description} = req.body;

  const obj = new Home({ 
    housename:housename,
    location:location,
    // image:imagePath,
    // pdf:pdfPath,
    price:price,
    description:description
  })

  if(req.files.pdf.length===0){
    return res.status(422).redirect('/host/home-list');  
  }else{
    obj.pdf = req.files.pdf[0].path; // get the path of uploaded file
  }
  
  if(req.files.image.length===0){
    return res.status(422).redirect('/host/home-list');
  }else{
    obj.image = req.files.image[0].path; // get the path of uploaded file
  }

  obj.save().then(()=>{
    res.redirect('/host/home-list')
  }).catch( err => console.log("error while svaing is " , err));
}

exports.getEditHome=(req,res,next)=>{
    const id = req.params.homeId;
    console.log("dynamic home id : ", id)
    const editing = (req.query.editing === 'true') 

    Home.findById(id).then((arrHome)=>{
        if(arrHome){
        console.log(id,editing,arrHome)
        res.render('host/edit-home' ,{
        // home:home[0],
        home:arrHome,
        pageTitle:"Edit Home",
        currentPage:"Home",
        editing:editing ,
        isLoggedIn:req.session.isLoggedIn,
        user:req.session.user})
      }else{
        console.log("Home not found")
        res.redirect('/host/home-list') } } )
        .catch( err=> console.log("Error while editing ",err) )
}

// update the exsisting home 
exports.postEditHome=(req,res,next)=>{

  const {homeId,housename,location,image,price,description} = req.body;
  console.log(req.body)

  Home.findById(homeId).then((home)=>{ 
      home.housename=housename;
      home.location=location;
      home.price=price;
      home.description=description;

      const imagePath =home.image
      const pdfPath = home.pdf

      console.log("home path and pdf path : ", imagePath, pdfPath)

     if(req.files.image[0] && req.files.pdf[0]){
          fs.unlink(imagePath,(err)=>{
            if(err)  console.log(err)
          })
          fs.unlink(pdfPath,(err)=>{
              if(err)  console.log(err)
            })
        home.image=req.files.image[0].path;
        home.pdf=req.files.pdf[0].path;
     }

      home.save();
      res.redirect('/host/home-list')
  } ).catch( err => console.log("error while updating is " , err));
}

// delete home 
exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("inside delete method", homeId);
  Home.findByIdAndDelete(homeId).then(() => {
    console.log("Home Deleted");
    res.redirect('/host/home-list');
  }).catch(err => console.log("Error while deleting home:", err));

  res.redirect('/host/home-list');
};



