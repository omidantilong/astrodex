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

async function getData(query) {
  return await fetch(ENDPOINT, { method: "POST", body: JSON.stringify({ query }) }).then((b) => b.json())
}

async function run() {
  const pokemonData = await getData(pokemonQuery)
  const speciesData = await getData(speciesQuery)

  const data = speciesData.data.species.map((s) => {
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

  await writeFile("./public/data.json", JSON.stringify(data))
}

run().catch((e) => console.error(e))
