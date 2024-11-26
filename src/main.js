import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import { loadTemplates } from "./services/templateService";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { useModelStore } from "./stores/modelStore";
import { useGeneratorStore } from "./stores/generatorStore";
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Toast);

// Initialize the model store
const modelStore = useModelStore();
async function initializeApp() {
  await modelStore.loadModels();
  await loadTemplates();
  app.mount("#app");
}

initializeApp();
