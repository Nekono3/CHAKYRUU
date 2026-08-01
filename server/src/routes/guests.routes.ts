import { Router } from "express";
import {
  createGuest,
  deleteGuest,
  getGuest,
  listGuests,
  updateGuest,
} from "../controllers/guests.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/event/:eventId", asyncHandler(listGuests));
router.post("/event/:eventId", asyncHandler(createGuest));
router.get("/:id", asyncHandler(getGuest));
router.patch("/:id", asyncHandler(updateGuest));
router.delete("/:id", asyncHandler(deleteGuest));

export default router;
