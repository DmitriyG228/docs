#!/bin/bash

# List of files to process
files=(
  "app/verification-success/page.tsx"
  "app/public-beta/page.tsx"
  "app/documentation_new/page.tsx"
  "app/blog/[slug]/page.tsx"
  "app/blog/page.tsx"
  "app/email-preview/page.tsx"
  "app/email-verification/[token]/page.tsx"
  "app/dashboard/api-keys/page.tsx"
  "app/dashboard/page.tsx"
  "app/beta-signup/route.ts"
  "app/verification-failed/page.tsx"
  "app/verification-expired/page.tsx"
  "app/api/email-verification/[token]/route.ts"
  "app/api/beta-signup/route.ts"
  "app/api/check-token/route.ts"
  "app/api/admin/tokens/route.ts"
  "app/api/admin/tokens/[tokenId]/route.ts"
  "app/api/admin/users/route.ts"
  "app/ga-test/page.tsx"
  "app/privacy/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if the file already has the runtime declaration
    if ! grep -q "export const runtime = 'edge'" "$file"; then
      echo "Adding Edge runtime to $file"
      # Create a temporary file
      tmp_file=$(mktemp)
      # Add the runtime declaration at the top, preserving client directive if present
      if grep -q "'use client'" "$file"; then
        # If 'use client' directive exists, add runtime after it
        sed -e '/use client/a export const runtime = '\''edge'\'';' "$file" > "$tmp_file"
      else
        # Otherwise, add it at the top of the file
        echo "export const runtime = 'edge';" > "$tmp_file"
        cat "$file" >> "$tmp_file"
      fi
      # Replace the original file with the modified version
      mv "$tmp_file" "$file"
    else
      echo "Runtime already declared in $file"
    fi
  else
    echo "File not found: $file"
  fi
done

echo "Completed adding Edge runtime to files!" 