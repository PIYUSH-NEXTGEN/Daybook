import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db/client.js";
import { appSettings, localSessions, userProfiles, users } from "./db/schema.js";

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

app.listen({ port: PORT, host: "127.0.0.1" }).then(() => {
  console.log(`DayBook server listening on http://localhost:${PORT}`);
});

