const dialog = document.querySelector("dialog.lightbox")! satisfies HTMLDialogElement
const table = document.querySelector("table.list")! satisfies HTMLElement

const header = dialog.querySelector("header")!
const picture = dialog.querySelector("picture")!

const html = String.raw

const state = {
  id: 0,
}

table.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement) {
    if (event.target.nodeName === "TD") {
      const { id, name } = event.target.parentElement!.dataset
      if (id && name) {
        state.id = +id
        updateDialog(state.id, name)
        dialog.showModal()
      }
    } else if (event.target.nodeName === "TH") {
      const { sort, type } = event.target.dataset
      if (sort) {
        sortRows(sort, type, event.target)
      }
    }
  }
})

dialog.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement) {
    if (event.target.nodeName === "BUTTON") {
      const { action } = event.target.dataset

      const node = document.querySelector(`tr[data-id="${state.id}"]`)!
      let target = action === "prev" ? node.previousElementSibling : node.nextElementSibling

      if (target instanceof HTMLElement && target.nodeName === "TR") {
        const { id, name } = target.dataset
        if (id && name) {
          state.id = +id
          updateDialog(state.id, name)
        }
      }
    }
  }
})

function updateDialog(id: number, name: string) {
  header.innerHTML = `<h2>${name}</h2><span>#${id}</span>`
  picture.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png" />`
}

function sortRows(col: string, type: string | undefined, node: HTMLElement) {
  const dir = node.dataset.dir
  const newDir = !dir || dir === "desc" ? "asc" : "desc"

  Array.from(table.querySelectorAll("tbody tr"))
    .sort((a, b) => {
      const [ea, eb] = dir === "asc" ? [a, b] : [b, a]
      const [ca, cb] = [
        ea.querySelector(`[data-sort="${col}"]`)!.textContent,
        eb.querySelector(`[data-sort="${col}"]`)!.textContent,
      ]

      return type === "number" ? (Number(ca) > Number(cb) ? -1 : 1) : cb.localeCompare(ca)
    })
    .forEach((tr) => table.querySelector("tbody")!.appendChild(tr))

  table
    .querySelectorAll("thead th")
    .forEach((th) => (th === node ? th.setAttribute("data-dir", newDir) : th.removeAttribute("data-dir")))
}
