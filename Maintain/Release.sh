#!/usr/bin/env bash

pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build
