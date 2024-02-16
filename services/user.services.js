import { client } from "../index.js";
import { generateHashedPassword } from "../functions/user.routes.functions.js";

export async function getUserByEmail(newEmail) {
  return await client
    .db("Messenger")
    .collection("users")
    .findOne({ email: newEmail });
}

export async function addUserInCollection(data) {
  return await client.db("Messenger").collection("users").insertOne(data);
}

export async function getUserByObjectId(objId) {
  return await client.db("Messenger").collection("users").findOne({ _id: objId });
}

export async function saveActivationTokenInDB(data) {
  return await client.db("Messenger").collection("userTokens").insertOne(data);
}

export async function saveLoginTokenInDB(data) {
  return await client.db("Messenger").collection("userTokens").insertOne(data);
}


export async function getUserFromActivationToken(activationtoken) {
  // console.log("activ tokens is", activationtoken);
  return await client.db("Messenger").collection("userTokens").findOne({
    isExpired: false,
    type: "activation",
    token: activationtoken,
  });
}

export async function activateUserInDB(objId) {
  await client
    .db("Messenger")
    .collection("userTokens")
    .updateOne(
      { userId: objId, type: "activation", isExpired: false },
      { $set: { isExpired: true } }
    );
  return await client
    .db("Messenger")
    .collection("users")
    .updateOne({ _id: objId }, { $set: { isActivated: true } });
}


export async function updateUserPassword(userId, newPassword) {
  try {
    const hashedPassword = await generateHashedPassword(newPassword);
    const result = await client
      .db('Messenger')
      .collection('users')
      .updateOne({ _id: userId }, { $set: { password: hashedPassword } });

    return result.modifiedCount > 0;
  } catch (error) {
    throw error;
  }
}

export async function saveResetTokenInDB(data) {
  return await client.db("Messenger").collection("userTokens").insertOne(data);
}
