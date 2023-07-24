export const MANIFEST_TEMPLATE = Object.freeze({
    background_color: "#ffffff",
    categories: Object.freeze([
        "utilities"
    ]),
    description: "flux-field-value-storage",
    dir: "ltr",
    display: "browser",
    icons: Object.freeze([
        {
            purpose: "any",
            sizes: "any",
            src: "../Icon/icon.svg",
            type: "image/svg+xml"
        },
        {
            purpose: "any",
            sizes: "1024x1024",
            src: "../Icon/icon.webp",
            type: "image/webp"
        },
        {
            purpose: "any",
            sizes: "32x32",
            src: "../favicon.ico",
            type: "image/x-icon"
        }
    ].map(icon => Object.freeze(icon))),
    id: "flux-field-value-storage",
    lang: "en",
    name: "flux-field-value-storage",
    scope: "..",
    short_name: "field-value-storage",
    start_url: "..",
    theme_color: "#000080"
});
