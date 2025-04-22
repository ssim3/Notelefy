import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import { sendMessage } from "../controllers/lib/telegram.js";
import { createSubscriptionErrorInstruction } from "../strings.js";
import User from "../models/user.model.js";
import { parseDetailLine } from "./utils/validation.js";

// ------------------------------------------------------
// Function to create a new subscription
// /add
// ------------------------------------------------------
export const createSubscription = async (messageObj) => {

  const VALID_KEYS = ["name", "price", "currency", "frequency", "startdate"];

  const session = await mongoose.startSession();
  session.startTransaction();

  const { text } = messageObj;

  try {

    if (!text.includes("\n")) throw new Error("Input must be multiline");

    const lines = text.split("\n").filter(line => line.trim());

    if (lines.length !== VALID_KEYS.length) throw new Error(`Invalid number of details. Please separate each detail with a new line.`);

    const subscriptionDetails = lines.reduce((details, line) => {
      const { key, value } = parseDetailLine(line);
      return { ...details, [key]: value };
    }, {});

    // Get the user associated with the message
    const user = await getUserFromTelegramId(messageObj);
    const userId = user._id;

    const subscription = await Subscription.create({
      ...subscriptionDetails,
      user: userId
    });

    sendMessage(messageObj, "Subscription Successfully Created!");
    return true;

  } catch (error) {

    sendMessage(messageObj, error.message || createSubscriptionErrorInstruction);
    return false;

  } finally {
    session.endSession();
  }
};

// ------------------------------------------------------
// Functions to display a user's subscriptions
// /subscriptions 
// ------------------------------------------------------
export const listUserSubscriptionsDetails = async (messageObj) => {

  try {

    // Get all subscriptions that belong to that user
    const subscriptions = await getUserSubscriptions(messageObj);

    let message = "";
    let totalCost = 0;

    subscriptions.forEach((subscription, index) => {
      const { name, price, currency, renewaldate } = subscription;

      // Format the details into a string
      const formattedDetails = `<b>${index + 1}. ${name}</b>\n--------------------------------------------------\nPrice - ${currency}${price}\nNext billing date - ${renewaldate.toLocaleDateString("en-US")}`;
      totalCost += price;

      message += formattedDetails + "\n\n";
    });

    return message;

  } catch (error) {
    return error.message || createSubscriptionErrorInstruction;
  }
}

// ------------------------------------------------------
// Function to edit a subscription
// Step 2 of /edit
// ------------------------------------------------------
export const editSubscription = async (messageObj) => {

}

export const deleteSubscription = async (messageObj) => {

}

// ------------------------------------------------------
// ------------------------------------------------------
// Functions to be reused
// ------------------------------------------------------
// ------------------------------------------------------

export const selectSubscription = async (messageObj, subscriptions) => {

  // Get input from messageObj
  // If name is in subscriptions names, return the subscription ID
  // 

}

export const getUserSubscriptions = async (messageObj) => {

  const user = await getUserFromTelegramId(messageObj);
  const userId = user._id;

  // Get all subscriptions that belong to that user
  const subscriptions = await Subscription.find({ user: userId });

  if (!subscriptions || subscriptions.length === 0) throw new Error(`You don't have any logged subscriptions. Start creating some by using the "/add" command!`);

  return subscriptions;

}

const getUserFromTelegramId = async (messageObj) => {

    // Get the user's mongoDB ID (Is this efficient? Im searching the DB twice)
    const user = await User.findOne({ telegramId: messageObj.from.id });
    if (!user) throw new Error(`User does not exist...Please register an account with "/start"`);

    return user;

}