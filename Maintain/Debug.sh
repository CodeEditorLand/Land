#!/usr/bin/env bash

pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Compile=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Build -- pnpm tauri build --debug
