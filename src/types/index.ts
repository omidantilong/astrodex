export interface Species {
  id: number
  name: string
  genus: string
  slug: string
  isBaby: boolean
  isLegendary: boolean
  isMythical: boolean
  genId: number
  family: Family[]
  defaultForm: {
    id: number
    name: string
  }
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
  genus: string
  image: {
    normal?: string | null
    shiny?: string | null
  }
}

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy"

export type TableData = TableRow[]

export type TableRow = {
  id: number
  name: string
  genus: string
  forms: Pokemon[]
  defaultForm: {
    id: number
    name: string
  }
}
