const express = require('express');
const errorRouter  = express.Router();
const {err}=require('../controller/error')

errorRouter.use(err);

exports.errorRouter=errorRouter;