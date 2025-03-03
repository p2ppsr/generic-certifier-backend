/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import {
  sdk
} from 'wallet-storage'
import { spawn } from 'child_process'
import * as dotenv from 'dotenv'
import { CertifierServer, CertifierServerOptions } from './CertifierServer'
import { Setup } from '@bsv/wallet-toolbox'

dotenv.config()

// Load environment variables
const {
  NODE_ENV = 'development',
  HTTP_PORT = 3998,
  SERVER_PRIVATE_KEY,
  STORAGE_URL,
  KNEX_DB_CONNECTION
} = process.env

export const certifierPublicKey: string = ''

async function setupCertifierServer(): Promise<{
  server: CertifierServer
}> {
  try {
    if (SERVER_PRIVATE_KEY === undefined) {
      throw new Error('SERVER_PRIVATE_KEY must be set')
    }

    // Enable storage as needed --------------------------------
    // if (!KNEX_DB_CONNECTION) {
    //   throw new Error('KNEX_DB_CONNECTION must be set')
    // }
    // Parse database connection details
    // const connection = JSON.parse(KNEX_DB_CONNECTION)
    // You can also use an imported knex configuration file.
    // const knexConfig: Knex.Config = {
    //   client: 'mysql2',
    //   connection,
    //   useNullAsDefault: true,
    //   pool: {
    //     min: 2,
    //     max: 10,
    //     createTimeoutMillis: 10000,
    //     acquireTimeoutMillis: 30000,
    //     idleTimeoutMillis: 600000,
    //     reapIntervalMillis: 60000,
    //     createRetryIntervalMillis: 200,
    //     propagateCreateError: false
    //   }
    // }
    // const knex = makeKnex(knexConfig)

    const chain: sdk.Chain = NODE_ENV === 'development' ? 'test' : 'main'

    // Enable storage as needed --------------------------------
    // const storage = new CertifierStorage(knex, chain)
    // await storage.migrate()
    // await storage.makeAvailable()

    const wallet = await Setup.createWalletClientNoEnv({
      chain,
      rootKeyHex: SERVER_PRIVATE_KEY,
      storageUrl: STORAGE_URL
    })

    // Set up server options
    const serverOptions: CertifierServerOptions = {
      port: Number(HTTP_PORT),
      wallet,
      // undefined, // Storage optional for this example!
      monetize: false,
      calculateRequestPrice: async () => {
        return 0 // Monetize your server here! Price is in satoshis.
      }
    }
    const server = new CertifierServer({}, serverOptions)

    return {
      server
    }
  } catch (error) {
    console.error('Error setting up Wallet Storage and Monitor:', error)
    throw error
  }
}

// Main function to start the server
(async () => {
  try {
    const context = await setupCertifierServer()
    console.log('generic-certifier server v0.1.0')

    context.server.start()
    console.log('generic-certifier server started')

    // Conditionally start nginx
    if (NODE_ENV !== 'development') {
      console.log('Spawning nginx...')
      spawn('nginx', [], { stdio: ['inherit', 'inherit', 'inherit'] })
      console.log('nginx is up!')
    }
  } catch (error) {
    console.error('Error starting server:', error)
  }
})().catch(e => console.error(e))
