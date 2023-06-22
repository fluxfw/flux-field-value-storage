#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path/posix";

let flux_shutdown_handler = null;
try {
    flux_shutdown_handler = (await import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs")).FluxShutdownHandler.new();

    const flux_pwa_generator = (await import("../../flux-pwa-generator/src/FluxPwaGenerator.mjs")).FluxPwaGenerator.new();

    const web_root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "UI");
    const manifest_folder = join(web_root, "Manifest");
    const manifest_json_file = join(manifest_folder, "manifest.json");

    await flux_pwa_generator.generateManifestJsons(
        join(manifest_folder, "manifest-template.json"),
        manifest_json_file
    );

    await flux_pwa_generator.generateIcons(
        join(web_root, "Icon", "icon-template.svg"),
        manifest_json_file
    );

    await flux_pwa_generator.generateIndexHtmls(
        join(web_root, "index-template.html"),
        join(web_root, "index.html"),
        manifest_json_file
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
