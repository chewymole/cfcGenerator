<template>
  <div class="markdown-viewer">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 text-red-600 rounded">
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="markdown-content prose prose-blue max-w-none p-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">
          {{ title }}
        </h1>
        <!-- File selector dropdown if multiple files available -->
        <select 
          v-if="availableFiles.length > 0"
          v-model="selectedFile"
          class="px-3 py-2 border rounded shadow-sm"
          @change="loadMarkdownFile"
        >
          <option 
            v-for="file in availableFiles" 
            :key="file.path" 
            :value="file.path"
          >
            {{ file.name }}
          </option>
        </select>
      </div>

      <!-- Rendered markdown content -->
      <article 
        class="markdown-body"
        v-html="renderedContent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useToast } from 'vue-toastification';
import { log, error as logError } from '../utils/logger';
const props = defineProps({
 initialFile: {
   type: String,
   default: 'README.md'
 },
 basePath: {
   type: String,
   default: '/'
 }
});
const toast = useToast();
const loading = ref(true);
const error = ref(null);
const content = ref('');
const renderedContent = ref('');
const title = ref('');
const selectedFile = ref(props.initialFile);
const availableFiles = ref([]);
const contentRef = ref(null);
// Configure marked options
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true,
    headerIds: true, // Enable header IDs for anchor links
    mangle: false
});

// Create a custom renderer that handles both internal and external links
const renderer = new marked.Renderer();

// Add heading renderer to create proper IDs
renderer.heading = (text, level) => {
  try {
    log('Heading data:', { text, level, typeof: typeof text });
    
    // Handle text if it's an object
    let headingText = text;
    if (typeof text === 'object') {
      headingText = text.text || text.toString() || '';
    }
    
    // Create safe ID
    const id = headingText
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    // Remove special characters
      .replace(/\s+/g, '-')        // Replace spaces with hyphens
      .replace(/-+/g, '-');        // Replace multiple hyphens with single hyphen
    
    return `<h${level} id="${id}">${headingText}</h${level}>`;
  } catch (err) {
    error('Error processing heading:', { text, level, error: err });
    return `<h${level}>${text}</h${level}>`;
  }
};

renderer.link = (href, title, text) => {
  // Check if it's an anchor link (starts with #)
  if (href?.toString().startsWith('#')) {
    // Remove target="_blank" for internal links
    return `<a href="${href}" class="anchor-link">${text}</a>`;
  }
  
  // External link handling
  if (typeof href === 'object' && href.href) {
    return `<a href="${href.href}" class="external-link" target="_blank" rel="noopener noreferrer">${href.text || text}</a>`;
  }
  
  // Fallback for simple href strings
  const safeHref = href?.toString() || '#';
  const safeText = text || href?.toString() || 'Link';
  
  log('Link details:', { href, title, text, safeHref, safeText });
  
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
};

// Add image renderer to handle paths with type checking
renderer.image = (href, title, text) => {
  try {
    // Handle href if it's an object
    let imagePath = '';
    
    if (typeof href === 'object') {
      log('Image href is object:', href);
      imagePath = href.href || href.raw || href.toString();
    } else {
      imagePath = href?.toString() || '';
    }
    
    // Remove ./public from the path since public is the root directory
    imagePath = imagePath.replace('./public/', '/');
    
    log('Image details:', { href, title, text, imagePath });
    
    return `<img src="${imagePath}" alt="${text || ''}" title="${title || ''}" class="max-w-full h-auto">`;
  } catch (err) {
    error('Error processing image:', { href, title, text, error: err });
    return `<img src="#" alt="Failed to load image: ${text}" class="max-w-full h-auto">`;
  }
};

marked.use({ renderer });

// Load available markdown files
async function loadAvailableFiles() {
  try {
    const response = await fetch(`${props.basePath}docs/index.json`);
    if (!response.ok) throw new Error('Failed to load file index');
    
    const files = await response.json();
    availableFiles.value = files.map(file => ({
      name: file.name,
      path: file.path
    }));
  } catch (err) {
    logError('Error loading markdown files index:', err);
    // Don't show error toast here as this is optional
  }
}

// Load and render markdown content
async function loadMarkdownFile() {
  loading.value = true;
  error.value = null;
  try {
    log('Loading markdown file:', `${props.basePath}${selectedFile.value}`);
    const response = await fetch(`${props.basePath}${selectedFile.value}`);
    if (!response.ok) throw new Error('Failed to load markdown content');

    const text = await response.text();
    log('Raw markdown content:', text);
    content.value = text;

    // Extract title from first heading
    const titleMatch = text.match(/^#\s+(.+)$/m);
    title.value = titleMatch ? titleMatch[1] : selectedFile.value;
    
    // Render markdown and sanitize
    const rawHtml = marked(text);
    log('Rendered HTML before sanitize:', rawHtml);
    
    renderedContent.value = DOMPurify.sanitize(rawHtml);
    log('Final sanitized HTML:', renderedContent.value);

    log('Markdown file loaded and rendered:', selectedFile.value);
  } catch (err) {
    logError('Error loading markdown file:', err);
    error.value = 'Failed to load document';
    toast.error('Failed to load document');
  } finally {
    loading.value = false;
  }
}
// Initialize component
onMounted(async () => {
 await loadAvailableFiles();
 await loadMarkdownFile();
});
</script>

<style>
/* Base markdown content styles */
.markdown-content {
  @apply text-base leading-7;
}

/* Headers */
.markdown-content h1 {
  @apply text-3xl font-bold mt-8 mb-4;
}

.markdown-content h2 {
  @apply text-2xl font-bold mt-6 mb-3;
}

.markdown-content h3 {
  @apply text-xl font-bold mt-5 mb-2;
}

/* Paragraphs and lists */
.markdown-content p {
  @apply mb-4;
}

.markdown-content ul {
  @apply list-disc list-inside mb-4;
}

.markdown-content ol {
  @apply list-decimal list-inside mb-4;
}

/* Links */
.markdown-content a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

/* Code blocks */
.markdown-content pre {
  @apply bg-gray-50 rounded p-4 mb-4 overflow-x-auto;
  white-space: pre;           /* Preserve whitespace and line breaks */
}

.markdown-content code {
  @apply font-mono text-sm bg-gray-50 px-1 py-0.5 rounded;
}

/* Inline code */
.markdown-content p code,
.markdown-content li code {
  @apply bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200;
  white-space: pre-wrap;    /* Allow wrapping for inline code */
}

/* Code blocks (multiline) */
.markdown-content pre code {
  @apply block bg-gray-800 text-gray-100 p-4 border-none;
  line-height: 1.5;
  tab-size: 4;               /* Set tab size */
  -moz-tab-size: 4;
  white-space: pre;          /* Preserve whitespace */
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Optional: Add syntax highlighting colors */
.markdown-content pre code .keyword { @apply text-purple-300; }
.markdown-content pre code .string { @apply text-green-300; }
.markdown-content pre code .comment { @apply text-gray-400; }
.markdown-content pre code .function { @apply text-blue-300; }
.markdown-content pre code .number { @apply text-yellow-300; }

/* Make sure code blocks don't overflow */
.markdown-content pre {
  @apply max-w-full;
}

/* Add a subtle border to code blocks */
.markdown-content pre {
  @apply border border-gray-200;
}

/* Improve readability of inline code */
.markdown-content :not(pre) > code {
  @apply whitespace-normal;
}

/* Blockquotes */
.markdown-content blockquote {
  @apply border-l-4 border-gray-200 pl-4 italic my-4;
}

/* Tables */
.markdown-content table {
  @apply min-w-full divide-y divide-gray-200 mb-4;
}

.markdown-content th {
  @apply px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.markdown-content td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500;
}

/* Images */
.markdown-content img {
  @apply max-w-full h-auto my-4;
}

/* Horizontal rules */
.markdown-content hr {
  @apply my-8 border-t border-gray-200;
}

/* Add styles for anchor links */
.anchor-link {
  @apply text-blue-600 hover:text-blue-800;
  scroll-margin-top: 70px; /* Adjust based on your header height */
}

.anchor-link:hover {
  @apply underline;
}

/* Add scroll-margin to headings */
h1, h2, h3, h4, h5, h6 {
  scroll-margin-top: 70px; /* Adjust based on your header height */
}
</style>