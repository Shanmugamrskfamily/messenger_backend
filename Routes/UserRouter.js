import express from 'express'
import {ActivateAccount, ForgotPassword, Register, ResetPassword, allUsers} from '../controller/userController.js'
import {Login} from '../controller/userController.js'
import { isAuthorized } from '../middleware/isAuthorised.js'


const router=express.Router();

//route for registering new user
router.route('/register').post(Register);

router.route('/activate/:token').get(ActivateAccount);

//route for login
router.route('/login').post(Login);

router.route('/alluser').get(isAuthorized,allUsers);

//route for generating password reset mail
router.route('/forgot-password').post(ForgotPassword);

//route for resetting new password
router.route('/reset-password/:token').post(ResetPassword);

export {router as UserRouter}