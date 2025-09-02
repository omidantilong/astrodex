import { writeFile } from "node:fs/promises"
import { format } from "prettier"
import { COLORS } from "../constants.ts"

async function run() {
  await writeFile(
    "./src/styles/colors.css",
    await format(
      Object.entries(COLORS)
        .map(([t, c]) => `[data-type="${t}"] { --swatch: ${c} }`)
        .join(""),
      { parser: "css" }
    )
  )
}

run().catch((e) => console.log(e))
