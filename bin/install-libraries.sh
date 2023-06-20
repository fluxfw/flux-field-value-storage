#!/usr/bin/env sh

set -e

bin="`dirname "$0"`"
root="$bin/.."
libs="$root/.."

checkAlreadyInstalled() {
    if [ `ls "$libs" | wc -l` != "1" ]; then
        echo "Already installed" >&2
        exit 1
    fi
}

installLibrary() {
    (mkdir -p "$libs/$1" && cd "$libs/$1" && wget -O - "$2" | tar -xz --strip-components=1)
}

checkAlreadyInstalled

(cd "$libs" && npm install --no-save mongodb@5.2.0)

installLibrary flux-authentication-backend https://github.com/fluxfw/flux-authentication-backend/archive/refs/tags/v2023-04-20-2.tar.gz

installLibrary flux-button-group https://github.com/fluxfw/flux-button-group/archive/refs/tags/v2023-06-05-1.tar.gz

installLibrary flux-color-scheme https://github.com/fluxfw/flux-color-scheme/archive/refs/tags/v2023-06-05-1.tar.gz

installLibrary flux-config-api https://github.com/fluxfw/flux-config-api/archive/refs/tags/v2023-06-08-1.tar.gz

installLibrary flux-css-api https://github.com/fluxfw/flux-css-api/archive/refs/tags/v2023-05-30-1.tar.gz

installLibrary flux-form https://github.com/fluxfw/flux-form/archive/refs/tags/v2023-06-19-1.tar.gz

installLibrary flux-http-api https://github.com/fluxfw/flux-http-api/archive/refs/tags/v2023-06-19-1.tar.gz

installLibrary flux-loading-spinner https://github.com/fluxfw/flux-loading-spinner/archive/refs/tags/v2023-05-30-1.tar.gz

installLibrary flux-mongo-db-connector https://github.com/fluxfw/flux-mongo-db-connector/archive/refs/tags/v2023-04-20-2.tar.gz

installLibrary flux-overlay https://github.com/fluxfw/flux-overlay/archive/refs/tags/v2023-06-19-1.tar.gz

installLibrary flux-pwa-api https://github.com/fluxfw/flux-pwa-api/archive/refs/tags/v2023-06-20-2.tar.gz

installLibrary flux-pwa-generator https://github.com/fluxfw/flux-pwa-generator/archive/refs/tags/v2023-06-20-2.tar.gz

installLibrary flux-shutdown-handler https://github.com/fluxfw/flux-shutdown-handler/archive/refs/tags/v2023-03-16-1.tar.gz

installLibrary flux-table https://github.com/fluxfw/flux-table/archive/refs/tags/v2023-06-02-1.tar.gz

installLibrary flux-value-format https://github.com/fluxfw/flux-value-format/archive/refs/tags/v2023-06-08-1.tar.gz

installLibrary mime-db https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz
