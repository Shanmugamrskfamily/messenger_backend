import bcrypt from 'bcryptjs'
import { createError } from "../utils/error.js"
import User from "../models/User.js"

export const allUser = async (req, res, next) => {
    try {
        let users;
        const searchText = req.query.search;
        
        if (searchText) {
            users = await User.find({
                $or: [
                    { firstname: { $regex: searchText, $options: 'i' } },
                    { email: { $regex: searchText, $options: 'i' } },
                    { lastname: { $regex: searchText, $options: 'i' } }
                ]
            }, { password: 0, createdAt: 0, updatedAt: 0 });
            console.log('Users on seacrch');
        } else {
            console.log('All Users');
            users = await User.find({}, { password: 0, createdAt: 0, updatedAt: 0 });
        }

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404).send('No users found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



export const profileDetails = async (req, res, next) => {
    try {
        const userProfile = await User.findById(req.user.id,{ _id:0,password:0,createdAt:0,updatedAt:0});
        res.status(200).json({ data: userProfile });
    } catch (err) {
        next(err);
    }
}



export const updateProfile = async (req, res, next) => {
    try {
        
        if (req.body.password) {
            return res.status(400).json({ error: "Changing password is not allowed through this endpoint" });
        }

        const updateProfile = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true, select: '-password -tokens -createdAt -updatedAt' }
        );
        
        if (!updateProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { _id, ...profileDetails } = updateProfile.toObject();

        res.status(200).json({ data: profileDetails });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



export const changePassword = async (req, res, next) => {
    try {
        if (req.body.newPassword.length < 6 && req.body.newPassword.length > 12)
            return next(createError(401, "Password must be 6 to 12 characters."));
        else {
            const user = await User.findById(req.user.id);
            // console.log('Found User: ', user)
            const isPasswordCorrect = await bcrypt.compare(req.body.oldPassword, user.password);
            if (!isPasswordCorrect) return next(createError(400, "Wrong password!"))
            else {
                user.password = req.body.newPassword;
                await user.save();
                res.status(200).send("Password change successful.");
            }
        }
    } catch (err) {
        res.status(500).json({Error: err.message});
        console.log('Error on Server: ',err);
        next(err);
    }
}