import { writeFile, readFile } from "fs"

export interface AccessTokenStore {
    store(accessToken: string): Promise<void>
    retrieve(): Promise<string | null>
}

export class MemoryAccessTokenStore implements AccessTokenStore {
    accessToken: string | null = null

    async store(accessToken: string) {
        this.accessToken = accessToken
    }

    async retrieve() {
        return this.accessToken
    }
}

export class FileAccessTokenStore implements AccessTokenStore {
    constructor(public path: string) { }

    async store(accessToken: string) {
        return new Promise<void>((resolve, reject) => {
            writeFile(this.path, JSON.stringify({ accessToken }), err => err ? reject(err) : resolve())
        })
    }

    async retrieve() {
        return new Promise<string>((resolve, reject) => {
            readFile(this.path, (err, data) => err ? reject(err) : resolve(JSON.parse(data.toString()).accessToken))
        })
    }
}
