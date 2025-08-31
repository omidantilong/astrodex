export interface Species {
  id: number
  name: string
  slug: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  generation_id: number
  family: Family[]
}

export interface Family {
  slug: string
  forms: Pokemon[]
}

export interface Pokemon {
  id: number
  name: string
  slug: string
  type: string[]
  typeHash: string
  height: number
  weight: number
  isMega: boolean
  isBattleOnly: boolean
  encounters: string[]
  image: {
    normal?: string | null
    shiny?: string | null
  }
}

export interface PokemonType {
  slug: string
  name: string
}

export type TableData = { id: number; name: string; forms: Pokemon[] }[]
