
import bcrypt from 'bcrypt';
import { User } from '../model/userModel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config();



// Function to send verification email
const sendVerificationEmail = async (user) => {
    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Replace placeholders in the email template with actual data
    const emailContent =`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Account Activation</title>
      </head>
      <body>
        <div style="background-color: #f4f4f4; padding: 20px">
          <h2 style="color: #333; font-family: Arial, sans-serif">
            Account Activation
          </h2>
          <p style="color: #666; font-family: Arial, sans-serif">Hello ${user.name},</p>
          <p style="color: #666; font-family: Arial, sans-serif">
            Thank you for registering with RSK Messenger APP. Please click the link
            below to activate your account:
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            <a
              href="https://rsk-messenger-web-application.netlify.app/activate/${verificationToken}"
              style="color: #007bff; text-decoration: none"
              >Activate Account</a
            >
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            If you didn't register on our website, you can ignore this email.
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            Best regards,<br />RSK Messenger Team
          </p>
        </div>
      </body>
    </html>
    `

    // Setup email data with unicode symbols
    let mailOptions = {
        from: process.env.EMAIL, // sender address
        to: user.email, // list of receivers
        subject: 'Account Activation', // Subject line
        html: emailContent // html body
    };

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
};

// Function to handle new user registration
export const Register = async (req, res) => {
    try {
        // Check if this user already exists
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).send('That user already exists!');
        }

        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await new User({ ...req.body, password: hashedPassword }).save();

        // Send verification email
        await sendVerificationEmail(newUser);

        res.status(201).json({
            status: 'success',
            message: 'New user created. Verification email sent.'
        });
    } catch (err) {
        console.log("Error in creating new user", err);
        res.status(500).send("Internal Error");
    }
};



//function to activate the account
export const ActivateAccount = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        // Mark user's email as verified
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({ message: "Account activated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



//function to handle the Login process

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: "Email is not registered" });
        }

        // Check if the user's email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({ message: "Email is not verified" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const jwttoken = jwt.sign({ id: user._id }, process.env.JSON_TOKEN_SECRET_KEY);

        res.status(200).json({ jwttoken, user: user._id, message: "Login success" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
}



// Function to send reset password email
const sendResetPasswordEmail = async (user) => {
    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });


    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Replace placeholders in the email template with actual data
    const emailContent =`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RSK Messenger App-Reset Your Password</title>
      </head>
      <body>
        <div style="background-color: #f4f4f4; padding: 20px">
          <h2 style="color: #333; font-family: Arial, sans-serif">
            Reset Your Password
          </h2>
          <p style="color: #666; font-family: Arial, sans-serif">Hello ${user.name},</p>
          <p style="color: #666; font-family: Arial, sans-serif">
            You have requested to reset your password. Please click the link below
            to reset your password:
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            <a
              href="https://rsk-messenger-web-application.netlify.app/reset-password/${resetToken}"
              style="color: #007bff; text-decoration: none"
              >Reset Password</a
            >
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            If you didn't request a password reset, you can ignore this email.
          </p>
          <p style="color: #666; font-family: Arial, sans-serif">
            Best regards,<br />RSK Messenger Team
          </p>
        </div>
      </body>
    </html>`
    

    // Setup email data with unicode symbols
    let mailOptions = {
        from: process.env.EMAIL, // sender address
        to: user.email, // list of receivers
        subject: 'Reset Your Password', // Subject line
        html: emailContent // html body
    };

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
};

// Forgot password controller
export const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Email is not registered" });
        }

        // Send reset password email
        await sendResetPasswordEmail(user);

        res.status(200).json({ message: "Reset password email sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const ResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        // Update user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

    

    export const allUsers = async (req, res) => {
        const keyword = req.query.search
          ? {
              $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
              ],
            }
          : {};
          try {
            const users = await User.find({
                ...keyword,
                _id: { $ne: req.user._id } 
            }).select('-password');
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send({ message: "Internal server error" });
        }
        
      };