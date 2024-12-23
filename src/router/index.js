import { createRouter, createWebHistory } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";

import DataSourceInput from "../components/DataSourceInput.vue";
import TableSelector from "../components/TableSelector.vue";
import TemplateSelector from "../components/TemplateSelector.vue";
import Generate from "../components/Generate.vue";
import ViewCode from "../components/ViewCodeNew.vue"; // Add this import
import ModelDesigner from "../components/ModelDesigner.vue";
import StartOptions from "../components/StartOptions.vue";
import TemplateCreator from "../components/TemplateCreator.vue";

const routes = [
  {
    path: "/",
    name: "DataSource",
    component: StartOptions,
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
    path: "/docs/:file?",
    name: "Documentation",
    component: () => import("../components/MarkdownViewer.vue"),
    props: (route) => ({
      initialFile: route.params.file || "README.md",
      basePath: "/",
    }),
  },
  {
    path: "/template-creator",
    name: "TemplateCreator",
    component: TemplateCreator,
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
  {
    path: "/model-designer",
    name: "ModelDesigner",
    component: ModelDesigner,
    children: [
      {
        path: "new",
        name: "NewModel",
        component: () => import("../components/designer/NewModelForm.vue"),
        props: true,
      },
      {
        path: "import",
        name: "ImportModel",
        component: () => import("../components/designer/ImportModel.vue"),
      },
      {
        path: "edit/:id",
        name: "EditModel",
        component: () => import("../components/designer/EditModel.vue"),
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
