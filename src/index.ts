/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import {
  test,
  Services,
  StorageKnex,
  table,
  WalletStorageManager,
  WalletStorageServerOptions,
  StorageServer,
  Wallet,
  sdk
} from 'wallet-storage'
import { Knex, knex as makeKnex } from 'knex'
import { spawn } from 'child_process'
import * as dotenv from 'dotenv'
import { CertifierServer, CertifierServerOptions } from './CertifierServer'

dotenv.config()

// Load environment variables
const {
  NODE_ENV = 'development',
  HTTP_PORT = 3998,
  SERVER_PRIVATE_KEY,
  KNEX_DB_CONNECTION
} = process.env;

export let certifierPublicKey: string = ''

async function setupCertifierServer(): Promise<{
  server: CertifierServer
}> {
  try {
    if (!SERVER_PRIVATE_KEY) {
      throw new Error('SERVER_PRIVATE_KEY must be set')
    }
    if (!KNEX_DB_CONNECTION) {
      throw new Error('KNEX_DB_CONNECTION must be set')
    }
    // Parse database connection details
    const connection = JSON.parse(KNEX_DB_CONNECTION)
    const databaseName = connection['database']

    const certifierPrivateKey = bsv.PrivateKey.fromString(SERVER_PRIVATE_KEY)
    certifierPublicKey = certifierPrivateKey.toPublicKey().toString()

    const chain: sdk.Chain = NODE_ENV === 'development' ? 'test' : 'main'

    const { wallet } = await test._tu.createTestWalletWithStorageClient({
      chain,
      rootKeyHex: certifierPrivateKey.toHex(),
      endpointUrl: undefined // Choose you wallet server or build a different kind of wallet.
    })

    /*
    // You can also use an imported knex configuration file.
    const knexConfig: Knex.Config = {
      client: 'mysql2',
      connection,
      useNullAsDefault: true,
      pool: {
        min: 2,
        max: 10,
        createTimeoutMillis: 10000,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 600000,
        reapIntervalMillis: 60000,
        createRetryIntervalMillis: 200,
        propagateCreateError: false
      }
    }
    const knex = makeKnex(knexConfig)
    const chain = NODE_ENV === 'production' ? 'main' : 'test'

    // Initialize storage components
    const rootKey = bsv.PrivateKey.fromHex(SERVER_PRIVATE_KEY)
    const storageIdentityKey = rootKey.toPublicKey().toString()

    const activeStorage = new StorageKnex({
      chain,
      knex,
    })

    await activeStorage.migrate(databaseName, storageIdentityKey)
    const settings = await activeStorage.makeAvailable()

    const storage = new WalletStorageManager(settings.storageIdentityKey, activeStorage)
    await storage.makeAvailable()

    // Initialize wallet components
    const services = new Services(chain)
    const keyDeriver = new bsv.KeyDeriver(rootKey)
    const wallet = new Wallet({ chain, keyDeriver, storage, services })
    */

    // Set up server options
    const serverOptions: CertifierServerOptions = {
      port: Number(HTTP_PORT),
      wallet,
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
    //console.log(JSON.stringify(context.settings, null, 2))

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
})()