#!/usr/bin/env bash

Current=$(\cd -- "$(\dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && \pwd)

Dependency=(
	"./"
	"./Dependency/"
	"./Dependency/Biome/"
	"./Dependency/Biome/Cargo/"
	"./Dependency/Biome/Dependency/"
	"./Dependency/Biome/NPM/"
	"./Dependency/Microsoft/"
	"./Dependency/Microsoft/Cargo/"
	"./Dependency/Microsoft/Dependency/"
	"./Dependency/Microsoft/NPM/"
	"./Dependency/Microsoft/NPM/Common/"
	"./Dependency/Microsoft/NPM/Ingress/"
	"./Dependency/OXC/"
	"./Dependency/OXC/Cargo/"
	"./Dependency/OXC/Dependency/"
	"./Dependency/OXC/NPM/"
	"./Dependency/Rolldown/"
	"./Dependency/Rolldown/Cargo/"
	"./Dependency/Rolldown/Dependency/"
	"./Dependency/Rolldown/NPM/"
	"./Dependency/SWC/"
	"./Dependency/SWC/Cargo/"
	"./Dependency/SWC/Dependency/"
	"./Dependency/SWC/NPM/"
	"./Dependency/Tauri/"
	"./Dependency/Tauri/Cargo/"
	"./Dependency/Tauri/Dependency/"
	"./Dependency/Tauri/NPM/"
	"./Dependency/Vercel/"
	"./Dependency/Vercel/Cargo/"
	"./Dependency/Vercel/Dependency/"
	"./Dependency/Vercel/NPM/"
	"./Element/"
	"./Element/Echo/"
	"./Element/Mountain/"
	"./Element/Output/"
	"./Element/Rest/"
	"./Element/River/"
	"./Element/Sky/"
	"./Element/Sun/"
	"./Element/Wind/"
)

for Dependency in "${Dependency[@]}"; do
	# (
	\cd "$Current/../$Dependency" || \exit

	\pwd

	\git add .

	\git ecommit

	\git push

	\git pull

	\cd - || \exit
	# ) &
done

# \wait
