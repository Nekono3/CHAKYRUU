import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/slug";

// Guests belong to an event, which belongs to an organization, so access is
// checked by joining through the event rather than a direct org column.
async function findOwnedEvent(eventId: string, organizationId: string) {
  return prisma.event.findFirst({ where: { id: eventId, organizationId } });
}

export async function listGuests(req: Request, res: Response) {
  const event = await findOwnedEvent(req.params.eventId, req.user!.organizationId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ guests });
}

export async function createGuest(req: Request, res: Response) {
  const event = await findOwnedEvent(req.params.eventId, req.user!.organizationId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const { name } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const guest = await prisma.guest.create({
    data: { eventId: event.id, name, uniqueSlug: generateSlug(name) },
  });
  return res.status(201).json({ guest });
}

export async function getGuest(req: Request, res: Response) {
  const guest = await prisma.guest.findUnique({ where: { id: req.params.id } });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const event = await findOwnedEvent(guest.eventId, req.user!.organizationId);
  if (!event) return res.status(404).json({ error: "Guest not found" });

  return res.json({ guest });
}

export async function updateGuest(req: Request, res: Response) {
  const guest = await prisma.guest.findUnique({ where: { id: req.params.id } });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const event = await findOwnedEvent(guest.eventId, req.user!.organizationId);
  if (!event) return res.status(404).json({ error: "Guest not found" });

  const { name, rsvpStatus } = req.body ?? {};
  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: { name: name ?? undefined, rsvpStatus: rsvpStatus ?? undefined },
  });
  return res.json({ guest: updated });
}

export async function deleteGuest(req: Request, res: Response) {
  const guest = await prisma.guest.findUnique({ where: { id: req.params.id } });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const event = await findOwnedEvent(guest.eventId, req.user!.organizationId);
  if (!event) return res.status(404).json({ error: "Guest not found" });

  await prisma.guest.delete({ where: { id: guest.id } });
  return res.status(204).send();
}
