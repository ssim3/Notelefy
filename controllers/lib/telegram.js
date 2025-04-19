import { signUp } from "../../services/auth.service.js";
import { createSubscription } from "../../services/subscription.service.js";
import { createSubscriptionInstruction } from "../../strings.js";
import { getAxiosInstance } from "./axios.js"

// userState 
// chatId: xxx
//   states: start, add, edit 
//
//
//
//

// Add basically has 1 step, After the /add command, step 0: Enter Subscription Details 
// Edit has 2 steps. After the /edit command, step 0: Enter Subscription Name to edit, step 1: Edit the fields to edit
// Delete has 1 step, After the /

const userStates = {};

export const sendMessage = (messageObj, messageText) => {

  return getAxiosInstance().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
    parse_mode: "HTML"
  })

}

export const handleMessage = async (messageObj) => {

  if (messageObj.edited_message) {
    console.log("Edit message...");
    return;
  }

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

const handleState = async (chatId, messageObj) => {

    // For follow up steps
    switch (userStates[chatId]) {
      case "add":
        await createSubscription(messageObj);
        break;
      case "edit":
        break;
      case "delete":
        break;
    }
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
  
      case "add":
        userStates[chatId]["state"] = "add";
        userStates[chatId]["step"] = "0";
        return sendMessage(
          messageObj,
          createSubscriptionInstruction
        )
  
      case "edit":
        userStates[chatId]["state"] = "add";
        userStates[chatId]["step"] = "0";
        return sendMessage(
          messageObj,
          "Subscription successfully edited!"
        )
      
      case "delete":
        return sendMessage(
          messageObj,
          "Subscription successfully deleted"
        )
  
      default:
        return sendMessage(
          messageObj,
          "Hi, I don't recognize that command!"
        )
    }
}
