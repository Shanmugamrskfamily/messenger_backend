import express from 'express'
import { accessChat, addUser, createGroupChat, getChat, groupRenaming, removeUserFromGroup } from '../controller/chatController.js';



const router=express.Router();

//to create personal chat
router.route("/").post(accessChat);

//to get all my chats
router.route("/").get(getChat);

//to create a group chat
router.route("/group").post(createGroupChat);

router.route("/rename").put(groupRenaming)
router.route("/removeuser").put(removeUserFromGroup);
router.route("/groupadd").put(addUser);









export {router as ChatRouter}