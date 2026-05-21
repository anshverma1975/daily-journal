import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function getUserFile(email) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const safe = email.replace(/[^a-z0-9]/gi, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

function loadEntries(email) {
  const file = getUserFile(email);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveEntries(email, entries) {
  fs.writeFileSync(getUserFile(email), JSON.stringify(entries, null, 2));
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const email = session.user.email;

  if (req.method === "GET") {
    return res.status(200).json(loadEntries(email));
  }

  if (req.method === "POST") {
    const { date, text } = req.body;
    if (!date) return res.status(400).json({ error: "date required" });
    const entries = loadEntries(email);
    if (text === "" || text == null) {
      delete entries[date];
    } else {
      entries[date] = text;
    }
    saveEntries(email, entries);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
