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

