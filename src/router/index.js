import { createRouter, createWebHashHistory } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";

import DataSourceInput from "../components/DataSourceInput.vue";
import TableSelector from "../components/TableSelector.vue";
import TemplateSelector from "../components/TemplateSelector.vue";
import Generate from "../components/Generate.vue";
import ViewCode from "../components/ViewCode.vue"; // Add this import

const routes = [
  {
    path: "/",
    name: "DataSource",
    component: DataSourceInput,
  },
  {
    path: "/tables",
    name: "Tables",
    component: TableSelector,
  },
  {
    path: "/templates",
    name: "Templates",
    component: TemplateSelector,
  },
  {
    path: "/generate",
    name: "Generate",
    component: Generate,
  },
  {
    path: "/view-code",
    name: "ViewCode",
    component: ViewCode,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useGeneratorStore();

  if (to.name === "Tables" && !store.dataSource) {
    next({ name: "DataSource" });
  } else if (to.name === "Templates" && store.selectedTables.length === 0) {
    next({ name: "Tables" });
  } else if (to.name === "Generate" && !store.selectedTemplate) {
    next({ name: "Templates" });
  } else {
    next();
  }
});

export default router;
