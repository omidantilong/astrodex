import type { PokemonType } from "./src/types"

export const CHARS = "abcdefghijklmnopqrstuvwxyz".split("")
export const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const IMAGE_PATH =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"

export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
}

export const BASE_COLORS: Record<string, string> = {
  red: "#F54C4C",
  blue: "#8098FD",
  yellow: "#FAEE2D",
  green: "#5FCB5C",
  black: "#232323",
  brown: "#D89948",
  purple: "#BE7FFF",
  gray: "#BCBCBC",
  whiet: "#FFFFFF",
  pink: "#FF9EC7",
}
