import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import { sendMessage } from "../controllers/lib/telegram.js";
import { createSubscriptionErrorInstruction, formatSubscriptions } from "../strings.js";
import User from "../models/user.model.js";
import { parseDetailLine, validateIntegerInput } from "./utils/validation.js";

const VALID_KEYS = ["name", "price", "currency", "frequency", "renewaldate"];

// ------------------------------------------------------
// Function to create a new subscription
// /add
// ------------------------------------------------------
export const createSubscription = async (messageObj) => {

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

    subscriptions.forEach((subscription, index) => {    
      // Format the details into a string
      const formattedDetails = `<b>${index + 1}. </b>` + formatSubscriptions(subscription);    
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
export const editSubscription = async (messageObj, subscriptionId) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { text } = messageObj;

    const lines = text.split("\n").filter(line => line.trim());

    const subscriptionDetails = lines.reduce((details, line) => {
      const { key, value } = parseDetailLine(line);
      return { ...details, [key]: value };
    }, {});

    await Subscription.updateOne({ _id: subscriptionId }, { ...subscriptionDetails });
    sendMessage(messageObj, "Subscription successfully modified!");

    return true;

  } catch (error) {

    sendMessage(messageObj, error.message);
    return false;

  } finally {
    session.endSession();
  }
}

export const deleteSubscription = async (messageObj, subscriptionId) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { text } = messageObj;

    if (text.toLowerCase() !== "delete") {
      sendMessage(messageObj, "Subcription deletion cancelled.");
      return true;
    }

    await Subscription.deleteOne({ _id: subscriptionId });
    sendMessage(messageObj, "Subcription successfully deleted!");
    return true;

  } catch (error) {

    sendMessage(messageObj, error.message);
    return false;

  } finally {
    session.endSession();
  }
}

// ------------------------------------------------------
// ------------------------------------------------------
// Functions to be reused
// ------------------------------------------------------
// ------------------------------------------------------

export const selectSubscription = async (messageObj) => {

  const subscriptions = await getUserSubscriptions(messageObj);

  // Get input from messageObj
  // validate input,  return the subscription ID
  try {

    const input = messageObj.text; 

    // Validations
    if (!validateIntegerInput(input)) throw new Error(`Invalid selection! Please enter the number of the subscription you want to modify!`);
    if (parseFloat(input) <= 0 || parseFloat(input) > subscriptions.length) throw new Error(`Invalid selection! Please enter a number that YOU CAN ACTUALLY SEE!`);

    // Index the subscriptions and get the chosen subscriptions
    const selectedSubscription = subscriptions[parseFloat(input) - 1]

    // Send back to the user the subscription that they selected.
    const formattedDetails = formatSubscriptions(selectedSubscription);
    sendMessage(messageObj, `You selected:\n` + formattedDetails);

    return selectedSubscription._id;

  } catch (error) {
    sendMessage(messageObj, error.message || createSubscriptionErrorInstruction);
    return false;
  }

}

export const getUserSubscription = async (subscriptionId) => {

  // Get the subscription corresponding to that Id
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throw new Error(`Subscription does not exist!`);

  return subscription;

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