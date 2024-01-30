const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

module.exports = ({ port }) => {
 
router.get('/', (req, res) => {
    res.send(`This is Basic Application created with NodeJS, ExpressJs, Mongoose \n\n The Server is Running On http://localhost:${port}`);
});  
//User Routes
router.post('/signup', userController.signup);
router.post('/verify/:token', userController.emailVerify);
router.post('/login', userController.login);
router.post('/forgot-password-link', userController.forgotPasswordLink);
router.post('/forgot-password-verify/:token', userController.forgotPasswordLinkVerify);
router.post('/reset-password/:token', userController.resetPassword);

return router;
};
