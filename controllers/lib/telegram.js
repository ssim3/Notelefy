import { signUp } from "../../services/auth.service.js";
import { getAxiosInstance } from "./axios.js"

const sendMessage = (messageObj, messageText) => {

  return getAxiosInstance().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  })

}

export const handleMessage = async (messageObj) => {

  const messageText = messageObj.text || "";

  // If message is not a command
  if (messageText.charAt(0) !== "/") return sendMessage(messageObj, "Hi, that's not one of my supported commands, try checking out all available commands by typing `/`");

  const command = messageText.substr(1);

  switch (command) {
    case "start":
      const commandMessage = await signUp(messageObj);
      return sendMessage(
        messageObj,
        commandMessage
      )

    default:
      return sendMessage(
        messageObj,
        "Hi, I don't recognize that command!"
      )

  }
}
