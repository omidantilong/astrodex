import { writeFile } from "node:fs/promises"

const ENDPOINT = "https://graphql.pokeapi.co/v1beta2"

const gql = String.raw

const pokemonQuery = gql`
  query pokemonQuery {
    pokemon: pokemon(order_by: { id: asc }) {
      name
      id
      height
      weight
      species: pokemon_species_id
      pokemonsprites {
        sprites
      }
      types: pokemontypes {
        type {
          name
        }
      }
    }
  }
`

const speciesQuery = gql`
  query species {
    species: pokemonspecies(order_by: { id: asc }) {
      slug: name
      id
      is_legendary
      is_baby
      is_mythical
      generation_id
      pokemonspeciesnames(where: { language_id: { _eq: 9 } }) {
        name
      }
    }
  }
`

const typeQuery = gql`
  query types {
    types: type(order_by: { id: asc }) {
      slug: name
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

async function run() {
  const pokemonData = await getData(pokemonQuery)
  const speciesData = await getData(speciesQuery)
  const typeData = await getData(typeQuery)

  const types = typeData.data.types.map((t) => {
    t.name = t.typenames[0].name
    t.id = t.typenames[0].id
    t.damage = t.typeefficacies

    delete t.typeefficacies
    delete t.typenames

    return t
  })

  const pokemon = speciesData.data.species.map((s) => {
    const p = pokemonData.data.pokemon.find((p) => p.id === s.id)

    s.weight = p.weight
    s.height = p.height

    s.name = s.pokemonspeciesnames[0].name

    s.image = {
      normal: p.pokemonsprites[0].sprites.other["official-artwork"].front_default,
      shiny: p.pokemonsprites[0].sprites.other["official-artwork"].front_shiny,
    }

    s.type = p.types.map((t) => t.type.name)

    delete s.pokemonspeciesnames

    return s
  })

  await writeFile("./public/types.json", JSON.stringify(types))
  await writeFile("./public/pokemon.json", JSON.stringify(pokemon))
}

run().catch((e) => console.error(e))
