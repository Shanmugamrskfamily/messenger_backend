import express from 'express'
import { allMessage, sendMessage } from '../controller/messageController.js';

const router=express.Router();

//send the message
router.route("/").post(sendMessage);

//get all messages

router.route("/:chatId").get(allMessage);



export {router as MessageRoute}