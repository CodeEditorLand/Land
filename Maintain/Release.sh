#!/usr/bin/env bash

pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Compile=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_VERSION=22 \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Element/Maintain/Target/release/Build -- pnpm tauri build
