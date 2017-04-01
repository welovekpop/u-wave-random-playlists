const fetch = require('unfetch')
const status = document.querySelector('#status')
const toggle = document.querySelector('#toggle')

function render () {
  fetch('/status').then((res) => res.json()).then((body) => {
    status.textContent = body.data.value ? 'Enabled' : 'Disabled'
    toggle.textContent = body.data.value ? 'Disable' : 'Enable'
  })
}

toggle.onclick = () => {
  fetch('/status', {
    method: 'post'
  }).then(render)
}

render()
