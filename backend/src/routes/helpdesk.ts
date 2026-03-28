import { Router, Request, Response, NextFunction } from "express";
import helpdeskService from "../services/helpdeskService";
import { logger } from "../utils/logger";

const router = Router();

router.get(
  "/sync",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Helpdesk sync requested");
      const result = await helpdeskService.syncTickets();
      res.json(result);
    } catch (error) {
      logger.error("Helpdesk sync failed", { error });
      next(error);
    }
  }
);

export default router;