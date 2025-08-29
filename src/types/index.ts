export interface Pokemon {
  id: number
  name: string
  slug: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  generation_id: number
  type: string[]
  height: number
  weight: number
  image: {
    normal: string
    shiny: string
  }
}
