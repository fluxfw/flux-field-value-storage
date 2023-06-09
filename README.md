# flux-field-value-storage

Field value storage

## Set up

*You need to fill placeholders (Wrapped in `%`), create secret files and adjust to your needs (Applies everywhere)*

### Mongo db

You need a mongo db server

[Set up](https://github.com/fluxfw/flux-mongo-db-connector/blob/main/README.md#set-up)

You need to create a mongo db user `flux-field-value-storage` on database `flux-field-value-storage`

### Docker

#### Compose

```yaml
services:
    flux-field-value-storage:
        depends_on:
            - mongo-db
        environment:
            - FLUX_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD_FILE=/run/secrets/flux_field_value_storage_password
            - FLUX_FIELD_VALUE_STORAGE_MONGO_DB_PASSWORD_FILE=/run/secrets/mongo_db_flux_field_value_storage_password
        image: fluxfw/flux-field-value-storage:%version%
        secrets:
            - flux_field_value_storage_password
            - mongo_db_flux_field_value_storage_password
secrets:
    flux_field_value_storage_password:
        file: ./data/secrets/flux_field_value_storage_password
    mongo_db_flux_field_value_storage_password:
        file: ./data/secrets/mongo_db_flux_field_value_storage_password
```

### Config

| Config | Default value | Environment variable | Cli parameter | Config JSON file |
| ------ | ------------- | -------------------- | ------------- | ---------------- |
| Config JSON file<br>(Root entry need to be an object) | *-* | `FLUX_FIELD_VALUE_STORAGE_CONFIG_FILE` | `--config-file ...` | *-* |
| **Authentication password** | *-* | `FLUX_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD`<br>`FLUX_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD_FILE` | `--authentication-password ...`<br>`--authentication-password-file ...` | `"authentication-password": "..."`<br>`"authentication-password-file": "..."` |
| Authentication user | `flux-field-value-storage` | `FLUX_FIELD_VALUE_STORAGE_AUTHENTICATION_USER`<br>`FLUX_FIELD_VALUE_STORAGE_AUTHENTICATION_USER_FILE` | `--authentication-user ...`<br>`--authentication-user-file ...` | `"authentication-user": "..."`<br>`"authentication-user-file": "..."` |
| MongoDb database | `flux-field-value-storage` | `FLUX_FIELD_VALUE_STORAGE_MONGO_DB_DATABASE`<br>`FLUX_FIELD_VALUE_STORAGE_MONGO_DB_DATABASE_FILE` | `--mongo-db-database ...`<br>`--mongo-db-database-file ...` | `"mongo-db-database": "..."`<br>`"mongo-db-database-file": "..."` |
| MongoDb host | `mongo-db` | `FLUX_FIELD_VALUE_STORAGE_MONGO_DB_HOST`<br>`FLUX_FIELD_VALUE_STORAGE_MONGO_DB_HOST_FILE` | `--mongo-db-host ...`<br>`--mongo-db-host-file ...` | `"mongo-db-host": "..."`<br>`"mongo-db-host-file": "..."` |
| **MongoDb password** | *-* | `FLUX_FIELD_VALUE_STORAGE_MONGO_DB_PASSWORD`<br>`FLUX_FIELD_VALUE_STORAGE_MONGO_DB_PASSWORD_FILE` | `--mongo-db-password ...`<br>`--mongo-db-password-file ...` | `"mongo-db-password": "..."`<br>`"mongo-db-password-file": "..."` |
| MongoDb port | `27017` | `FLUX_FIELD_VALUE_STORAGE_MONGO_DB_PORT`<br>`FLUX_FIELD_VALUE_STORAGE_MONGO_DB_PORT_FILE` | `--mongo-db-port ...`<br>`--mongo-db-port-file ...` | `"mongo-db-port": ...`<br>`"mongo-db-port-file": ...` |
| MongoDb user | `flux-field-value-storage` | `FLUX_FIELD_VALUE_STORAGE_MONGO_DB_USER`<br>`FLUX_FIELD_VALUE_STORAGE_MONGO_DB_USER_FILE` | `--mongo-db-user ...`<br>`--mongo-db-user-file ...` | `"mongo-db-user": "..."`<br>`"mongo-db-user-file": "..."` |
| Server disable http if https is used | `true` | `FLUX_FIELD_VALUE_STORAGE_SERVER_DISABLE_HTTP_IF_HTTPS`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_DISABLE_HTTP_IF_HTTPS_FILE` | `--server-disable-http-if-https ...`<br>`--server-disable-http-if-https-file ...` | `"server-disable-http-if-https": ...`<br>`"server-disable-http-if-https-file": "..."` |
| Server HTTPS certificate<br>(HTTPS is only used if this config is set) | *-* | `FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_CERTIFICATE`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_CERTIFICATE_FILE` | `--server-https-certificate ...`<br>`--server-https-certificate-file ...` | `"server-https-certificate": "..."`<br>`"server-https-certificate-file": "..."` |
| Server HTTPS dh param | *-* | `FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_DHPARAM`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_DHPARAM_FILE` | `--server-https-dhparam ...`<br>`--server-https-dhparam-file ...` | `"server-https-dhparam": "..."`<br>`"server-https-dhparam-file": "..."` |
| Server HTTPS private key<br>(HTTPS is only used if this config is set) | *-* | `FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_KEY`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_HTTPS_KEY_FILE` | `--server-https-key ...`<br>`--server-https-key-file ...` | `"server-https-key": "..."`<br>`"server-https-key-file": "..."` |
| Server listen HTTP port<br>(Set to `0` for explicit disable HTTP) | `80` | `FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTP_PORT`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTP_PORT_FILE` | `--server-listen-http-port ...`<br>`--server-listen-http-port-file ...` | `"server-listen-http-port": ...`<br>`"server-listen-http-port-file": "..."` |
| Server listen HTTPS port<br>(Set to `0` for explicit disable HTTPS) | `443` | `FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTPS_PORT`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTPS_PORT_FILE` | `--server-listen-https-port ...`<br>`--server-listen-https-port-file ...` | `"server-listen-https-port": ...`<br>`"server-listen-https-port-file": "..."` |
| Server listen interface | *-* | `FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_INTERFACE`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_LISTEN_INTERFACE_FILE` | `--server-listen-interface ...`<br>`--server-listen-interface-file ...` | `"server-listen-interface": "..."`<br>`"server-listen-interface-file": "..."` |
| Enable server redirects HTTP to HTTPS | `false` | `FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_FILE` | `--server-redirect-http-to-https ...`<br>`--server-redirect-http-to-https-file ...` | `"server-redirect-http-to-https": ...`<br>`"server-redirect-http-to-https-file": "..."` |
| Server redirect HTTP to HTTPS port | `443` | `FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_PORT`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_PORT_FILE` | `--server-redirect-http-to-https-port ...`<br>`--server-redirect-http-to-https-port-file ...` | `"server-redirect-http-to-https-port": ...`<br>`"server-redirect-http-to-https-port-file": "..."` |
| HTTP status code server redirects HTTP to HTTPS | `302` | `FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE`<br>`FLUX_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_FILE` | `--server-redirect-http-to-https-status-code ...`<br>`--server-redirect-http-to-https-status-code-file ...` | `"server-redirect-http-to-https-status-code": ...`<br>`"server-redirect-http-to-https-status-code-file": "..."` |

Required config are **bold**
