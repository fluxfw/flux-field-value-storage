#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path/posix";

let flux_shutdown_handler = null;
try {
    flux_shutdown_handler = (await import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs")).FluxShutdownHandler.new();

    const web_root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "UI");

    await (await import("../../flux-pwa-generator/src/FluxPwaGenerator.mjs")).FluxPwaGenerator.new()
        .generateIndexHtmls(
            join(web_root, "Pwa", "manifest.json"),
            join(web_root, "index.html"),
            "Pwa/manifest.json",
            "index.mjs"
        );
} catch (error) {
    console.error(error);

    if (flux_shutdown_handler !== null) {
        await flux_shutdown_handler.shutdown(
            1
        );
    } else {
        process.exit(1);
    }
}
