import express, { response } from "express";
import * as bcrypt from "bcrypt";
import {
  activateUserInDB,
  addUserInCollection,
  getUserByEmail,
  getUserByObjectId,
  getUserFromActivationToken,
  saveActivationTokenInDB,
  saveLoginTokenInDB,
  updateUserPassword
} from "../services/user.services.js";
import {
  checkValidSignupData,
  generateHashedPassword,
  generateJWToken,
  mailActivationLink,
  sendResetMail,
} from "../functions/user.routes.functions.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();
router.use(express.json());

router.post("/signup", async (request, response) => {
  try {
    const data = request.body;
    const user = await getUserByEmail(data.email);
    // console.log("user exit is", user);
    if (user) {
      response
        .status(409)
        .send({ message: "User Already Exist on this Email, try login" });
    } else {
      if (checkValidSignupData(data)) {
        const formattedSignupData = {
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          password: await generateHashedPassword(data.password),
          createdAt: Date.now(),
          isActivated: false,
          isOnline: false,
          lastSeen: Date.now(),
          image: data.image ? data.image : null,
        };

        const addRes = await addUserInCollection(formattedSignupData);
        // console.log("add User Coll Response", addRes);
        if (addRes.insertedId) {
          const addedUser = await getUserByObjectId(addRes.insertedId);
          const activationToken = await generateJWToken(addedUser);
          const saveTokenResult = await saveActivationTokenInDB({
            userId: addedUser._id,
            createdAt: Date.now(),
            type:'activation',
            token: activationToken,
            isExpired: false,
          });

          if (saveTokenResult.insertedId) {
            await mailActivationLink(addedUser, activationToken);
          } else {
            response.status(500).send({ message: "Token Issue" });
          }
          response.send({
            message:
              "User Added, Please use the Activation Link mailed to you for Activation your Login",
          });
        }
      } else {
        response.status(400).send({ message: "Invalid Signup Data" });
      }
    }
  } catch (error) {
    console.log("ERROR CAUGHT in SIGNUP", error);
  }
});

router.post("/activate/:activationtoken", async function (request, response) {
  try {
    const { activationtoken } = request.params;
    // console.log("token", activationtoken);
    const userTokened = await getUserFromActivationToken(activationtoken);
    if (userTokened) {
      const userFromDB = await getUserByObjectId(userTokened.userId);
      if (userFromDB.isActivated === true) {
        response.status(401).send({
          message: "Already Activated User",
        });
      } else {
        const updatedResponse = await activateUserInDB(userFromDB._id);
        // console.log("update respo", updatedResponse);
        if (updatedResponse.modifiedCount > 0) {
          response.status(200).send({
            message: "User Activated",
          });
        } else {
          response.status(500).send({
            message: "User NOT Activated",
          });
        }
      }
    } else {
      response.status(400).send({ message: "token not valid" });
    }
  } catch (err) {
    console.log("ERROR in ACTIVATION", err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const loginData = req.body;
    const userFromDB = await getUserByEmail(loginData.email);
    if (userFromDB) {
      const isPasswordMatch = await bcrypt.compare(
        loginData.password,
        userFromDB.password
      );
      if (isPasswordMatch) {
        if (userFromDB.isActivated === true) {
          const loginToken = await generateJWToken(userFromDB);
          const saveLoginTokenRes = await saveLoginTokenInDB({
            userId: userFromDB._id,
            type: "login",
            createdAt: Date.now(),
            token: loginToken,
            isExpired: false,
          });

          if (saveLoginTokenRes.insertedId) {
            res.status(200).send({
              message: "Login Successfull",
              payload: { token: loginToken, email: userFromDB.email },
            });
          } else {
            res.status(500).send({ message: "Token Issue" });
          }
        } else {
          res
            .status(400)
            .send({ message: "Inactive User, Please Activate your Login " });
        }
      } else {
        res.status(400).send({ message: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.log("ERROR CAUGHT in LOGIN", err);
  }
});


router.post('/forgot-password',async(req,res)=>{
  try {
    
    const {email}=req.body;
  if(!email){
    res.status(500).send({message:'Inavlid Input!'});
    return;
  }
  const user=await getUserByEmail(email);
  if(!user){
    res.status(400).send({message:'User Not found!'});
    return;
  }
  const resetToken = await generateJWToken(user);
  const saveResetToken = await saveLoginTokenInDB({
    userId: user._id,
    createdAt: Date.now(),
    type:'resetPassword',
    token: resetToken,
    isExpired: false,
  });

  if(saveResetToken.insertedId){
    const userResetInfo = { ...user, resetToken: resetToken };
    await sendResetMail(userResetInfo).catch((err) => console.log(err));
    res.status(200).send({
      message: "Reset Password link has been sent to your email",
    });
  } 
  else {
  res.status(400).send({ message: "User NOT Exist" });
}
}
catch (err) {
res.status(500).send({ message: err.message });
}
});

router.get('/reset-password/:resetToken',async(req,res)=>{
  try {
    const resetToken=req.params.resetToken;

    console.log(resetToken);

    if(!resetToken){
      res.status(409).send({message:'Reset Token Not Found'})
      return;
    }
    const user=await getUserFromActivationToken(resetToken);
    console.log(user);
    if(!user){
      res.status(404).send({message:'Invalid Token!'})
      return;
    }
    res.status(200).send({message:'User Verified!'});
  } catch (error) {
    console.log(error);
    res.status(500).send({message:error.message});
  }
});

router.put('/change-password/:resetToken', async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const userTokened = await getUserFromActivationToken(resetToken);
    if (userTokened) {
      const updatedUser = await updateUserPassword(userTokened.userId, password);

      if (updatedUser) {
        res.status(200).send({ message: 'Password reset successful' });
      } else {
        res.status(500).send({ message: 'Unable to reset password' });
      }
    } else {
      res.status(400).send({ message: 'Invalid or expired reset token' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


export default router;
