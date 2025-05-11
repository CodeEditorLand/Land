#!/usr/bin/env bash

pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_OPTIONS=--max-old-space-size=16384 \
	pnpm tauri build \
	--debug

pnpm cross-env \
	Browser=true \
	Bundle=true \
	Clean=true \
	Dependency=Microsoft/VSCode \
	NODE_ENV=production \
	NODE_OPTIONS=--max-old-space-size=16384 \
	pnpm tauri build
