const express= require('express')
const storeRouter = express.Router();

const {getBookings,
  getFavourites,
  getReserveList,
  getHomes,
  getHomeDetail,
  postFavourites,
  postDelFav,
  downloadRulesFile
} = require('../controller/store')

// main store page showing all homes
storeRouter.get('/homes',getHomes)

storeRouter.get('/bookings',getBookings)  
// storeRouter.post('/bookings/:homeId',postBookings)

// to get all favourite homes 
storeRouter.get('/favourite-list',getFavourites)

// to add home to favourite
storeRouter.post('/favourite-list/:homeId', postFavourites)

storeRouter.get('/reserve',getReserveList)

// to get home description 
storeRouter.get('/homes/:homesId' , getHomeDetail)


storeRouter.post('/delete-fav/:homeId' , postDelFav)

storeRouter.get('/rules/:filename', downloadRulesFile);

exports.storeRouter=storeRouter
