# Storex Hub boilerplate

This is a minimal boilerplate for both Storex Hub external applications, and plugins. It does basic things like:

- Setting up a connection
- Making sure you stay identified even on reconnect
- Storing the access token in a JSON file (if running as an external app)
- Setting up a `StorageModule` and making it usable with Storex Hub

## Getting started

The basics:

- `git clone git@github.com:WorldBrain/storex-hub-boilerplate.git`
- `cd storex-hub-boilerplate && rm -rf .git`
- `yarn`
- Change `APP_NAME` in `ts/constants.ts` to something like `org.your-org.your-plugin` (reverse domain scheme)
- Change `identifier`in `manifest.json` to to same as `APP_NAME`

To run as an external app, when for example making a CLI tool (also useble if you're making a front-end):

- `yarn start`

To pack as a plugin and test it, when for example making an integration to an external platform (IPFS, Twitter, etc.):

- `yarn build:dev` or `yarn build:prod`
- `cd <storex-hub-dir>`
- `yarn cli plugin:install <this-repo>/build`

## Documentation

In the [Storex documentation](https://worldbrain.github.io/storex-docs/#/storex-hub/) you can find out more about:

- How to write a plugin
- How to store data in Storex Hub
- How to connect other external apps, like Memex
- How to expose custom functionality through remote calls
