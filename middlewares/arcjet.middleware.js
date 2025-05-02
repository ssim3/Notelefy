import aj from "../config/arcjet.js";
import handler from "../controllers/handler.controller.js";
import { sendMessage } from "../controllers/lib/telegram.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    
    // Get Arcjet Decision
    const decision = await aj.protect(req, { requested : 1 });

    // Arcject Allowed
    if (decision.isAllowed())  {
      next();
      return;
    }
    
    // Arcjet Denied
    if (decision.reason.isRateLimit()) return res.status(429).json({ error : "Rate Limit Exceeded "});

    // Other reasons
    return res.status(403).json({ error : "Access Denied" });

  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error}`);
  }
}

export default arcjetMiddleware;