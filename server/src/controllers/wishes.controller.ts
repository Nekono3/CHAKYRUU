import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Guests are invitees, not platform users, so submitting a wish is
// unauthenticated and identified by the guest's unique slug instead of a JWT.
export async function createWish(req: Request, res: Response) {
  const { guestSlug, message } = req.body ?? {};
  if (!guestSlug || !message) {
    return res.status(400).json({ error: "guestSlug and message are required" });
  }

  const guest = await prisma.guest.findUnique({ where: { uniqueSlug: guestSlug } });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const wish = await prisma.wish.create({
    data: { guestId: guest.id, eventId: guest.eventId, message },
  });
  return res.status(201).json({ wish });
}

export async function listWishesForEvent(req: Request, res: Response) {
  const event = await prisma.event.findFirst({
    where: { id: req.params.eventId, organizationId: req.user!.organizationId },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const wishes = await prisma.wish.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ wishes });
}
