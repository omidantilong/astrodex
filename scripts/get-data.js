import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { basename } from "node:path"

const ENDPOINT = "https://graphql.pokeapi.co/v1beta2"

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
          }
          pokemon {
            height
            weight
            encounters {
              version {
                name
              }
            }
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

async function getData(query) {
  return await fetch(ENDPOINT, { method: "POST", body: JSON.stringify({ query }) }).then((b) => b.json())
}

async function getTypes(query) {
  const typeData = await getData(query)
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
  const artwork = {
    normal: form.pokemon.pokemonsprites[0].sprites.other["official-artwork"].front_default,
    shiny: form.pokemon.pokemonsprites[0].sprites.other["official-artwork"].front_shiny,
  }

  const image = {
    normal: artwork.normal ? basename(artwork.normal).replace(".png", "") : null,
    shiny: artwork.shiny ? basename(artwork.shiny).replace(".png", "") : null,
  }

  const type = form.pokemon.pokemontypes.map((t) => t.type.name)

  return {
    slug: form.slug,
    name: form.pokemonformnames[0]?.name ?? species.name,
    id: form.id,
    //imageId: image.normal ? basename(image.normal).replace(".png", "") : false,
    isMega: form.isMega,
    isBattleOnly: form.isBattleOnly,
    isDefault: form.isDefault,
    height: form.pokemon.height,
    weight: form.pokemon.weight,
    type,
    typeHash: type.join("-"),
    encounters: Array.from(new Set(form.pokemon.encounters.map((e) => e.version.name))),
    image,
  }
}
async function run() {
  if (!existsSync("./src/data")) await mkdir("./src/data")
  if (!existsSync("./public/data")) await mkdir("./public/data")

  const speciesData = await getData(speciesQuery)

  const data = speciesData.data.species.map((species, i) => {
    const default_form = species.pokemons.find((f) => f.isDefault).pokemonforms.find((f) => f.isDefault)

    species.name = species.pokemonspeciesnames[0].name
    species.genus = species.pokemonspeciesnames[0].genus

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

    // Object.keys(species).forEach((key) => {
    //   if (key.includes("_")) {
    //     species[camelcase(key)] = species[key]
    //     delete species[key]
    //   }
    // })

    return species
  })

  const types = await getTypes(typeQuery)

  // await writeFile("./public/types.json", JSON.stringify(types))
  // await writeFile("./public/data.json", JSON.stringify(data))

  await writeFile("./public/data/types.json", JSON.stringify(types))
  await writeFile("./public/data/data.json", JSON.stringify(data))

  // for await (const s of data) {
  //   await writeFile(`./public/data/${s.id}.json`, JSON.stringify(s))
  // }
}

run().catch((e) => console.error(e))
