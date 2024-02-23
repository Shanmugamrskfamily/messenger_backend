# Messenger Web Application

Welcome to Messenger Web Application! This is a real-time messaging application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It allows users to send and receive messages in real-time, providing a seamless communication experience.

## Table of Contents

- [Description](#description)
- [Purpose](#purpose)
- [Features](#features)
- [Use Cases](#use-cases)
- [Technologies](#technologies)
- [Routes](#routes)
- [Deployment](#deployment)

## Description

Messenger Web Application is a modern messaging platform that facilitates real-time communication between users. It provides a user-friendly interface for sending and receiving messages, as well as features like user authentication, account activation, password reset, and more.

## Purpose

The purpose of Messenger Web Application is to offer a reliable and efficient messaging solution for individuals and organizations. Whether you want to stay connected with friends, family, or colleagues, or you need a secure messaging platform for business communication, Messenger Web Application caters to various use cases.

## Features

- User Authentication: Secure user authentication system using JWT tokens.
- Real-Time Messaging: Instant delivery of messages using Socket.IO for real-time communication.
- Account Activation: Users receive an activation link via email upon signup for account activation.
- Password Reset: Forgot your password? Reset it securely with the password reset functionality.
- Cross-Platform Compatibility: Access the application from any device with a web browser.
- Responsive Design: User-friendly interface optimized for desktop and mobile devices.

## Use Cases

- **Personal Messaging**: Stay connected with friends and family by exchanging messages in real-time.
- **Business Communication**: Use Messenger Web Application for secure and efficient communication within your organization.
- **Customer Support**: Provide real-time customer support to your clients through the messaging platform.
- **Group Collaboration**: Collaborate with team members on projects by sharing messages and updates in real-time.

## Technologies

- **Frontend**: React.js, Socket.IO-client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Deployment**: Render

## Routes

- **`/signup`**: Route for user signup.
- **`/activate/:activationtoken`**: Route for activating user accounts.
- **`/login`**: Route for user login.
- **`/forgot-password`**: Route for requesting password reset.
- **`/reset-password/:resetToken`**: Route for resetting user password.
- **`/user`**: User-related routes for managing user accounts.

For more details on routes and their functionalities, refer to the [`user.routes.js`](./backend/routes/user.routes.js) file.

## Deployment

This application is deployed on [Render](https://render.com/), a cloud platform for building and hosting web applications. You can access the deployed application at [Messenger Web Application](https://messenger-backend-nr0d.onrender.com/).
