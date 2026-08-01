import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "../controllers/events.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listEvents));
router.post("/", asyncHandler(createEvent));
router.get("/:id", asyncHandler(getEvent));
router.patch("/:id", asyncHandler(updateEvent));
router.delete("/:id", asyncHandler(deleteEvent));

export default router;
