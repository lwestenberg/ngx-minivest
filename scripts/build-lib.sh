#!/bin/bash

# Build script for ngx-minivest library

echo "🔨 Building ngx-minivest library..."

# Build the library using Angular CLI
echo "📦 Building with ng-packagr..."
pnpm ng build ngx-minivest-lib

echo "✅ Library build complete!"
echo "📁 Output: dist/ngx-minivest/"

# Optional: Show build output
ls -la dist/ngx-minivest/
echo ""
echo "To publish:"
echo "  cd dist/ngx-minivest"
echo "  pnpm publish"