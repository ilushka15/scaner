import Server from "./server";

new Server().start().catch((error: unknown) => {
	console.error("Server kon niet starten.", error);
	process.exitCode = 1;
});
