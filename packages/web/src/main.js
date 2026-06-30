import { createApp } from 'vue'
import { createPinia } from 'pinia'

const app = createApp({
  template: '<div id="app"></div>'
})

app.use(createPinia())
app.mount('#app')
