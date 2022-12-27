import { User } from 'firebase/auth'

export interface Idea {
  id: string
  name: string
  user: string
  userName: string
  votes: number
  createdAt: number
}

export interface AuthUser extends User {
  votes?: string[]
}
