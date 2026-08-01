import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const { email, password, organizationName } = req.body ?? {};

  if (!email || !password || !organizationName) {
    return res
      .status(400)
      .json({ error: "email, password and organizationName are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { user, organization } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
    });
    const user = await tx.user.create({
      data: { email, passwordHash, organizationId: organization.id },
    });
    await tx.organization.update({
      where: { id: organization.id },
      data: { ownerId: user.id },
    });
    return { user, organization };
  });

  const token = signToken({
    userId: user.id,
    organizationId: organization.id,
    email: user.email,
  });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, organizationId: organization.id },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
  });

  return res.json({
    token,
    user: { id: user.id, email: user.email, organizationId: user.organizationId },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, organizationId: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
}
