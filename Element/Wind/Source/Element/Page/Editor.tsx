import { Suspense, lazy } from "solid-js";

const Action = lazy(() => import("@Context/Action.js"));

// TODO: UNCOMMENT
// const Connection = lazy(() => import("@Context/Connection.js"));

const Editor = lazy(() => import("@Element/Editor.js"));

// TODO: UNCOMMENT
// const Store = lazy(() => import("@Context/Store.js"));

export default () => (
	<Suspense>
		{/*
		// TODO: UNCOMMENT
		<Store
			Data={
				new Map([
					["Identifier", "Identifier"],
					["Key", "Key"],
				])
			}>
			<Suspense>
				<Connection>
					<Suspense> */}
		<div class="flex flex-col">
			<main class="flex grow justify-center">
				<div class="flex grow self-center">
					<div class="container">
						<div class="grid min-h-screen content-start gap-7 py-9">
							<div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10">
								<div class="order-last lg:order-first">
									<Suspense>
										<Action>
											<Suspense>
												<div class="p-5">
													<Editor Type="HTML" />
												</div>
											</Suspense>
											<Suspense>
												<div class="p-5">
													<Editor Type="CSS" />
												</div>
											</Suspense>
											<Suspense>
												<div class="p-5">
													<Editor Type="TypeScript" />
												</div>
											</Suspense>
										</Action>
									</Suspense>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
		{/*
					// TODO: UNCOMMENT
					</Suspense>
				</Connection>
			</Suspense>
		</Store> */}
	</Suspense>
);
