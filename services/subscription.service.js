import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import { sendMessage } from "../controllers/lib/telegram.js";
import { createSubscriptionInstruction } from "../strings.js";

export const createSubscription = async (messageObj) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // Send initial message
    sendMessage(messageObj, createSubscriptionInstruction);

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {

    session.endSession();

  }
}