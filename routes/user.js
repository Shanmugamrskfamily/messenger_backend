import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { allUser, profileDetails,updateProfile, changePassword  } from '../controllers/userController.js'

const router = express.Router()

router.get('/', verifyToken, allUser)
router.get('/profile',verifyToken, profileDetails);
router.put('/update-profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router