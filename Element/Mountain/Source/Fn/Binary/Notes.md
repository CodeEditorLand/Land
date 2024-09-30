Parametarized builder:

```rs
Builder
	.setup(|Tauri| {
		let _ = tauri::WebviewWindowBuilder::new(
			Tauri,
			"Sampler",
			tauri::WebviewUrl::App("index.html".into()),
		);

		Ok(())
	})
	.enable_macos_default_menu(false)

	// TODO: Compile Views with SWC on request
	// Parametarize actions as such async://file?path=...&action=read
	// Register all actions such as file, etc. as functions in `Echo`
	// .register_asynchronous_uri_scheme_protocol("async", |_,_,_| {})
	// .register_uri_scheme_protocol("sync",|_,_| {})
	.device_event_filter(tauri::DeviceEventFilter::Always)
	.run(tauri::generate_context!())
	.expect("Cannot run.");
```

```rs
 let Sampler = tauri::WebviewWindowBuilder::new(
		Tauri,
		"Sampler",
		tauri::WebviewUrl::App("index.html".into()),
	)
	.visible(false)
	.always_on_top(false)
	.decorations(false)
	.fullscreen(false)
	.focused(false)
	.title("")
	.position(0.0, 0.0)

	.build()
	.expect("Cannot build.");

	let Scaler: f64 = Sampler
		.primary_monitor()
		.expect("Cannot primary_monitor.")
		.expect("Cannot primary_monitor.")
		.scale_factor();

	// Position a window for each monitor
	for Monitor in Sampler.available_monitors().expect("Cannot available_monitors.")
	{
		let Label = regex::Regex::new(r"[^a-zA-Z0-9\s]")
			.unwrap()
			.replace_all(Monitor.name().expect("Cannot name."), "");

		let SizeMonitor = Monitor.size().to_logical::<i32>(Scaler);
		let PositionMonitor = Monitor.position().to_logical::<i32>(Scaler);

		let Daemon = tauri::WebviewWindowBuilder::new(
			Tauri,
			"Daemon",
			tauri::WebviewUrl::App("index.html".into()),
		)

		.visible_on_all_workspaces(true)
		.effects(tauri::utils::config::WindowEffectsConfig {
			..Default::default()
		})

		.inner_size(SizeMonitor.width.into(), SizeMonitor.height.into())
		.position(PositionMonitor.x.into(), PositionMonitor.y.into());

		.additional_browser_args("")
		.always_on_top(true)
		.center()
		.content_protected(true)
		.drag_and_drop(true)
		.focused(true)

		.incognito(true)
		.maximizable(false)
		.maximized(false)
		.minimizable(false)
		.resizable(false)
		.shadow(false)
		.skip_taskbar(true)

		Daemon.set_cursor_grab(false).expect("Cannot set_cursor_grab.");
		Daemon.set_ignore_cursor_events(true).expect("Cannot set_ignore_cursor_events.");
	}
```
