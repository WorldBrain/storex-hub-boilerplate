import { createMultiApiTestFactory, TestSetup, MultiApiOptions } from '@worldbrain/storex-hub/lib/tests/api/index.tests'
import { Application } from "./application"

describe('Boilerplate', () => {
    const it = createMultiApiTestFactory()

    async function setupTest(testOptions: {
        createSession: TestSetup<MultiApiOptions>['createSession']
    }) {
        const application = new Application()
        const session = await testOptions.createSession({ type: 'websocket', callbacks: application.getCallbacks() })
        application.logger = () => { }
        await application.setup({
            client: session.api,
        })
        await application.initializeSession()

        return { application: application }
    }

    it('should work', async ({ createSession }) => {
        const { application: application } = await setupTest({ createSession })
        // do something with the application
    })
})
