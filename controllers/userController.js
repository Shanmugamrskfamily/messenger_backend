//userController.js
const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { readFileSync } = require('fs');
const { join } = require('path');
const User = require('../models/userModel');

const generateVerificationToken = () => {
    return Math.random().toString(14).substring(2, 15) + Math.random().toString(14).substring(2, 15);
  };

  exports.check=async(req,res)=>{
    try {
        const msg='Your Server Is Running'
        res.status(200).json({message:msg})
    } catch (error) {
        res.status(500).json({message:'Server Down'});
    }
  }

  exports.signup=async(req,res)=>{
    const { firstName, lastName, email, password, profilePictureUrl } = req.body;
  
    try {
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email Already Registered.. Try with Login!' });
      }

      const verificationToken = generateVerificationToken();
  
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstName, lastName, email,
        password: hashedPassword,
        verificationToken,
        profilePictureUrl, 
      });
  
      await newUser.save();
  
      const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.E_MAIL,
          pass: process.env.E_PASS,
        },
      });
  
      const verificationLink = `http://localhost:4051/verify/${verificationToken}`;
  
      const mailOptions = {
        from: process.env.E_MAIL,
        to: email,
        subject: 'Messenger App-Verify Your Email',
        html: `<p>Please click the following link to verify your email: <a href="${verificationLink}"><button>Verify Email</button></a></p>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending verification email:', error.message);
          return res.status(500).json({ message: 'Server Error' });
        }
        console.log('Verification email sent:', info.response);
        res.json({ message: 'Signup successful. Check your email for verification.',verificationLink });
      });
    } catch (error) {
      console.error('Error signing up:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  exports.emailVerify=async(req,res)=>{
    const verificationToken = req.params.token;
    try {
        
        const user = await User.findOne({ verificationToken });
    
        if (!user) {
          throw new Error('User not found or already verified');
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();
    
        res.status(200).json({message: 'Email verification successful. You can now log in.' });
      } catch (error) {
        console.error('Error verifying email:', error.message);
        res.status(500).json({message: 'Error verifying email. Please try again.' });
      }
  }

  exports.login=async(req,res)=>{
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({email});
  
      if (!user) {
        return res.status(401).json({ message: 'Email not Registered! Please Signup..' });
      }
  
      if (!user.isEmailVerified) {
        return res.status(401).json({
          message: 'Email not verified. Please check your email for verification instructions.',
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid Password! Please check and Try Again.' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  
      res.json({
        userId: user._id,
        profilePictureUrl: user.profilePictureUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      });
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };
  
  
  const setResetToken = (user, token) => {
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
  };

exports.forgotPasswordLink=async(req,res)=>{
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const resetToken = generateResetToken();
      setResetToken(user, resetToken);
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.E_MAIL, 
          pass: process.env.E_PASS, 
        },
      });
  
      const resetLink = `http://localhost:4051/forgot-password-verify/${resetToken}`;
  
      const mailOptions = {
        from: process.env.E_MAIL,
        to: email,
        subject: 'Messenger App-Password Reset',
        html: `<p>You have requested a password reset. Click below button to reset your password: <a href="${resetLink}"><br/><button>Reset Password</button> </a></p>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending password reset email:', error.message);
          return res.status(500).json({ message: 'Server Error' });
        }
        console.log('Password reset email sent:', info.response);
        res.json({ message: 'Password reset email sent. Check your email for instructions.',resetLink });
      });
    } catch (error) {
      console.error('Error initiating password reset:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
}

exports.forgotPasswordLinkVerify=async(req,res)=>{
    const resetToken = req.params.token;
  
    try {
      const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      res.json({ message: 'Token verified successfully' });
    } catch (error) {
      console.error('Error verifying password reset token:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
}

exports.resetPassword=async(req,res)=>{
    const resetToken = req.params.token;
  const { newPassword } = req.body;

  try {
    
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.E_MAIL,
        pass: process.env.E_PASS,
      },
    });

    const emailTemplatePath = join(__dirname, 'email-template.html');
    const emailTemplate = readFileSync(emailTemplatePath, 'utf-8');

    const formattedEmail = emailTemplate.replace('{{firstName}}', user.firstName).replace('{{lastName}}',user.lastName).replace('{{newPassword}}', newPassword);

    const mailOptions = {
      from: process.env.E_MAIL,
      to: user.email,
      subject: 'Messenger App- Password Reset Successful',
      html: formattedEmail,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset success email:', error.message);
        return res.status(500).json({ message: 'Server Error' });
      }
      console.log('Password reset success email sent:', info.response);
      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
}


exports.getUser=async(req,res)=>{
    const userId = req.user.userId;
    try {
        const user=await User.findById(userId);
        if(!user){
            return res.status(401).send('Your Not Authoraized to Edit!');
        }
        res.status(200).json({firstName:user.firstName,lastName:user.lastName,email:user.email,profilePictureUrl:user.profilePictureUrl});
    } catch (error) {
        res.status(500).send('Server Error: ',error);
    }
}


exports.editUser=async(req,res)=>{
    const userId = req.user.userId;
    const {firstName,lastName, profilePictureUrl}=req.body;
    try {
        const user= await User.findById(userId);
        if(!user){
            return res.status(401).send('Your Not Authoraized to Edit!');
        }
        if(firstName){
            user.firstName=firstName;
        }
        if(lastName){
            user.lastName=lastName;
        }
        if(profilePictureUrl){
            user.profilePictureUrl=profilePictureUrl;
        }
        await user.save();
        res.status(200).json({message:'User Details updated!',firstName:user.firstName,lastName:user.lastName,email:user.email,profilePictureUrl:user.profilePictureUrl});
    } catch (error) {
        res.status(500).send('Server Problem',error);
    }
}