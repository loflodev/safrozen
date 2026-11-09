// Address forms (account, checkout): the province list follows the chosen
// country; the lists come with the field (data-states, safrozen_address_fields()).
export function initProvinceLists(root: ParentNode = document) {
  root.querySelectorAll<HTMLSelectElement>('select[data-country]').forEach((country) => {
    // The checkout has two addresses, each in its own [data-address] group.
    const group = country.closest('[data-address]') ?? country.form
    const state = group?.querySelector<HTMLSelectElement>('select[data-states]')
    if (!state) return
    const all = JSON.parse(state.dataset.states ?? '{}') as Record<string, Record<string, string>>
    const placeholder = state.options[0]?.value === '' ? state.options[0].cloneNode(true) : null
    country.addEventListener('change', () => {
      const states = all[country.value] ?? {}
      const options = Object.entries(states).map(([value, label]) => new Option(label, value))
      state.replaceChildren(...(placeholder ? [placeholder.cloneNode(true)] : []), ...options)
      state.value = ''
    })
  })
}
