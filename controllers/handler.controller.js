import { handleMessage } from "./lib/telegram.js";

const handler = async (req, method) => {
  
  const { body } = req;

  if ("edited_message" in body) return; 
  
  if (body) {
    const messageObj = body.message;
    await method(messageObj);
  }

  return;
  
}

export default handler;