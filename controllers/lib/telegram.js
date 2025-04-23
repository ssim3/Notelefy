import { signUp } from "../../services/auth.service.js";
import { createSubscription, deleteSubscription, editSubscription, listUserSubscriptionsDetails, selectSubscription } from "../../services/subscription.service.js";
import { createSubscriptionInstruction, deleteSubscriptionInstructionStepOne, deleteSubscriptionInstructionStepTwo, editSubscriptionInstructionStepOne, editSubscriptionInstructionStepTwo, startMessage, underfinedMessage } from "../../strings.js";
import { getAxiosInstance } from "./axios.js"

const userStates = {};

export const sendMessage = (messageObj, messageText) => {

  return getAxiosInstance().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
    parse_mode: "HTML"
  })

}

export const handleMessage = async (messageObj) => {

  const chatId = messageObj.chat.id;
  const messageText = messageObj.text || "";

  // Handles command
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    handleCommand(chatId, command, messageObj);
    return;
  }

  handleState(chatId, messageObj);

}

const handleCommand = async (chatId, command, messageObj) => {
  // When a user starts a command, the userStates will clear up.
  userStates[chatId] = {};

  switch (command) {
    case "start":
      userStates[chatId]["state"] = "start";
      userStates[chatId]["step"] = "0";
      const commandMessage = await signUp(messageObj);
      return sendMessage(
        messageObj,
        commandMessage
      )

    case "subscriptions":
      userStates[chatId]["state"] = "subscriptions";
      userStates[chatId]["step"] = "0";
      const listOfSubscriptionsDetails = await listUserSubscriptionsDetails(messageObj);
      return sendMessage(
        messageObj,
        listOfSubscriptionsDetails
      );

    case "add":
      userStates[chatId]["state"] = "add";
      userStates[chatId]["step"] = "0";
      return sendMessage(
        messageObj,
        createSubscriptionInstruction
      )

    case "edit":
      userStates[chatId]["state"] = "edit";
      userStates[chatId]["step"] = "0";
      const listOfSubscriptionsToEdit = editSubscriptionInstructionStepOne + (await listUserSubscriptionsDetails(messageObj));
      return sendMessage(
        messageObj,
        listOfSubscriptionsToEdit
      )

    case "delete":
      userStates[chatId]["state"] = "delete";
      userStates[chatId]["step"] = "0";
      const listOfSubscriptionsToDelete = deleteSubscriptionInstructionStepOne + (await listUserSubscriptionsDetails(messageObj));
      return sendMessage(
        messageObj,
        listOfSubscriptionsToDelete
      )

    default:
      return sendMessage(
        messageObj,
        "Hi, I don't recognize that command!"
      )
  }
}

const handleState = async (chatId, messageObj) => {

  if (!(chatId in userStates)) return sendMessage(messageObj, underfinedMessage);
  if (!("state" in userStates[chatId])) return sendMessage(messageObj, underfinedMessage);

  // For follow up steps
  switch (userStates[chatId]["state"]) {

    case "add":
      const isCreated = await createSubscription(messageObj, userStates);
      if (isCreated) userStates[chatId] = {};
      break;

    case "edit":

      if (userStates[chatId]["step"] === "0") {
        const subscriptionId = await selectSubscription(messageObj);
        if (subscriptionId) {
          sendMessage(messageObj, editSubscriptionInstructionStepTwo);
          userStates[chatId]["step"] = "1";
          userStates[chatId]["selectedSubscription"] = subscriptionId;
        }
      }

      else if (userStates[chatId]["step"] === "1") {
        const isEdited =  await editSubscription(messageObj, userStates[chatId]["selectedSubscription"]);
        if (isEdited) userStates[chatId] = {};
      }

      break;

    case "delete":

      if (userStates[chatId]["step"] === "0") {
        const subscriptionId = await selectSubscription(messageObj);
        if (subscriptionId) {
          sendMessage(messageObj, deleteSubscriptionInstructionStepTwo);
          userStates[chatId]["step"] = "1";
          userStates[chatId]["selectedSubscription"] = subscriptionId;
        }
      }

      else if (userStates[chatId]["step"] === "1") {
        userStates[chatId] = {};
      }

      break;
      
    default:
      return sendMessage(messageObj, underfinedMessage);
  }
}