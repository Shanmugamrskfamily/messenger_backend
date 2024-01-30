const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');

//User Routes
userRouter.get('/get-user',userController.getUser);
userRouter.post('/update-user',userController.editUser);

module.exports = userRouter;