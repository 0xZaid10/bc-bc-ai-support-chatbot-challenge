import { Router, Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboardService";

const router = Router();

router.get("/stats", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;