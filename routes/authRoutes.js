const express = require('express');
const authRouter = express.Router();
const userController = require('../controllers/userController');

// Authentication routes
authRouter.get('/', userController.check);
authRouter.post('/signup', userController.signup);
authRouter.post('/verify/:token', userController.emailVerify);
authRouter.post('/login', userController.login);
authRouter.post('/forgot-password', userController.forgotPasswordLink);
authRouter.get('/forgot-password-verify/:token', userController.forgotPasswordLinkVerify);
authRouter.post('/forgot-password-verify/:token', userController.resetPassword);

module.exports = authRouter;