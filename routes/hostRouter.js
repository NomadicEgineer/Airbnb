// core module
const path=require('path')
// external module
const express = require('express')
// main file path 
const mainPath=require('../util/mainPath')

const {upload} = require('../Cloud/multer')

const hostRouter = express.Router();

const {
  getAddHome,
  postAddHome,
  getHostHomeList,
  getEditHome,
  postEditHome,
  postDeleteHome
} = require('../controller/homes')

const reqFile =  
  upload.fields([
    {name:'image',maxcount:1},
    {name:'pdf',maxcount:1}
  ])

hostRouter.get('/add-home',getAddHome)

hostRouter.post('/add-home',reqFile,postAddHome)

hostRouter.get('/home-list',getHostHomeList)

hostRouter.get('/edit-Home/:homeId',getEditHome)
hostRouter.post('/edit-Home/',reqFile,postEditHome)

hostRouter.post('/delete-home/:homeId' , postDeleteHome)

exports.hostRouter=hostRouter;


