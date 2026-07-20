#!/bin/bash

echo "🔍 Finding and fixing empty TypeScript files..."

# Fix empty .tsx files - add a basic component export
find . -name "*.tsx" -type f -size 0 | while read -r file; do
  name=$(basename "$file" .tsx)
  # Convert filename to PascalCase for component name
  component_name=$(echo "$name" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | sed 's/ //g')
  echo "import React from 'react';" > "$file"
  echo "" >> "$file"
  echo "export const ${component_name}: React.FC = () => {" >> "$file"
  echo "  return <div>${component_name} Component</div>;" >> "$file"
  echo "};" >> "$file"
  echo "✅ Fixed: $file"
done

# Fix empty .ts files - add a simple export
find . -name "*.ts" -type f -size 0 | while read -r file; do
  echo "// Auto-generated module" > "$file"
  echo "export {};" >> "$file"
  echo "✅ Fixed: $file"
done

# Fix files with invalid content (like "export ./")
find . -name "*.ts" -type f -exec grep -l "export \./" {} \; 2>/dev/null | while read -r file; do
  echo "// Fixed invalid export" > "$file"
  echo "export {};" >> "$file"
  echo "✅ Fixed invalid file: $file"
done

echo "✨ All empty files have been fixed!"
