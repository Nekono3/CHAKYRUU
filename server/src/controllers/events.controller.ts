import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/slug";

export async function listEvents(req: Request, res: Response) {
  const events = await prisma.event.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ events });
}

export async function getEvent(req: Request, res: Response) {
  const event = await prisma.event.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { guests: true },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  return res.json({ event });
}

export async function createEvent(req: Request, res: Response) {
  const { eventType, title, eventDate, invitationType, templateId, location, settings } =
    req.body ?? {};

  if (!eventType || !title || !eventDate) {
    return res
      .status(400)
      .json({ error: "eventType, title and eventDate are required" });
  }

  const event = await prisma.event.create({
    data: {
      organizationId: req.user!.organizationId,
      hostId: req.user!.userId,
      eventType,
      title,
      eventDate: new Date(eventDate),
      invitationType: invitationType ?? "website",
      templateId: templateId ?? null,
      location: location ?? {},
      settings: settings ?? {},
      uniqueSlug: generateSlug(title),
    },
  });

  return res.status(201).json({ event });
}

export async function updateEvent(req: Request, res: Response) {
  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
  });
  if (!existing) return res.status(404).json({ error: "Event not found" });

  const { eventType, title, eventDate, invitationType, templateId, location, settings } =
    req.body ?? {};

  const event = await prisma.event.update({
    where: { id: existing.id },
    data: {
      eventType: eventType ?? undefined,
      title: title ?? undefined,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      invitationType: invitationType ?? undefined,
      templateId: templateId ?? undefined,
      location: location ?? undefined,
      settings: settings ?? undefined,
    },
  });

  return res.json({ event });
}

export async function deleteEvent(req: Request, res: Response) {
  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
  });
  if (!existing) return res.status(404).json({ error: "Event not found" });

  await prisma.event.delete({ where: { id: existing.id } });
  return res.status(204).send();
}
