import type { Pokemon, Species } from "../../types"
import { IMAGE_PATH } from "../../../constants"
const html = String.raw

const dialog = document.querySelector("dialog.lightbox")! satisfies HTMLDialogElement
const table = document.querySelector("table.list")! satisfies HTMLElement
const header = dialog.querySelector("header")! satisfies HTMLElement
const picture = dialog.querySelector("picture")! satisfies HTMLElement

const state: {
  data: Species[]
  id: number
  formid: number
} = {
  data: (await getData()) ?? [],
  id: 0,
  formid: 0,
}

attach()

function attach() {
  table.addEventListener("click", async (event) => {
    if (event.target instanceof HTMLElement) {
      if (event.target.dataset.action === "load") {
        event.preventDefault()
        const { id, formid } = event.target.dataset
        if (id && formid) {
          state.id = +id
          state.formid = +formid

          await updateDialog(state.id, state.formid)
          dialog.showModal()
        }
      } else if (event.target.nodeName === "BUTTON") {
        const { sort, type } = event.target.dataset
        if (sort) {
          sortRows(sort, type, event.target)
        }
      }
    }
  })

  dialog.addEventListener("keydown", async (event) => {
    const action = event.key === "ArrowRight" ? "next" : event.key === "ArrowLeft" ? "prev" : false

    if (action) {
      const button = dialog.querySelector(`button[data-action=${action}]`)! satisfies HTMLElement
      button.style.animation = "press 0.2s ease-out forwards"
      button.focus()
      await getSibling(action)
    }
  })

  dialog.addEventListener("keyup", (event) => {
    const action = event.key === "ArrowRight" ? "next" : event.key === "ArrowLeft" ? "prev" : false
    if (action) {
      const button = dialog.querySelector(`button[data-action=${action}]`)! satisfies HTMLElement
      button.style.animation = "press 0.2s ease-out reverse"
    }
  })

  dialog.addEventListener("click", async (event) => {
    if (event.target instanceof HTMLElement) {
      if (event.target.nodeName === "BUTTON") {
        const { action } = event.target.dataset
        if (action === "close") {
          dialog.close()
        } else {
          action && (await getSibling(action))
        }
      }
    }
  })
}

async function getKeys(): Promise<{ remoteKey: string; localKey: string; isStale: boolean }> {
  const remoteKey = await fetch("/meta.json")
    .then((b) => b.json())
    .then((d) => d.key)

  const localKey = String(localStorage.getItem("astrodex.key"))

  return { remoteKey, localKey, isStale: remoteKey !== localKey }
}

async function getData(): Promise<Species[] | null> {
  const { remoteKey, isStale } = await getKeys()

  if (isStale || !localStorage.hasOwnProperty("astrodex.data")) {
    const data = await fetch("/data/data.json", { cache: "no-cache" }).then(async (b) => {
      const d = await b.text()
      localStorage.setItem("astrodex.data", d)
      localStorage.setItem("astrodex.key", remoteKey)
      return d
    })
    return JSON.parse(data)
  } else {
    return JSON.parse(localStorage.getItem("astrodex.data") ?? "")
  }
}

async function getSibling(action: string): Promise<void> {
  const node = document.querySelector(`tr[data-formid="${state.formid}"]`)!
  let target = action === "prev" ? node.previousElementSibling : node.nextElementSibling

  if (target instanceof HTMLElement && target.nodeName === "TR") {
    const { id, formid } = target.dataset

    if (id && formid) {
      state.formid = +formid
      state.id = +id
      await updateDialog(state.id, state.formid)
    }
  }
}

function getDetails(
  id: number,
  formid: number
): { species: Species | undefined; form: Pokemon | undefined; defaultForm: Pokemon | undefined } {
  const species = state.data.find((p) => p.id === id)
  const form = species && species.family.flatMap((f) => f.forms).find((form) => form.id === formid)
  const defaultForm = species?.family.find((f) => f.isDefault)?.forms.find((f) => f.isDefault)

  return { species, form, defaultForm }
}

async function updateDialog(id: number, formid: number): Promise<void> {
  const { species, form, defaultForm } = getDetails(id, formid)

  if (species && form && defaultForm) {
    dialog.dataset.t1 = form.type[0]
    dialog.dataset.t2 = form.type[1] ?? form.type[0]

    header.innerHTML = `<h2><span>${species.name}</span><span>#${id}</span></h2>`
    header.innerHTML += html`<div class="stats">
      <span class="form-name">${form.genus} Pokémon</span>${form.name !== species.name && form.name !== defaultForm.name
        ? `<span class="form-name align-right">${form.name}</span></div>`
        : ""}
    </div>`

    picture.innerHTML = `<img src="${IMAGE_PATH + form.image.normal}.png" />`
  }
}

function sortRows(col: string, type: string | undefined, node: HTMLElement): void {
  const dir = node.dataset.dir
  const newDir = !dir || dir === "desc" ? "asc" : "desc"
  const rows = table.querySelectorAll(":scope tbody tr")

  Array.from(rows)
    .sort((a, b) => {
      const [ea, eb] = dir === "asc" ? [a, b] : [b, a]
      const [ta, tb] = [ea.querySelector(`[data-sort="${col}"]`)!, eb.querySelector(`[data-sort="${col}"]`)!]
      const [ca, cb] = [
        ta?.getAttribute("data-value") ?? ta.textContent,
        tb?.getAttribute("data-value") ?? tb.textContent,
      ]

      return type === "number" ? (Number(ca) > Number(cb) ? -1 : 1) : cb.localeCompare(ca)
    })
    .forEach((tr) => table.querySelector("tbody")!.appendChild(tr))

  table
    .querySelectorAll("thead th button")
    .forEach((b) => (b === node ? b.setAttribute("data-dir", newDir) : b.removeAttribute("data-dir")))
}
