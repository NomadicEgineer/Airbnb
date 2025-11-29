
const {Home}= require('../model/homeModel')
const userModel = require('../model/userModel')
const fs = require('fs')
const rootDir = require('../util/mainPath');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const randomString = (length)=>{
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz';
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  } 
  return result;
}

// fetch all homes here 
exports.getHostHomeList=async (req,res,next)=>{
  const sessionUser=req.session.user;
   const getUser = await userModel.findById(sessionUser._id)
   const entireUser =await  getUser.populate('hostedHomes')
    res.render('host/host-home-list',{
      isLoggedIn:req.session.isLoggedIn,
      user:req.session.user,
      registeredHomes:entireUser.hostedHomes
    })
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

exports.postAddHome=async (req,res,next)=>{

  const {housename,location,price,description} = req.body;

  const obj = new Home({ 
    housename:housename,
    location:location,
    price:price,
    description:description
  })

  const userId=req.session.user._id

  if(req.files.pdf.length===0){
    return res.status(422).redirect('/host/home-list');  
  }else{

    const bucket='rulebook'
    const fileName = `${randomString(10)}-${req.files.pdf[0].originalname}`
    const path = `${userId}/${fileName}`

    await supabase.storage.from(bucket).upload(path, req.files.pdf[0].buffer, {
        contentType: req.files.pdf[0].mimetype,
        upsert: false
      });

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    obj.pdf=data.publicUrl

  }
  
  if(req.files.image.length===0){
    return res.status(422).redirect('/host/home-list');
  }else{
    
    const bucket='images'
    const fileName = `${randomString(10)}-${req.files.image[0].originalname}`
    const path = `${userId}/${fileName}`

    await supabase.storage.from(bucket).upload(path,req.files.image[0].buffer,{
        contentType: req.files.image[0].mimetype,
        upsert: false
    })

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    obj.image=data.publicUrl

  }

  const savedHome = await obj.save();
  const sessionUser = req.session.user._id;
  const getuser = await userModel.findById(sessionUser)

  if(getuser.hostedHomes.some(id => id.toString()===savedHome._id.toString())){
    res.redirect('/host/home-list')
  }else{
    getuser.hostedHomes.push(savedHome._id)
  }

  await getuser.save();
  res.redirect('/host/home-list')
  
}

exports.getEditHome=(req,res,next)=>{
    const id = req.params.homeId;
    console.log("dynamic home id : ", id)
    const editing = (req.query.editing === 'true') 

    Home.findById(id).then((arrHome)=>{
        if(arrHome){
        console.log(id,editing,arrHome)
        res.render('host/edit-home' ,{
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
exports.postEditHome=async (req,res)=>{

  const {homeId,housename,location,image,price,description} = req.body;
  console.log(req.body)


  const home = Home.findById(homeId)
      home.housename=housename;
      home.location=location;
      home.price=price;
      home.description=description;

      const imagePath =home.image
      const pdfPath = home.pdf

      await supabase.storage.from('images').upload(imagePath,req.files.image[0].buffer,{
              contentType: req.files.image[0].mimetype,
              upsert: true
      })

      await supabase.storage.from('rulebook').upload(pdfPath,req.files.pdf[0].buffer,{
              contentType: req.files.pdf[0].mimetype,
              upsert: true
      })

      const imageObj = supabase.storage.from('images').getPublicUrl(imagePath);
      home.image=imageObj.data.publicUrl

      const pdfObj = supabase.storage.from('rulebook').getPublicUrl(pdfPath);
      home.image=pdfObj.data.publicUrl

      home.save();
      res.redirect('/host/home-list')
  } 



// delete home 
exports.postDeleteHome = async (req, res, next) => {
  const homeId = req.params.homeId;
  const getHome = await Home.findById(homeId);

  const imagePath = getHome.image.split("/object/public/images/").pop();
  const pdfPath = getHome.pdf.split("/object/public/rulebook/").pop();

  const imageDelete = await supabase.storage.from("images").remove([imagePath])
  const pdfDelete = await supabase.storage.from("rulebook").remove([pdfPath])

  await getHome.deleteOne();
  res.redirect('/host/home-list');

};



