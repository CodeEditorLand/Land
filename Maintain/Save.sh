#!/bin/bash

Current=$(\cd -- "$(\dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && \pwd)

Dependency=(
	"./"
	"./Dependency/"
	"./Dependency/Biome/"
	"./Dependency/Biome/Dependency/"
	"./Dependency/Land/"
	"./Dependency/Land/Dependency/"
	"./Dependency/OXC/"
	"./Dependency/OXC/Dependency/"
	"./Dependency/Rolldown/"
	"./Dependency/Rolldown/Dependency/"
	"./Dependency/SWC/"
	"./Dependency/SWC/Dependency/"
	"./Dependency/Tauri/"
	"./Dependency/Tauri/Dependency/"
	"./Element/"
)

for Dependency in "${Dependency[@]}"; do
	(
		\cd "$Current/../$Dependency" || \exit

		\pwd

		\git add .

		\git ecommit

		\git push

		\git pull

		\cd - || \exit
	) &
done

\wait
