import { getAxiosInstance } from "./axios.js"

const sendMessage = (messageObj, messageText) => {

  return getAxiosInstance().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  })

}

export const handleMessage = (messageObj) => {

  const messageText = messageObj.text || "";

  // If message is not a command
  if (messageText.charAt(0) !== "/") return sendMessage(messageObj, "Hi, that's not one of my supported commands, try checking out all available commands by typing `/`");

  const command = messageText.substr(1);

  switch (command) {
    case "start":
      return sendMessage(
        messageObj,
        "Hi, I'm Subscriber, a telegram bot to help you keep track of all your recurring Subscriptions! Let's get started..."
      )

    default:
      return sendMessage(
        messageObj,
        "Hi, I don't recognize that command!"
      )

  }
}
