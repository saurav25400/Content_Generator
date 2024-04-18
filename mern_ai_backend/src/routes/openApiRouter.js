const express=require('express');
const {openApiController}=require('../controllers/openApiController.js')
const isAutenticated=require('../middlewares/authentication.js');
const checkApiRequestLimit=require('../middlewares/checkApiRequetLimit.js')
const openApiRouter=express.Router();

openApiRouter.post("/content-generate",isAutenticated,checkApiRequestLimit,openApiController);

module.exports =openApiRouter;



