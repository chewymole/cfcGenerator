import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import { loadTemplates } from "./services/templateService";
const app = createApp(App);
app.use(createPinia());
app.use(router);
//app.mount("#app");

// Load templates before mounting the app
Promise.all([loadTemplates()])
  .then(() => {
    app.mount("#app");
  })
  .catch((error) => {
    console.error("Failed to load templates:", error);
    // You might want to show an error message to the user here
  });
