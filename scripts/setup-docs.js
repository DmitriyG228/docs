const fs = require('fs');
const path = require('path');

// Path to root docs directory
const rootDocsDir = path.join(__dirname, '../../docs');
// Path to portal docs directory
const portalDocsDir = path.join(__dirname, '../docs');

// Ensure the docs directory exists
if (!fs.existsSync(portalDocsDir)) {
  console.log('Creating docs directory in portal...');
  fs.mkdirSync(portalDocsDir, { recursive: true });
}

// Check if the root docs directory exists
if (fs.existsSync(rootDocsDir)) {
  // Copy markdown files from root docs to portal docs
  console.log('Copying markdown files from root docs to portal docs...');
  const files = fs.readdirSync(rootDocsDir);
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const sourcePath = path.join(rootDocsDir, file);
      const destPath = path.join(portalDocsDir, file);
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to portal docs directory`);
      } catch (error) {
        console.error(`Failed to copy ${file}: ${error.message}`);
      }
    }
  }
} else {
  console.log('Root docs directory does not exist.');
  
  // Create a sample markdown file if none exist
  if (fs.readdirSync(portalDocsDir).filter(file => file.endsWith('.md')).length === 0) {
    console.log('Creating sample documentation file...');
    
    const sampleContent = `# Sample Documentation

## Introduction

This is a sample documentation file. Replace it with your own documentation.

## Getting Started

1. Create markdown files in the docs directory
2. They will automatically appear in the documentation page

## Features

- Automatically renders markdown files
- Supports syntax highlighting
- Generates table of contents
- Allows navigation between files
`;
    
    fs.writeFileSync(path.join(portalDocsDir, 'sample.md'), sampleContent);
    console.log('Created sample.md');
  }
}

console.log('Docs setup complete!'); 