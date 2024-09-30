#!/bin/bash

Current=$(\cd -- "$(\dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && \pwd)

Dependency=(
	"./"
	"./Dependency/"
	"./Dependency/Biome/"
	"./Dependency/Biome/Dependency/"
	"./Dependency/Land/"
	"./Dependency/Land/Cargo/"
	"./Dependency/Land/Cargo/Runtime/"
	"./Dependency/Land/Dependency/"
	"./Dependency/Land/Dependency/LandExplorerCommand/"
	"./Dependency/Land/Dependency/LandLoader/"
	"./Dependency/Land/Dependency/LandMonoDebug/"
	"./Dependency/Land/Dependency/LandOniguruma/"
	"./Dependency/Land/Dependency/LandSpringBootDashboard/"
	"./Dependency/Land/Dependency/LandWASM/"
	"./Dependency/Land/NPM/"
	"./Dependency/OXC/"
	"./Dependency/OXC/Dependency/"
	"./Dependency/Rolldown/"
	"./Dependency/Rolldown/Dependency/"
	"./Dependency/Rolldown/Dependency/Rolldown/"
	"./Dependency/SWC/"
	"./Dependency/SWC/Dependency/"
	"./Dependency/SWC/Dependency/NodeSWC/"
	"./Dependency/SWC/Dependency/NodeSWC/swc/"
	"./Dependency/SWC/Dependency/Plugins/"
	"./Dependency/SWC/Dependency/SWC/"
	"./Dependency/Tauri/"
	"./Dependency/Tauri/Dependency/"
	"./Dependency/Tauri/Dependency/CargoMobile2/"
	"./Dependency/Tauri/Dependency/Deno/"
	"./Dependency/Tauri/Dependency/Deno/deno_typescript/typescript/"
	"./Dependency/Tauri/Dependency/JavaScriptCoreRS/"
	"./Dependency/Tauri/Dependency/Tao/"
	"./Dependency/Tauri/Dependency/TauriDocs/"
	"./Dependency/Tauri/Dependency/WebKit2GTKRS/"
	"./Dependency/Tauri/Dependency/Winit/"
	"./Elements/"
)

for Dependency in "${Dependency[@]}"; do
	(
		cd "$Current/$Dependency" || exit

		git add .
		git ecommit
		git push
		git pull

		cd - || exit
	) &
done

wait
