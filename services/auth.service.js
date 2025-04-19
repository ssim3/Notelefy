import mongoose from "mongoose"
import User from "../models/user.model.js";
import { startMessage } from "../strings.js";

export const signUp = async (messageObj) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { id, username, first_name } = messageObj.from;

    // Check if user exists
    const existingUser = await User.findOne({ telegramId: id });

    if (existingUser) {
      return `👋 Welcome Back to Subscriber @${username || first_name || ""}!\n` + startMessage;
    }

    // Create new user
    const newUsers = await User.create([{ telegramId: id, userName: username }], { session });
    await session.commitTransaction();

    return `Welcome to Subscriber @${newUsers[0].userName}!\n` + startMessage;

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }

}