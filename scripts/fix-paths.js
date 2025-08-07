import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix absolute paths in HTML files
function fixAbsolutePaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace absolute paths with relative paths
    content = content.replace(/href="\/([^"]*?)"/g, 'href="./$1"');
    content = content.replace(/src="\/([^"]*?)"/g, 'src="./$1"');
    content = content.replace(/content="\/([^"]*?)"/g, 'content="./$1"');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed paths in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing paths in ${filePath}:`, error);
  }
}

// Fix paths in index.html
const indexPath = path.join(__dirname, '..', 'out', 'index.html');
fixAbsolutePaths(indexPath);

// Fix paths in 404.html if it exists
const notFoundPath = path.join(__dirname, '..', 'out', '404.html');
if (fs.existsSync(notFoundPath)) {
  fixAbsolutePaths(notFoundPath);
}

console.log('Path fixing complete!');
