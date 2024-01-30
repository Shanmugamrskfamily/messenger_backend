import jwt from 'jsonwebtoken'
import { createError } from '../utils/error.js'
import User from '../models/User.js';
import { config } from 'dotenv';

config();


// export const verifyToken = (req, res, next) =>{
//        const token = req.headers.token;
//       //const token = req.cookies.access_token
//     if(!token) return next(createError(401, "You are not authenticated."));
//     else{
//         jwt.verify(token, process.env.JWT,(err, user)=>{
//             if(err) return next(createError(403, "Token is not authorized."));
//             else{
//                 req.user = user;
//                 next();
//             }
//         });
//     }
// }


export const verifyToken = async (req, res, next) => {
    const token = req.header('token');
    
    if(!token) return next(createError(401, "You are not authenticated."));

    try {
        const decoded = jwt.verify(token, process.env.JWT);
        // console.log('decoded: ',decoded.id);
        const user = await User.findById(decoded.id);
        // console.log('user: ',user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
        return next(createError(403, "Token is not authorized."));
    }
};
