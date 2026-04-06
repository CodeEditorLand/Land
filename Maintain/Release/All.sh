#!/usr/bin/env sh

echo "--- NODE_ENV=development --- (Command: pnpm tauri build)"

# Dev 1/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 2/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 3/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 4/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 5/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 6/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 7/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Dev 8/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

echo "--- NODE_ENV=production --- (Command: pnpm tauri build)"

# Prod 1/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 2/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 3/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 4/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 5/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 6/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 7/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

# Prod 8/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build

echo "--- All 16 permutations generated (Command: pnpm tauri build) ---"
