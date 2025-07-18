import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import Aura from '@primeuix/themes/aura';

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: 'system',
                cssLayer: false
            }
        }
    })
    .directive('tooltip', Tooltip)
    .mount('#app')
