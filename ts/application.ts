import { StorexHubApi_v0, StorexHubCallbacks_v0 } from '@worldbrain/storex-hub/lib/public-api'
import { StorageOperationChangeInfo } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { APP_NAME } from './constants'
import { SomethingStorage } from './storage/something'
import { AccessTokenStore } from './access-key'

type Logger = (...args: any[]) => void

export class StorageOperationError extends Error { }

export class Application {
    accessToken?: AccessTokenStore
    client!: StorexHubApi_v0
    somethingStorage!: SomethingStorage
    logger: Logger
    schemaUpdated = false

    constructor(options?: {
        accessToken?: AccessTokenStore
        logger?: Logger
    }) {
        this.accessToken = options?.accessToken
        this.logger = options?.logger ?? console.log.bind(console)
    }

    getCallbacks(): StorexHubCallbacks_v0 {
        return {
            handleEvent: async ({ event }) => {
                if (event.type === 'storage-change' && event.app === 'memex') {
                    this.handleMemexStorageChange(event.info)
                }
                else if (event.type === 'app-availability-changed' && event.app === 'memex') {
                    this.logger('Changed Memex availability:', event.availability ? 'up' : 'down')
                    if (event.availability) {
                        this.tryToSubscribeToMemex()
                    }
                }
            },
        }
    }

    async setup(options: {
        client: StorexHubApi_v0,
    }) {
        this.client = options.client
        this.somethingStorage = new SomethingStorage({
            storageManager: null as any, operationExecuter: async (context) => {
                const operation = context.render()
                const response = await this.client.executeOperation({ operation })
                if (response.status !== 'success') {
                    throw new StorageOperationError(`Error while exeuting storage operation on Storex Hub: ${response.status}`)
                }
                return response.result
            }
        })
        await this.initializeSession()
    }

    async handleMemexStorageChange(info: StorageOperationChangeInfo<'post'>) {

    }

    async registerOrIdentify() {
        if (!this.accessToken) {
            return
        }

        this.logger(`Identifying with Storex Hub as '${APP_NAME}'`)
        const existingAccessToken = await this.accessToken.retrieve()
        if (existingAccessToken) {
            this.logger(`Found existing access token, using it to identify`)
            const identificationResult = await this.client.identifyApp({
                name: APP_NAME,
                accessToken: existingAccessToken
            })
            if (identificationResult.status !== 'success') {
                throw new Error(`Couldn't identify app '${APP_NAME}': ${identificationResult.status}`)
            }
        }
        else {
            this.logger(`Could not find existing access token, so registering`)
            const registrationResult = await this.client.registerApp({
                name: APP_NAME,
                identify: true,
                remote: true,
            })
            if (registrationResult.status === 'success') {
                const accessToken = registrationResult.accessToken
                await this.accessToken.store(accessToken)
            }
            else {
                throw new Error(`Couldn't register app '${APP_NAME}'": ${registrationResult.status}`)
            }
        }
        this.logger(`Successfuly identified with Storex Hub as '${APP_NAME}'`)
    }

    async tryToSubscribeToMemex() {
        const subscriptionResult = await this.client.subscribeToEvent({
            request: {
                type: 'storage-change',
                app: 'memex',
                collections: ['tags'],
            }
        })
        if (subscriptionResult.status === 'success') {
            this.logger('Successfuly subscribed to Memex storage changes')
        }
        else {
            this.logger('Could not subscribe to Memex storage changes (yet?):', subscriptionResult.status)
        }
    }

    async initializeSession() {
        if (!this.schemaUpdated) {
            await this.client.updateSchema({ schema: { collectionDefinitions: this.somethingStorage.collections } })
            this.schemaUpdated = true
        }

        await this.tryToSubscribeToMemex()
    }
}
