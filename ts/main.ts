import io from 'socket.io-client'
import { createStorexHubSocketClient } from '@worldbrain/storex-hub/lib/client'
import { Application } from './application'
import { FileAccessTokenStore } from './access-key'

export async function main(options?: {
    port?: number
}) {
    const port = options?.port || (process.env.NODE_ENV === 'production' ? 50482 : 50483)
    const socket = io(`http://localhost:${port}`)
    const application = new Application({ accessToken: new FileAccessTokenStore('./config.json') })

    console.log('Connecting to Storex Hub')
    const client = await createStorexHubSocketClient(socket, { callbacks: application.getCallbacks() })
    await application.setup({
        client,
    })

    application.logger('Connected to Storex Hub')

    socket.on('reconnect', async () => {
        application.logger('Re-connected to Storex Hub')
        await application.initializeSession()
    })
    socket.on('disconnect', async (reason: string) => {
        application.logger('Lost connection to Storex Hub:', reason)
    })

    application.logger('Setup complete')
}

if (require.main === module) {
    main()
}
