/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CertifierServer.ts
 *
 * A server-side class that "has a" local WalletStorage (like a StorageKnex instance),
 * and exposes it via a JSON-RPC POST endpoint using Express.
 */

import { CertificateFieldNameUnder50Bytes, WalletInterface } from '@bsv/sdk'
import express, { Request, Response } from 'express'
import { AuthMiddlewareOptions, createAuthMiddleware } from '@bsv/auth-express-middleware'
import { createPaymentMiddleware } from '@bsv/payment-express-middleware'
import { Wallet } from 'wallet-storage'
import { CertifierStorage } from './storage'
import * as routes from './routes'

export interface CertifierServerOptions {
  port: number
  wallet: Wallet
  storage: CertifierStorage
  monetize: boolean
  calculateRequestPrice?: (req: Request) => number | Promise<number>
}

export interface CertifierRoute {
  type: 'post' | 'get'
  path: string
  summary: string
  parameters?: object
  exampleBody?: object
  exampleResponse: object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (req: Request, res: Response, server: CertifierServer) => Promise<any>
}

export class CertifierServer {

  private app = express()
  private port: number
  private storage: CertifierStorage
  wallet: Wallet
  private monetize: boolean
  private calculateRequestPrice?: (req: Request) => number | Promise<number>

  constructor(storage: any, options: CertifierServerOptions) {
    this.storage = storage
    this.port = options.port
    this.wallet = options.wallet
    this.storage = options.storage
    this.monetize = options.monetize
    this.calculateRequestPrice = options.calculateRequestPrice

    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.app.use(express.json({ limit: '30mb' }))

    // This allows the API to be used everywhere when CORS is enforced
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', '*')
      res.header('Access-Control-Allow-Methods', '*')
      res.header('Access-Control-Expose-Headers', '*')
      res.header('Access-Control-Allow-Private-Network', 'true')
      if (req.method === 'OPTIONS') {
        // Handle CORS preflight requests to allow cross-origin POST/PUT requests
        res.sendStatus(200)
      } else {
        next()
      }
    })

    const options: AuthMiddlewareOptions = {
      wallet: this.wallet as WalletInterface
    }
    this.app.use(createAuthMiddleware(options))
    if (this.monetize) {
      this.app.use(
        createPaymentMiddleware({
          wallet: this.wallet,
          calculateRequestPrice: this.calculateRequestPrice || (() => 100)
        })
      )
    }

    const theRoutes: CertifierRoute[] = [
      routes.checkVerification,
      routes.confirmCertificate,
      routes.initialRequest,
      routes.revokeCertificate,
      routes.signCertificate,
      routes.verifyAttributes
    ]

    for (const route of theRoutes) {
      this.app[route.type](`${route.path}`, async (req: Request, res: Response) => {
        return route.func(req, res, this)
      })
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`CertifierServer listening at http://localhost:${this.port}`)
    })
  }

  /**
   * Returns revocation data associarted with a user and a certificate
   * @param {string} identityKey
   * @param {string} serialNumber
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  async getRevocationData(identityKey: string, serialNumber: string): Promise<any> {
    // Filter by identity key or certificate serialNumber
    // Only select relevant data
  }

  /**
   * Inserts a new revocation record (consider integration with an overlay network in the future)
   * @param {string} _id
   * @param {string} tx
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  async insertRevocationRecord(id: number, tx: string): Promise<any> {
    // TODO: Add the revocation tx to the revoked certificate
  }

  /**
   * Checks the arguments for the certificate signing request
   * @param {object} args
   * @throws {Error} if any of the required arguments are missing
   */
  certifierSignCheckArgs(args: { clientNonce: string, type: string, fields: Record<string, string>, keyring: Record<string, string> }): void {
    if (!args.clientNonce) {
      throw new Error('Missing client nonce!')
    }
    if (!args.type) {
      throw new Error('Missing certificate type!')
    }
    if (!args.fields) {
      throw new Error('Missing certificate fields to sign!')
    }
    if (!args.keyring) {
      throw new Error('Missing keyring to decrypt fields!')
    }
  }

  /**
   * Returns verification proof for a given search query (in this case a user's identity key)
   * @param {string} identityKey
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getVerificationProof(identityKey: string): Promise<{ verificationId: string, expirationDate: Date }> {
    // Filter by identity key and verificationId
    // Only select relevant data
    // Return the matching result
    return {
      verificationId: 'mockVerificationId',
      expirationDate: new Date(Date.now() + 100000)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async decryptCertificateFields(cert: any, keyring: any)
    : Promise<Record<CertificateFieldNameUnder50Bytes, string>> {
    return {}
  }
}

