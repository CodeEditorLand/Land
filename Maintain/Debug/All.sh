#!/usr/bin/env bash

echo "--- NODE_ENV=development ---"

# Dev 1/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 2/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 3/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 4/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 5/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 6/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 7/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Dev 8/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

echo "--- NODE_ENV=production ---"

# Prod 1/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 2/8
pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 3/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 4/8
pnpm cross-env \
	Browser=true \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 5/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 6/8
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 7/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

# Prod 8/8
pnpm cross-env \
	Browser=false \
	Bundle=false \
	Clean=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug

echo "--- All 16 permutations generated ---"
