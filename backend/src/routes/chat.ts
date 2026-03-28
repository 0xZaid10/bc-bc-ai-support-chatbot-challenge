import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { chatService } from "../services/chatService";
import { validateRequest } from "../middleware/validateRequest";
import { chatMessageSchema } from "../schemas/chatSchemas";

const router = Router();

router.post(
  "/message",
  validateRequest({ body: chatMessageSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, message, language } = req.body as z.infer<
        typeof chatMessageSchema
      >;

      const result = await chatService.processMessage({
        sessionId,
        message,
        language,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;