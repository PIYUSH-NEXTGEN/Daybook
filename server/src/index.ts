import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { and, eq, gte, lte, lt, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db/client.js";
import { appSettings, journalEntries, journalGoals, localSessions, userProfiles, users } from "./db/schema.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = Fastify({ logger: false });

function nowIso(): string {
  return new Date().toISOString();
}

function toUserResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt,
  };
}

function findActiveUser() {
  const session = db
    .select()
    .from(localSessions)
    .where(eq(localSessions.isActive, true))
    .limit(1)
    .all()[0];
  if (!session) return null;

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)
    .all()[0];
  if (!user) return null;

  return user;
}

const createUserBody = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "displayName must not be empty")
    .max(64, "displayName must be 64 characters or fewer"),
});

app.post("/api/users", async (request, reply) => {
  const parsed = createUserBody.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
  }

  const now = nowIso();

  try {
    const created = db.transaction((tx) => {
      tx.update(localSessions)
        .set({ isActive: false })
        .where(eq(localSessions.isActive, true))
        .run();

      const userId = randomUUID();

      tx.insert(users)
        .values({
          id: userId,
          displayName: parsed.data.displayName,
          createdAt: now,
          updatedAt: now,
          lastActiveAt: now,
        })
        .run();

      tx.insert(userProfiles)
        .values({
          id: randomUUID(),
          userId,
          onboardingCompleted: false,
          onboardingVersion: 1,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      tx.insert(appSettings)
        .values({
          id: randomUUID(),
          userId,
          aiModel: "gemma3:4b",
          theme: "system",
          createdAt: now,
          updatedAt: now,
        })
        .run();

      tx.insert(localSessions)
        .values({
          id: randomUUID(),
          userId,
          createdAt: now,
          lastSeenAt: now,
          isActive: true,
        })
        .run();

      const row = tx.select().from(users).where(eq(users.id, userId)).limit(1).all()[0];
      if (!row) {
        throw new Error("User creation failed");
      }
      return row;
    });

    return reply.code(201).send({ user: toUserResponse(created) });
  } catch (err) {
    app.log.error(err);
    return reply.code(500).send({ error: "Failed to create user" });
  }
});


app.get("/api/users/current", async (_request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const now = nowIso();
  db.update(users)
    .set({ lastActiveAt: now })
    .where(eq(users.id, user.id))
    .run();

  return reply.send({ user: toUserResponse({ ...user, lastActiveAt: now }) });
});

app.get("/api/users/current/profile", async (_request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const profile = db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1)
    .all()[0];
  if (!profile) {
    return reply.code(404).send({ error: "No profile found" });
  }

  return reply.send(profile);
});

const MAX_PROFILE_TEXT_LENGTH = 2000;

const optionalProfileText = z
  .string()
  .trim()
  .max(MAX_PROFILE_TEXT_LENGTH, "Value is too long")
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const updateProfileBody = z.object({
  age: z
    .number()
    .int("Age must be an integer")
    .min(1, "Age must be at least 1")
    .max(140, "Age must be 140 or less")
    .nullable()
    .optional(),
  occupation: optionalProfileText,
  bio: optionalProfileText,
  currentFocus: optionalProfileText,
  idealDay: optionalProfileText,
  reflectionStyle: z.enum(["Gentle", "Balanced", "Direct"]).nullable().optional(),
  motivators: optionalProfileText,
  knownStruggles: optionalProfileText,
  thingsToAvoidAssuming: optionalProfileText,
  onboardingCompleted: z.boolean().optional(),
});

app.patch("/api/users/current/profile", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active local user" });
  }

  const parsed = updateProfileBody.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
  }

  const now = nowIso();

  try {
    const updated = db.transaction((tx) => {
      const existing = tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1)
        .all()[0];
      if (!existing) {
        return null;
      }

      const patch: {
        age?: number | null;
        occupation?: string | null;
        bio?: string | null;
        currentFocus?: string | null;
        idealDay?: string | null;
        reflectionStyle?: string | null;
        motivators?: string | null;
        knownStruggles?: string | null;
        thingsToAvoidAssuming?: string | null;
        onboardingCompleted?: boolean;
        updatedAt: string;
      } = { updatedAt: now };

      for (const key of [
        "age",
        "occupation",
        "bio",
        "currentFocus",
        "idealDay",
        "reflectionStyle",
        "motivators",
        "knownStruggles",
        "thingsToAvoidAssuming",
        "onboardingCompleted",
      ] as const) {
        if (parsed.data[key] !== undefined) {
          (patch as Record<string, unknown>)[key] = parsed.data[key];
        }
      }

      tx.update(userProfiles).set(patch).where(eq(userProfiles.id, existing.id)).run();

      const row = tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, existing.id))
        .limit(1)
        .all()[0];
      if (!row) {
        throw new Error("Profile update failed");
      }
      return row;
    });

    if (!updated) {
      return reply.code(404).send({ error: "Profile not found" });
    }

    return reply.send(updated);
  } catch (err) {
    app.log.error(err);
    return reply.code(500).send({ error: "Failed to update profile" });
  }
});

function isValidJournalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yStr, mStr, dStr] = value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toJournalResponse(row: typeof journalEntries.$inferSelect) {
  return {
    id: row.id,
    entryDate: row.entryDate,
    content: row.content,
    topic: row.topic,
    mood: row.mood,
    weather: row.weather,
    locationText: row.locationText,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const journalDateParam = z.string().refine(isValidJournalDate, "Invalid date, expected YYYY-MM-DD");

const optionalJournalText = z
  .string()
  .trim()
  .max(1000, "Value is too long")
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const saveJournalBody = z.object({
  content: z.string().max(200000, "Content is too long"),
  topic: optionalJournalText,
  mood: optionalJournalText,
  weather: optionalJournalText,
  locationText: optionalJournalText,
});

app.get("/api/journals/dates", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const query = request.query as { from?: string; to?: string };
  const from = query.from;
  const to = query.to;

  if (!from || !to) {
    return reply.code(400).send({ error: "Missing from or to query parameter, expected YYYY-MM-DD" });
  }
  if (!isValidJournalDate(from) || !isValidJournalDate(to)) {
    return reply.code(400).send({ error: "Invalid date, expected YYYY-MM-DD" });
  }
  if (from > to) {
    return reply.code(400).send({ error: "from must be <= to" });
  }

  const rows = db
    .select({ entryDate: journalEntries.entryDate })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), gte(journalEntries.entryDate, from), lte(journalEntries.entryDate, to)))
    .all();

  return reply.send({ dates: rows.map((r) => r.entryDate).sort() });
});

app.get("/api/journals/:date", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const parsed = journalDateParam.safeParse(params.date);
  if (!parsed.success) {
    return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = parsed.data;

  const row = db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
    .limit(1)
    .all()[0];

  if (!row) {
    return reply.send({ journal: null });
  }

  return reply.send({ journal: toJournalResponse(row) });
});

app.put("/api/journals/:date", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const bodyParsed = saveJournalBody.safeParse(request.body);
  if (!bodyParsed.success) {
    return reply.code(400).send({ error: bodyParsed.error.issues[0]?.message ?? "Invalid request" });
  }

  const now = nowIso();
  const { content, topic, mood, weather, locationText } = bodyParsed.data;

  try {
    const saved = db.transaction((tx) => {
      const existing = tx
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
        .limit(1)
        .all()[0];

      if (existing) {
        tx.update(journalEntries)
          .set({
            content,
            topic: topic ?? null,
            mood: mood ?? null,
            weather: weather ?? null,
            locationText: locationText ?? null,
            updatedAt: now,
          })
          .where(eq(journalEntries.id, existing.id))
          .run();

        const updated = tx.select().from(journalEntries).where(eq(journalEntries.id, existing.id)).limit(1).all()[0];
        if (!updated) throw new Error("Journal update failed");
        return updated;
      }

      const id = randomUUID();
      tx.insert(journalEntries)
        .values({
          id,
          userId: user.id,
          entryDate,
          content,
          topic: topic ?? null,
          mood: mood ?? null,
          weather: weather ?? null,
          locationText: locationText ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const inserted = tx.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1).all()[0];
      if (!inserted) throw new Error("Journal creation failed");
      return inserted;
    });

    return reply.send({ journal: toJournalResponse(saved) });
  } catch (err) {
    app.log.error(err);
    return reply.code(500).send({ error: "Failed to save journal" });
  }
});

app.delete("/api/journals/:date", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const parsed = journalDateParam.safeParse(params.date);
  if (!parsed.success) {
    return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = parsed.data;

  const existing = db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
    .limit(1)
    .all()[0];

  if (!existing) {
    return reply.send({ deleted: false });
  }

  db.delete(journalEntries).where(eq(journalEntries.id, existing.id)).run();

  return reply.send({ deleted: true });
});

app.get("/api/journals/:date/goals", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const journalEntry = db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
    .limit(1)
    .all()[0];

  if (!journalEntry) {
    return reply.send({ goals: [] });
  }

  const goals = db
    .select()
    .from(journalGoals)
    .where(eq(journalGoals.journalEntryId, journalEntry.id))
    .orderBy(asc(journalGoals.position), asc(journalGoals.createdAt))
    .all();

  return reply.send({ goals });
});

app.get("/api/journals/:date/goals/previous", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const previousEntry = db
    .select({ id: journalEntries.id, entryDate: journalEntries.entryDate })
    .from(journalGoals)
    .innerJoin(journalEntries, eq(journalGoals.journalEntryId, journalEntries.id))
    .where(and(eq(journalEntries.userId, user.id), lt(journalEntries.entryDate, entryDate)))
    .groupBy(journalEntries.id, journalEntries.entryDate)
    .orderBy(desc(journalEntries.entryDate))
    .limit(1)
    .all()[0];

  if (!previousEntry) {
    return reply.send({ entryDate: null, goals: [] });
  }

  const goals = db
    .select()
    .from(journalGoals)
    .where(eq(journalGoals.journalEntryId, previousEntry.id))
    .orderBy(asc(journalGoals.position), asc(journalGoals.createdAt))
    .all();

  return reply.send({ entryDate: previousEntry.entryDate, goals });
});

app.post("/api/journals/:date/goals", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const goalBody = z
    .object({
      text: z.string().trim().min(1, "Goal text must not be empty").max(500, "Goal text is too long"),
      position: z.number().int().optional(),
    })
    .safeParse(request.body);

  if (!goalBody.success) {
    return reply.code(400).send({ error: goalBody.error.issues[0]?.message ?? "Invalid request" });
  }

  const { text, position: positionInput } = goalBody.data;
  const now = nowIso();

  const existingEntry = db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
    .limit(1)
    .all()[0];

  let entryId: string;

  try {
    const created = db.transaction((tx) => {
      if (!existingEntry) {
        const id = randomUUID();
        tx.insert(journalEntries).values({
          id,
          userId: user.id,
          entryDate,
          content: '',
          topic: null,
          mood: null,
          weather: null,
          locationText: null,
          createdAt: now,
          updatedAt: now,
        }).run();

        entryId = id;
      } else {
        entryId = existingEntry.id;
      }

      let position: number;
      if (positionInput !== undefined) {
        position = positionInput;
      } else {
        const maxPos = tx
          .select({ max: journalGoals.position })
          .from(journalGoals)
          .where(eq(journalGoals.journalEntryId, entryId))
          .orderBy(desc(journalGoals.position))
          .limit(1)
          .all()[0]?.max;
        position = (maxPos ?? -1) + 1;
      }

      const goalId = randomUUID();
      tx.insert(journalGoals).values({
        id: goalId,
        userId: user.id,
        journalEntryId: entryId,
        text,
        completed: false,
        createdAt: now,
        completedAt: null,
        position,
      }).run();

      const row = tx
        .select()
        .from(journalGoals)
        .where(eq(journalGoals.id, goalId))
        .limit(1)
        .all()[0];
      if (!row) throw new Error("Goal creation failed");
      return row;
    });

    return reply.send({ goal: created });
  } catch (err) {
    app.log.error(err);
    return reply.code(500).send({ error: "Failed to create goal" });
  }
});

app.patch("/api/journals/:date/goals/:goalId", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string; goalId?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const goalId = params.goalId;
  if (!goalId) {
    return reply.code(400).send({ error: "Goal ID is required" });
  }

  const completionBody = z
    .object({
      completed: z.boolean(),
    })
    .safeParse(request.body);

  if (!completionBody.success) {
    return reply.code(400).send({ error: completionBody.error.issues[0]?.message ?? "Invalid request" });
  }

  const { completed } = completionBody.data;
  const now = nowIso();

  const goal = db
    .select({
      g: journalGoals,
      jeUserId: journalEntries.userId,
    })
    .from(journalGoals)
    .leftJoin(journalEntries, eq(journalGoals.journalEntryId, journalEntries.id))
    .where(
      and(
        eq(journalGoals.id, goalId),
        eq(journalEntries.userId, user.id),
        eq(journalEntries.entryDate, entryDate)
      )
    )
    .limit(1)
    .all()[0];

  if (!goal) {
    return reply.code(404).send({ error: "Goal not found or access denied" });
  }

  db
    .update(journalGoals)
    .set({
      completed,
      completedAt: completed ? now : null,
    })
    .where(eq(journalGoals.id, goalId))
    .run();

  const row = db
    .select()
    .from(journalGoals)
    .where(eq(journalGoals.id, goalId))
    .limit(1)
    .all()[0];

  if (!row) {
    return reply.code(500).send({ error: "Goal update failed" });
  }

  return reply.send({ goal: row });
});

app.delete("/api/journals/:date/goals/:goalId", async (request, reply) => {
  const user = findActiveUser();
  if (!user) {
    return reply.code(404).send({ error: "No active user" });
  }

  const params = request.params as { date?: string; goalId?: string };
  const dateParsed = journalDateParam.safeParse(params.date);
  if (!dateParsed.success) {
    return reply.code(400).send({ error: dateParsed.error.issues[0]?.message ?? "Invalid date" });
  }
  const entryDate = dateParsed.data;

  const goalId = params.goalId;
  if (!goalId) {
    return reply.code(400).send({ error: "Goal ID is required" });
  }

  const journalEntry = db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, entryDate)))
    .limit(1)
    .all()[0];

  if (!journalEntry) {
    return reply.code(404).send({ error: "Goal not found or access denied" });
  }

  const existing = db
    .select()
    .from(journalGoals)
    .where(
      and(
        eq(journalGoals.id, goalId),
        eq(journalGoals.userId, user.id),
        eq(journalGoals.journalEntryId, journalEntry.id)
      )
    )
    .limit(1)
    .all()[0];

  if (!existing) {
    return reply.code(404).send({ error: "Goal not found or access denied" });
  }

  db.delete(journalGoals).where(eq(journalGoals.id, goalId)).run();

  return reply.send({ deleted: true });
});

app.listen({ port: PORT, host: "127.0.0.1" }).then(() => {
  console.log(`DayBook server listening on http://localhost:${PORT}`);
});

