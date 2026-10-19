export interface AuthModel {
  api_token: string
}

export interface UserModel {
  id: number
  username: string
  password?: string
  email: string
  first_name: string
  last_name: string
  fullname?: string
  occupation?: string
  companyName?: string
  phone?: string
  roles?: Array<string>
  sidebar_access?: Array<string>
  pic?: string
  language?: 'en' | 'fr'
  timeZone?: string
  auth?: AuthModel
}