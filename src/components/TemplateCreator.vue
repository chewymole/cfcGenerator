<template>
  <div v-if="!isLocalMode" class="text-center p-4">
    <p class="text-red-600">
      Template creation is only available in local mode.
    </p>
  </div>
  <div v-else class="max-w-2xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">
      Create New Template
    </h2>
    
    <form class="space-y-6" @submit.prevent="createTemplate">
      <!-- Basic Template Info -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Template Name</label>
          <input 
            v-model="template.name" 
            type="text" 
            class="w-full p-2 border rounded"
            placeholder="e.g., Laravel Model"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea 
            v-model="template.description" 
            class="w-full p-2 border rounded"
            rows="3"
            placeholder="Describe what this template generates..."
            required
          />
        </div>

        <!-- Language Selection -->
        <div>
          <label class="block text-sm font-medium mb-1">Language</label>
          <select 
            v-model="template.language" 
            class="w-full p-2 border rounded"
            required
          >
            <option value="">
              Select Language
            </option>
            <option
              v-for="lang in availableLanguages" 
              :key="lang.id" 
              :value="lang.id"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>

        <!-- Output Style -->
        <div>
          <label class="block text-sm font-medium mb-1">Output Style</label>
          <select 
            v-model="template.style" 
            class="w-full p-2 border rounded"
            required
          >
            <option value="">
              Select Style
            </option>
            <option 
              v-for="style in availableStyles" 
              :key="style.id" 
              :value="style.id"
            >
              {{ style.name }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select 
            v-model="template.category" 
            class="w-full p-2 border rounded"
            required
          >
            <option value="">
              Select Category
            </option>
            <option 
              v-for="category in availableCategories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Subcategory -->
        <div>
          <label class="block text-sm font-medium mb-1">Subcategory</label>
          <input 
            v-model="template.subcategory" 
            type="text" 
            class="w-full p-2 border rounded"
            placeholder="e.g., Model"
          >
        </div>

        <!-- File Extension -->
        <div>
          <label class="block text-sm font-medium mb-1">File Extension</label>
          <input 
            v-model="template.fileExtension" 
            type="text" 
            class="w-full p-2 border rounded"
            placeholder="e.g., php"
            required
          >
        </div>
      </div>

      <!-- Preview of generated XSL -->
      <div v-if="previewXsl" class="mt-4">
        <label class="block text-sm font-medium mb-1">Generated XSL Preview</label>
        <pre class="p-4 bg-gray-50 rounded overflow-auto max-h-60"><code>{{ previewXsl }}</code></pre>
      </div>

      <div class="flex justify-end space-x-4">
        <button 
          type="button" 
          class="px-4 py-2 border rounded hover:bg-gray-50"
          @click="generatePreview"
        >
          Preview
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="!isValid"
        >
          Create Template
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
import { useToast } from 'vue-toastification';
import { TemplateFileService } from '../services/templateService';
import { SUPPORTED_LANGUAGES, TEMPLATE_STYLES, TEMPLATE_CATEGORIES } from "@config/dataTypeConfig";

const settingsStore = useSettingsStore();
const toast = useToast();
const isLocalMode = computed(() => settingsStore.isLocalEnvironment);

const template = ref({
    name: '',
    description: '',
    language: '',
    style: '',
    category: '',
    subcategory: '',
    fileExtension: '',
    icon: ''
});

const previewXsl = ref('');

// Available options (these could be moved to a configuration file)
const availableLanguages = computed(() => 
  Object.entries(SUPPORTED_LANGUAGES).map(([id, lang]) => ({
    id: lang.value,
    name: lang.label || id.toUpperCase(),
    icon: lang.icon || 'default.svg'
  }))
);

const availableStyles = computed(() => 
  Object.entries(TEMPLATE_STYLES).map(([id, style]) => ({
    id: style.id,
    name: style.name,
  }))
);

const availableCategories = computed(() => 
  Object.entries(TEMPLATE_CATEGORIES).map(([id, category]) => ({
    id: category.id,
    name: category.name,
  }))
);

const isValid = computed(() => {
  return template.value.name &&
         template.value.description &&
         template.value.language &&
         template.value.style &&
         template.value.category &&
         template.value.fileExtension;
});

async function generatePreview() {
  try {
    // Generate XSL based on template configuration
    previewXsl.value = await generateTemplateXsl(template.value);
  } catch (err) {
    toast.error('Failed to generate preview');
  }
}

async function createTemplate() {
  if (!isValid.value) return;

  try {
    // Generate the XSL content
    const xslContent = await generateTemplateXsl(template.value);

    // Generate unique filename
    const filename = `${template.value.language}/${template.value.style}_${template.value.name.toLowerCase()}.xsl`;

    // Save the XSL file
    await TemplateFileService.saveTemplateFile(
      `/xsl/${filename}`,
      xslContent
    );

    // Update generator.xml
    await updateGeneratorXml(template.value, filename);

    toast.success('Template created successfully');
    // Optionally reset form or redirect
  } catch (err) {
    toast.error(`Failed to create template: ${err.message}`);
  }
}

async function updateGeneratorXml(templateConfig, filename) {
  try {
    // Load current generator.xml
    const currentXml = await TemplateFileService.loadGeneratorXml();
    
    // Parse and add new template
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentXml, 'text/xml');
    
    const templatesNode = doc.getElementsByTagName('templates')[0];
    const newTemplate = doc.createElement('template');
    
    // Set attributes
    newTemplate.setAttribute('name', templateConfig.name);
    newTemplate.setAttribute('description', templateConfig.description);
    newTemplate.setAttribute('language', templateConfig.language);
    newTemplate.setAttribute('style', templateConfig.style);
    newTemplate.setAttribute('category', templateConfig.category);
    newTemplate.setAttribute('subcategory', templateConfig.subcategory);
    newTemplate.setAttribute('template', filename);
    newTemplate.setAttribute('filetype', templateConfig.fileExtension);
    
    templatesNode.appendChild(newTemplate);
    
    // Serialize and save
    const serializer = new XMLSerializer();
    const updatedXml = serializer.serializeToString(doc);
    
    await TemplateFileService.saveGeneratorXml(updatedXml);
  } catch (err) {
    throw new Error(`Failed to update generator.xml: ${err.message}`);
  }
}

async function generateTemplateXsl(config) {
  // This function would generate the appropriate XSL based on the selected language and style
  // You could have template snippets for different languages/styles and combine them
  
  const baseTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    
    <xsl:template match="/root">
        ${getLanguageSpecificTemplate(config)}
    </xsl:template>
</xsl:stylesheet>`;

  return baseTemplate;
}

function getLanguageSpecificTemplate(config) {
  // This would return different templates based on language and style
  const templates = {
    php: {
      model: `
        <xsl:text>&lt;?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class </xsl:text><xsl:value-of select="bean/@name"/><xsl:text> extends Model
{
    protected $table = '</xsl:text><xsl:value-of select="bean/@name"/><xsl:text>';
    protected $fillable = [
</xsl:text>
        <xsl:for-each select="bean/dbtable/column[not(@primaryKey='Yes')]">
            <xsl:text>        '</xsl:text><xsl:value-of select="@name"/><xsl:text>',
</xsl:text>
        </xsl:for-each>
        <xsl:text>    ];
}</xsl:text>`,
      // Add more PHP templates
    },
    // Add more language templates
  };

  return templates[config.language]?.[config.style] || 
         '<!-- Template not found for this language/style combination -->';
}
</script> 