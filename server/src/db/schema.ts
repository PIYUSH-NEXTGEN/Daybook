import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastActiveAt: text("last_active_at").notNull(),
});

export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  age: integer("age"),
  occupation: text("occupation"),
  bio: text("bio"),
  currentFocus: text("current_focus"),
  idealDay: text("ideal_day"),
  reflectionStyle: text("reflection_style"),
  motivators: text("motivators"),
  knownStruggles: text("known_struggles"),
  thingsToAvoidAssuming: text("things_to_avoid_assuming"),
  onboardingCompleted: integer("onboarding_completed", {
    mode: "boolean",
  }).notNull().default(false),
  onboardingVersion: integer("onboarding_version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  aiModel: text("ai_model").notNull().default("gemma3:4b"),
  theme: text("theme").notNull().default("system"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const localSessions = sqliteTable(
  "local_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [index("local_sessions_user_id_idx").on(table.userId)],
);

export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryDate: text("entry_date").notNull(),
    content: text("content").notNull().default(""),
    topic: text("topic"),
    mood: text("mood"),
    weather: text("weather"),
    locationText: text("location_text"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("journal_entries_user_id_entry_date_unique").on(table.userId, table.entryDate),
  ],
);

export const journalMedia = sqliteTable(
  "journal_media",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    mediaType: text("media_type").notNull().default("image"),
    path: text("path").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("journal_media_journal_entry_id_idx").on(table.journalEntryId)],
);

export const journalGoals = sqliteTable(
  "journal_goals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    completedAt: text("completed_at"),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    index("journal_goals_user_id_journal_entry_id_idx").on(table.userId, table.journalEntryId),
  ],
);

export const quotes = sqliteTable(
  "quotes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    generatedAt: text("generated_at").notNull(),
  },
  (table) => [index("quotes_journal_entry_id_idx").on(table.journalEntryId)],
);

export const savedQuotes = sqliteTable(
  "saved_quotes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quoteId: text("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    likedAt: text("liked_at").notNull(),
  },
  (table) => [
    uniqueIndex("saved_quotes_user_id_quote_id_unique").on(table.userId, table.quoteId),
  ],
);

export const memories = sqliteTable(
  "memories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull().default("active"),
    confidence: real("confidence"),
    sourceJournalId: text("source_journal_id").references(() => journalEntries.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("memories_user_id_idx").on(table.userId)],
);

export const journalObservations = sqliteTable(
  "journal_observations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    content: text("content").notNull(),
    confidence: real("confidence"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("journal_observations_journal_entry_id_idx").on(table.journalEntryId),
    index("journal_observations_user_id_idx").on(table.userId),
  ],
);

export const experiments = sqliteTable(
  "experiments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    hypothesis: text("hypothesis").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    status: text("status").notNull().default("active"),
    result: text("result"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("experiments_user_id_idx").on(table.userId)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  settings: one(appSettings, {
    fields: [users.id],
    references: [appSettings.userId],
  }),
  sessions: many(localSessions),
  journalEntries: many(journalEntries),
  savedQuotes: many(savedQuotes),
  memories: many(memories),
  experiments: many(experiments),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
  user: one(users, {
    fields: [appSettings.userId],
    references: [users.id],
  }),
}));

export const localSessionsRelations = relations(localSessions, ({ one }) => ({
  user: one(users, {
    fields: [localSessions.userId],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  media: many(journalMedia),
  goals: many(journalGoals),
  quotes: many(quotes),
  observations: many(journalObservations),
}));

export const journalMediaRelations = relations(journalMedia, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalMedia.journalEntryId],
    references: [journalEntries.id],
  }),
}));

export const journalGoalsRelations = relations(journalGoals, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalGoals.journalEntryId],
    references: [journalEntries.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  journalEntry: one(journalEntries, {
    fields: [quotes.journalEntryId],
    references: [journalEntries.id],
  }),
  savedBy: many(savedQuotes),
}));

export const savedQuotesRelations = relations(savedQuotes, ({ one }) => ({
  user: one(users, {
    fields: [savedQuotes.userId],
    references: [users.id],
  }),
  quote: one(quotes, {
    fields: [savedQuotes.quoteId],
    references: [quotes.id],
  }),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
  sourceJournal: one(journalEntries, {
    fields: [memories.sourceJournalId],
    references: [journalEntries.id],
  }),
}));

export const journalObservationsRelations = relations(journalObservations, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalObservations.journalEntryId],
    references: [journalEntries.id],
  }),
}));

export const experimentsRelations = relations(experiments, ({ one }) => ({
  user: one(users, {
    fields: [experiments.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

export type LocalSession = typeof localSessions.$inferSelect;
export type NewLocalSession = typeof localSessions.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

export type JournalMedia = typeof journalMedia.$inferSelect;
export type NewJournalMedia = typeof journalMedia.$inferInsert;

export type JournalGoal = typeof journalGoals.$inferSelect;
export type NewJournalGoal = typeof journalGoals.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

export type SavedQuote = typeof savedQuotes.$inferSelect;
export type NewSavedQuote = typeof savedQuotes.$inferInsert;

export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;

export type JournalObservation = typeof journalObservations.$inferSelect;
export type NewJournalObservation = typeof journalObservations.$inferInsert;

export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;

