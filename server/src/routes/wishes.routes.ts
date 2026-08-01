import { Router } from "express";
import { createWish, listWishesForEvent } from "../controllers/wishes.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public: a guest submits a wish using their unique slug, no login required.
router.post("/", asyncHandler(createWish));

// Protected: the host views all wishes for one of their events.
router.get("/event/:eventId", requireAuth, asyncHandler(listWishesForEvent));

export default router;
