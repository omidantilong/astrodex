import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { basename } from "node:path"
import { parse } from "yaml"
import { randomUUID } from "node:crypto"

const PDB_DATA = "https://raw.githubusercontent.com/pokemondb/database/refs/heads/master/data/pokemon-forms.yaml"
const ENDPOINT = "https://graphql.pokeapi.co/v1beta2"
let pdb

const gql = String.raw

const speciesQuery = gql`
  query species {
    species: pokemonspecies(order_by: { id: asc }) {
      slug: name
      id
      isLegendary: is_legendary
      isBaby: is_baby
      isMythical: is_mythical
      genId: generation_id
      pokemons {
        slug: name
        height
        weight
        isDefault: is_default
        pokemonforms {
          slug: name
          id
          isMega: is_mega
          isBattleOnly: is_battle_only
          isDefault: is_default
          pokemonformnames(where: { language_id: { _eq: 9 } }) {
            name
            pokemonName: pokemon_name
          }
          pokemonformgenerations {
            genId: generation_id
          }
          pokemon {
            height
            weight
            pokemonsprites {
              sprites
            }
            pokemontypes {
              type {
                name
              }
            }
          }
        }
      }

      pokemonspeciesnames(where: { language_id: { _eq: 9 } }) {
        name
        genus
      }
    }
  }
`

const typeQuery = gql`
  query types {
    types: type(order_by: { id: asc }) {
      slug: name
      pokemontypes {
        pokemon_id
      }
      typenames(where: { language_id: { _eq: 9 } }) {
        id
        name
      }
      typeefficacies {
        target_type_id
        damage_factor
      }
    }
  }
`

async function getPokeApiData(query) {
  return await fetch(ENDPOINT, { method: "POST", body: JSON.stringify({ query }) }).then((b) => b.json())
}

async function getTypes(query) {
  const typeData = await getPokeApiData(query)
  return typeData.data.types
    .map((t) => {
      t.name = t.typenames[0].name
      t.id = t.typenames[0].id
      t.damage = t.typeefficacies

      const hasPokemon = !!t.pokemontypes.length

      delete t.pokemontypes
      delete t.typeefficacies
      delete t.typenames

      return hasPokemon ? t : false
    })
    .filter((t) => t)
}

function parseForm(form, species) {
  const pdbData = pdb.find((p) => {
    if (p.formid === form.slug) return p
    if (p.formname === form.pokemonformnames[0]?.pokemonName) return p
    if (p.pokemonid === form.slug) return p
  })

  const artwork = {
    normal: form.pokemon.pokemonsprites[0].sprites.other["official-artwork"].front_default,
    shiny: form.pokemon.pokemonsprites[0].sprites.other["official-artwork"].front_shiny,
  }

  const image = {
    normal: artwork.normal ? basename(artwork.normal).replace(".png", "") : null,
    shiny: artwork.shiny ? basename(artwork.shiny).replace(".png", "") : null,
  }

  const type = form.pokemon.pokemontypes.map((t) => t.type.name)

  const genus = pdbData?.species ?? species.genus

  return {
    slug: form.slug,
    name: form.pokemonformnames[0]?.name ?? species.name,
    pokemonName: form.pokemonformnames[0]?.pokemonName ?? species.name,
    genId: form.pokemonformgenerations[0]?.genId ?? species.genId,
    id: form.id,
    genus,
    isMega: form.isMega,
    isBattleOnly: form.isBattleOnly,
    isDefault: form.isDefault,
    height: form.pokemon.height,
    weight: form.pokemon.weight,
    type,
    typeHash: type.join("-"),
    image,
  }
}

async function run() {
  if (!existsSync("./src/data")) await mkdir("./src/data")
  if (!existsSync("./public/data")) await mkdir("./public/data")

  const speciesData = await getPokeApiData(speciesQuery)

  pdb = await fetch(PDB_DATA)
    .then(async (b) => await b.text())
    .then((t) => t.replaceAll(": -", ":"))
    .then((t) => parse(t))
    .then((d) => Object.values(d))

  const data = speciesData.data.species.map((species, i) => {
    const default_form = species.pokemons.find((f) => f.isDefault).pokemonforms.find((f) => f.isDefault)

    species.name = species.pokemonspeciesnames[0].name
    species.genus = species.pokemonspeciesnames[0].genus.replace("Pokémon", "")

    species.defaultForm = {
      id: default_form.id,
      name: default_form.pokemonformnames[0]?.name ?? species.name,
    }

    species.family = species.pokemons.map((p) => {
      return {
        slug: p.slug,
        isDefault: p.isDefault,
        height: p.height,
        weight: p.weight,
        forms: p.pokemonforms.map((form) => parseForm(form, species)),
      }
    })

    delete species.pokemons
    delete species.pokemonspeciesnames

    return species
  })

  const types = await getTypes(typeQuery)

  const meta = {
    key: randomUUID().split("-")[0],
  }

  //await writeFile("./public/data/pdb.json", JSON.stringify(pdb))
  await writeFile("./public/meta.json", JSON.stringify(meta))
  await writeFile("./public/data/types.json", JSON.stringify(types))
  await writeFile("./public/data/data.json", JSON.stringify(data))
}

run().catch((e) => console.error(e))
