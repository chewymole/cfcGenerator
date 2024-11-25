import { log, error } from "../utils/logger";

export class FileResult {
  constructor(success, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new FileResult(true, data);
  }

  static failure(error) {
    return new FileResult(false, null, error);
  }
}

export class FileManager {
  constructor() {
    this.defaultExtension = "cfc";
    this.validExtensions = new Set([
      "cfc",
      "cfm",
      "js",
      "vue",
      "php",
      "java",
      "cs",
      "py",
      "ts",
    ]);
  }

  generateFilename(options) {
    try {
      const {
        tableName,
        template,
        isChild = false,
        childType = "",
        customName = "",
      } = options;

      if (!tableName || !template) {
        throw new Error("Table name and template are required");
      }

      // Get the base name
      let baseName = customName || tableName;

      // Add prefix for child templates
      if (isChild && childType) {
        baseName = `${tableName}_${childType}`;
      }

      // Get and validate extension
      const extension = this.validateExtension(template.filetype);

      // Combine parts
      const filename = `${baseName}.${extension}`;

      return FileResult.success({
        filename,
        baseName,
        extension,
      });
    } catch (err) {
      error("Error generating filename:", err);
      return FileResult.failure(err.message);
    }
  }

  validateExtension(extension) {
    const ext = (extension || this.defaultExtension).toLowerCase();
    if (!this.validExtensions.has(ext)) {
      log(`Warning: Unknown extension '${ext}', using default`);
      return this.defaultExtension;
    }
    return ext;
  }

  async saveFile(content, filename) {
    try {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);

      return FileResult.success({ filename });
    } catch (err) {
      error("Error saving file:", err);
      return FileResult.failure(`Failed to save file: ${err.message}`);
    }
  }

  async saveMultipleFiles(files) {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.saveFile(file.content, file.filename);
        results.push({
          filename: file.filename,
          success: result.success,
          error: result.error,
        });
      } catch (err) {
        results.push({
          filename: file.filename,
          success: false,
          error: err.message,
        });
      }
    }

    return FileResult.success(results);
  }

  createZipArchive(files) {
    try {
      // This is a placeholder for potential ZIP functionality
      // Would need to import a ZIP library like JSZip
      throw new Error("ZIP functionality not yet implemented");
    } catch (err) {
      error("Error creating ZIP archive:", err);
      return FileResult.failure(err.message);
    }
  }

  validateFilename(filename) {
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(filename)) {
      return FileResult.failure("Filename contains invalid characters");
    }

    // Check length
    if (filename.length > 255 || filename.length === 0) {
      return FileResult.failure("Invalid filename length");
    }

    return FileResult.success(filename);
  }

  getFileInfo(filename) {
    try {
      const lastDot = filename.lastIndexOf(".");
      const baseName = lastDot === -1 ? filename : filename.slice(0, lastDot);
      const extension = lastDot === -1 ? "" : filename.slice(lastDot + 1);

      return FileResult.success({
        filename,
        baseName,
        extension,
        isValid: this.validateFilename(filename).success,
      });
    } catch (err) {
      error("Error getting file info:", err);
      return FileResult.failure(err.message);
    }
  }
}

// Export a singleton instance
export const fileManager = new FileManager();
