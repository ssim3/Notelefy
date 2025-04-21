import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import { sendMessage } from "../controllers/lib/telegram.js";
import { createSubscriptionErrorInstruction, createSubscriptionInstruction } from "../strings.js";
import User from "../models/user.model.js";

const VALID_KEYS = ["name", "price", "currency", "frequency", "startdate"];
const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

const validateKeyValue = (key, value) => {
  switch (key) {
    case "name":
      return typeof value === "string" && value.trim().length > 0;
    case "price":
      return !isNaN(parseFloat(value)) && isFinite(value);
    case "currency":
      return typeof value === "string" && value.trim().length === 3;
    case "frequency":
      return VALID_FREQUENCIES.includes(value.toLowerCase());
    case "startdate":
      return isValidDateFormat(value);
    default:
      return false;
  }
};

const parseDetailLine = (line) => {

  if (!line.includes("-")) {
    throw new Error("Invalid format: missing separator '-'");
  }

  let [key, value] = line.split("-").map(part => part.trim());
  
  if (!VALID_KEYS.includes(key)) {
    throw new Error(`Invalid key: ${key}`);
  }

  if (!validateKeyValue(key, value)) {
    throw new Error(`Invalid value for ${key}: ${value}`);
  }

  if (key === "startdate") {
    const [year, month, day] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in 
    
    value = date;
  }

  return { key, value };
};

function isValidDateFormat(dateStr) {
  // Regex for YYYY/MM/DD
  const regex = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
  return regex.test(dateStr);
}

export const createSubscription = async (messageObj) => {

  const session = await mongoose.startSession();
  session.startTransaction();
  
  const { text } = messageObj;

  try {
    if (!text.includes("\n")) {
      throw new Error("Input must be multiline");
    }

    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length !== VALID_KEYS.length) {
      throw new Error(`Invalid number of details. Please separate each detail with a new line.`);
    }

    const subscriptionDetails = lines.reduce((details, line) => {
      const { key, value } = parseDetailLine(line);
      return { ...details, [key]: value };
    }, {});

    // Get the user associated with the message
    const user = await User.findOne({ telegramId: messageObj.from.id });
    if (!user) throw new Error(`User does not exist...Please register an account with "/start"`);

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

export const getUserSubscriptions = async (messageObj) => {

  // Get the user's mongoDB ID (Is this efficient? Im searching the DB twice)
  const user = await User.findOne({ telegramId: messageObj.from.id });
  const userId = user._id;

  // Get all subscriptions that belong to that user
  const subscriptions = await Subscription.find({ user: userId });

  if (!subscriptions || subscriptions.length === 0) {
    return "You don't have any logged subscriptions. Start creating some by using the /add command!";
  }

  let message = "";
  let totalCost = 0;

  subscriptions.forEach((subscription, index) => {
    const { name, price, currency, renewaldate } = subscription;

    // Format the details into a string
    const formattedDetails = `<b>${index + 1}. ${name}</b>\n--------------------------------------------------\nPrice - ${currency}${price}\nNext billing date - ${renewaldate.toLocaleDateString("en-US")}`;
    totalCost += price;

    message += formattedDetails + "\n\n";
  })

  message += `Total Upcoming Expenses: ${totalCost}`;
  
  return message;
}