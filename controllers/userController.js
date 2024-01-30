const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const { readFileSync } = require('fs');
const { join } = require('path');
const User = require('../models/userModel');

const generateVerificationToken = () => {
    return Math.random().toString(14).substring(2, 15) + Math.random().toString(14).substring(2, 15);
  };

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
  
      // Save the user to the database
      await newUser.save();
  
      // Send verification email
      const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.E_MAIL,
          pass: process.env.E_PASS,
        },
      });
  
      const verificationLink = `http://localhost:4050/verify/${verificationToken}`;
  
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
    
        return { success: true, message: 'Email verification successful. You can now log in.' };
      } catch (error) {
        console.error('Error verifying email:', error.message);
        return { success: false, message: 'Error verifying email. Please try again.' };
      }
  }

  exports.login=async(req,res)=>{
    const { email, password } = req.body;
  
    try {
      // Check if the user exists by email or username
      const user = await User.findOne({email});
  
      if (!user) {
        return res.status(401).json({ message: 'Email not Registered! Please Signup..' });
      }
  
      // Check if the email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({
          message: 'Email not verified. Please check your email for verification instructions.',
        });
      }
  
      // Compare passwords
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid Password! Please check and Try Again.' });
      }
  
      // Generate a JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Send additional user information in the response
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
  
      const resetLink = `http://localhost:4050/forgot-password-verify/${resetToken}`;
  
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
    // Find the user with the provided reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update the user's password and reset token fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user document
    await user.save();

    // Send a professional-looking email
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.E_MAIL,
        pass: process.env.E_PASS,
      },
    });

    
    const emailTemplatePath = join(__dirname, 'email-template.html');
    const emailTemplate = readFileSync(emailTemplatePath, 'utf-8');

    
    const formattedEmail = emailTemplate.replace('{{username}}', user.firstName).replace('{{newPassword}}', newPassword);

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