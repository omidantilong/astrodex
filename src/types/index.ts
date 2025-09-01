export interface Species {
  id: number
  name: string
  genus: string
  slug: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  generation_id: number
  family: Family[]
  defaultForm: Pokemon
}

export interface Family {
  slug: string
  isDefault: boolean
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
  isDefault: boolean
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

export type TableData = { id: number; name: string; genus: string; forms: Pokemon[]; defaultForm: Pokemon }[]
