export interface LocalUser {
  id: string
  displayName: string
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

export interface CreateUserInput {
  displayName: string
}

export interface UserProfile {
  id: string
  userId: string
  age: number | null
  occupation: string | null
  bio: string | null
  currentFocus: string | null
  idealDay: string | null
  reflectionStyle: string | null
  motivators: string | null
  knownStruggles: string | null
  thingsToAvoidAssuming: string | null
  onboardingCompleted: boolean
  onboardingVersion: number
  createdAt: string
  updatedAt: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    throw new Error(`DayBook API request failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export async function getCurrentUser(): Promise<LocalUser | null> {
  const res = await fetch('/api/users/current')
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to load current user: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as { user: LocalUser }
  return data.user
}

export async function createUser(input: CreateUserInput): Promise<LocalUser> {
  const data = await request<{ user: LocalUser }>('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return data.user
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const res = await fetch('/api/users/current/profile')
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to load current profile: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as UserProfile
}

export interface UpdateUserProfileInput {
  age?: number | null
  occupation?: string | null
  bio?: string | null
  currentFocus?: string | null
  idealDay?: string | null
  reflectionStyle?: string | null
  motivators?: string | null
  knownStruggles?: string | null
  thingsToAvoidAssuming?: string | null
  onboardingCompleted?: boolean
}

export async function updateCurrentProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
  return request<UserProfile>('/api/users/current/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export interface Journal {
  id: string
  entryDate: string
  content: string
  topic: string | null
  mood: string | null
  weather: string | null
  locationText: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveJournalInput {
  content: string
  topic?: string | null
  mood?: string | null
  weather?: string | null
  locationText?: string | null
}

export async function getJournal(entryDate: string): Promise<Journal | null> {
  const res = await fetch(`/api/journals/${encodeURIComponent(entryDate)}`)
  if (!res.ok) {
    throw new Error(`Failed to load journal: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as { journal: Journal | null }
  return data.journal
}

export async function saveJournal(entryDate: string, input: SaveJournalInput): Promise<Journal> {
  const data = await request<{ journal: Journal }>(`/api/journals/${encodeURIComponent(entryDate)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return data.journal
}

export async function deleteJournal(entryDate: string): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/api/journals/${encodeURIComponent(entryDate)}`, {
    method: 'DELETE',
  })
}

export interface JournalGoal {
  id: string
  text: string
  completed: boolean
  completedAt: string | null
  position: number
  createdAt: string
  journalEntryId: string
}

export interface GetJournalGoalsResponse {
  goals: JournalGoal[]
}

export interface CreateJournalGoalInput {
  text: string
  position?: number
}

export interface UpdateJournalGoalInput {
  completed: boolean
}

export async function getJournalGoals(entryDate: string): Promise<GetJournalGoalsResponse> {
  const res = await fetch(`/api/journals/${encodeURIComponent(entryDate)}/goals`)
  if (!res.ok) {
    throw new Error(`Failed to load journal goals: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as GetJournalGoalsResponse
}

export async function createJournalGoal(entryDate: string, input: CreateJournalGoalInput): Promise<JournalGoal> {
  const data = await request<{ goal: JournalGoal }>(`/api/journals/${encodeURIComponent(entryDate)}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return data.goal
}

export async function updateJournalGoal(entryDate: string, goalId: string, input: UpdateJournalGoalInput): Promise<JournalGoal> {
  const data = await request<{ goal: JournalGoal }>(`/api/journals/${encodeURIComponent(entryDate)}/goals/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return data.goal
}

export async function deleteJournalGoal(entryDate: string, goalId: string): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/api/journals/${encodeURIComponent(entryDate)}/goals/${goalId}`, {
    method: 'DELETE',
  })
}

export interface PreviousJournalGoalsResponse {
  entryDate: string | null
  goals: JournalGoal[]
}

export async function getPreviousJournalGoals(entryDate: string): Promise<PreviousJournalGoalsResponse> {
  const res = await fetch(`/api/journals/${encodeURIComponent(entryDate)}/goals/previous`)
  if (!res.ok) {
    throw new Error(`Failed to load previous goals: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as PreviousJournalGoalsResponse
}

export async function getJournalDates(from: string, to: string): Promise<string[]> {
  const params = new URLSearchParams({ from, to })
  const data = await request<{ dates: string[] }>(`/api/journals/dates?${params.toString()}`)
  return data.dates
}

