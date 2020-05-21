import { PluginEntryFunction, PluginInterface } from "@worldbrain/storex-hub-interfaces/lib/plugins"
import { Application } from "./application"

export const main: PluginEntryFunction = async (input) => {
    const application = new Application({})
    const api = await input.getApi({ callbacks: application.getCallbacks() })

    const plugin: PluginInterface = {
        start: async () => {
            await application.setup({
                client: api,
            })
        },
        stop: async () => {
        }
    }
    return plugin
}
