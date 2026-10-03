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
  try {
    const res = await fetch('/api/users/current')
    if (res.status === 404) {
      try {
        localStorage.removeItem('daybook_local_user')
      } catch (e) {
        void e
      }
      return null
    }
    if (res.ok) {
      const data = (await res.json()) as { user: LocalUser }
      try {
        localStorage.setItem('daybook_local_user', JSON.stringify(data.user))
      } catch (e) {
        void e
      }
      return data.user
    }
  } catch (e) {
    void e
  }

  try {
    const saved = localStorage.getItem('daybook_local_user')
    if (saved) {
      return JSON.parse(saved) as LocalUser
    }
  } catch (e) {
    void e
  }
  return null
}

export async function createUser(input: CreateUserInput): Promise<LocalUser> {
  try {
    const data = await request<{ user: LocalUser }>('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    try {
      localStorage.setItem('daybook_local_user', JSON.stringify(data.user))
    } catch (e) {
      void e
    }
    return data.user
  } catch (e) {
    void e
    const fallbackUser: LocalUser = {
      id: 'local_' + Math.random().toString(36).slice(2, 10),
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('daybook_local_user', JSON.stringify(fallbackUser))
    } catch (err) {
      void err
    }
    return fallbackUser
  }
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/users/current/profile')
    if (res.status === 404) return null
    if (!res.ok) return null
    return (await res.json()) as UserProfile
  } catch (e) {
    void e
  }
  return null
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

