// core module
const path=require('path')
// external module
const express = require('express')
// main file path 
const mainPath=require('../util/mainPath')

const hostRouter = express.Router();

const {
  getAddHome,
  postAddHome,
  getHostHomeList,
  getEditHome,
  postEditHome,
  postDeleteHome
} = require('../controller/homes')

hostRouter.get('/add-home',getAddHome)
hostRouter.post('/add-home',postAddHome)
hostRouter.get('/home-list',getHostHomeList)

hostRouter.get('/edit-Home/:homeId',getEditHome)
hostRouter.post('/edit-Home/',postEditHome)

hostRouter.post('/delete-home/:homeId' , postDeleteHome)

exports.hostRouter=hostRouter;


