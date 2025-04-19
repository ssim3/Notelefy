import { handleMessage } from "./lib/telegram.js";

const handler = async (req, method) => {
  
  const { body } = req;
  
  if (body) {
    const messageObj = body.message;
    await method(messageObj);
  }

  return;
  
}

export default handler;