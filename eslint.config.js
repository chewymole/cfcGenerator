// eslint.config.js
import pluginVue from "eslint-plugin-vue";

export default [
  // Add more generic rulesets here, such as:
  // 'eslint:recommended',

  // Use the recommended Vue 3 config
  ...pluginVue.configs["flat/recommended"],

  // Override/add specific rules
  {
    rules: {
      "vue/no-unused-vars": "error",
      "vue/no-unused-properties": [
        "error",
        {
          groups: ["props"],
          deepData: false,
          ignorePublicMembers: false,
          unreferencedOptions: [],
        },
      ],
      "vue/no-unused-components": [
        "error",
        {
          ignoreWhenBindingPresent: true,
        },
      ],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: { max: 3 },
          multiline: {
            max: 1,
          },
        },
      ],
    },
  },
];
