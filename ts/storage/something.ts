import { StorageModule, StorageModuleConfig } from '@worldbrain/storex-pattern-modules'

export class SomethingStorage extends StorageModule {
    getConfig = (): StorageModuleConfig => ({
        collections: {},
        operations: {}
    })
}
