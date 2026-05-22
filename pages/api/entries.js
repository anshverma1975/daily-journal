import { Redis } from '@upstash/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const email = session.user.email.replace(/[^a-z0-9]/gi, "_");

  if (req.method === "GET") {
    const entries = await redis.get(email) || {};
    return res.status(200).json(entries);
  }

  if (req.method === "POST") {
    const { date, text } = req.body;
    if (!date) return res.status(400).json({ error: "date required" });
    const entries = await redis.get(email) || {};
    if (!text?.trim()) delete entries[date];
    else entries[date] = text;
    await redis.set(email, entries);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}