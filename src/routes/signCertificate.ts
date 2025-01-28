/* eslint-disable @typescript-eslint/no-unused-vars */
import { Certificate, CertificateFieldNameUnder50Bytes, CreateActionArgs, createNonce, MasterCertificate, PushDrop, Random, SymmetricKey, Utils, verifyNonce } from '@bsv/sdk'
import { certificateFields } from '../certificates/genericCert'
import { CertifierRoute } from '../CertifierServer'

/*
 * This route handles signCertificate for the acquireCertificate protocol.
 *
 * It validates the certificate signing request (CSR) received from the client,
 * decrypts and validates the field values,
 * and signs the certificate and its encrypted field values.
 *
 * The validated and signed certificate is returned to the client where the client saves their copy.
 */
export const signCertificate: CertifierRoute = {
  type: 'post',
  path: '/signCertificate',
  summary: 'Validate and sign a new certificate.',
  exampleBody: {
    type: 'jVNgF8+rifnz00856b4TkThCAvfiUE4p+t/aHYl1u0c=',
    clientNonce: 'VhQ3UUGl4L76T9v3M2YLd/Es25CEwAAoGTowblLtM3s=',
    fields: {
      domain: '4Rp/1H7RKPE5zxhzIM5C098sRpvxRlfugVKum6spOGMQ15JBaAh+wntQuxa656JPh3iQ88nDQhqdjzE=',
      identity: 'LZzi8GCRF4SjU63lTorT9ej/Nb8MhW1hASeiJSYT7VOO+pMXJXVingKc+3+ZSW82oIl6BA==',
      when: 'flSOcvWx+MSunYkGeBRkTlj9aDlHxYADecf3Lr13gh/ndrJtouvB+3/75o3C4jpwG2550nxWAHBgR6s5oW+K5PDzKj9G1nPN',
      stake: '1Y4Z1a216atKFQOrUeU+xz8j4PdbD9bIZblHeKMjJNcI1MZYVP0KO6D0LCN0w7A66Pwx2g=='
    },
    keyring: {
      domain: 'onytj0JwhbzNZIhyurV51fPuHV7EL+HtcABrlFTw9kKO49sUQW46QZyH68lk5rTG3FzVJ2ciO1gH1O+frqvwYWzOQPlt5W9WI8IKQUDfuY4=',
      identity: '6gwVIU2mfA7Nxv25xeHUUAM2UPR2alFELrRZv64BgzkHhyvn/Lp7242GIn31kk3+1pQkAjTWJBId62qMuCw5futNxlrEtlJqRmj2KhXkw/c=',
      when: 'TuY8JppuF5BwFRnUdx/CYpRjnUZgxlYqUMrqE6FtMZdy3Kg5SHHnoHK4o9tjoMZE4Ef62v5CQE4z3ONz09r3iTaiWWPL7D9afnEzwkIMzV4=',
      stake: 'Eb8Nc9euJNuXNDRH4/50EQBbSRWWEJ5AvJKB/BFHNWcGIljSt1jE2RMQJmJPXi/OkaQuJuT0CGduPDlh3WbBtBztWXPzxcgdIifNpkV9Cp4='
    }
  },
  exampleResponse: {
    certificate: {
      type: 'jVNgF8+rifnz00856b4TkThCAvfiUE4p+t/aHYl1u0c=',
      subject: '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8',
      serialNumber: 'C9JwOFjAqOVgLi+lK7HpHlxHyYtNNN/Fgp9SJmfikh0=',
      fields: {
        domain: '0qfi4dzxZ/+tdiDViZXOPSOSo38hHNpH89+01Rt1JaCldL+zFHhkhcYt5XO5Bd7z3yUt1zP+Sn0hq64=',
        identity: 'f6euJ2qlRS3VRyCY1qD2fcdloUBLsDr98gqNyv/7QzKjUKo2gYQ11mzFGB/lxqAbifL4IQ==',
        when: 'kppntXMUk035dZpTWgshdGqJPcSBvgaUG/qYEtKgOAmsNIe0wndEkUeMVqvyo5RuIrbAspbEpY3dn+J2U7HvRtmCNR9ZxEEJ',
        stake: 'cVfowEAzvbFbAq6xIYcqi0yosFzUIcWWzCIyV0S53nMa//7JVJgZyATANog7absKajq6Qw=='
      },
      revocationOutpoint: '000000000000000000000000000000000000000000000000000000000000000000000000',
      certifier: '025384871bedffb233fdb0b4899285d73d0f0a2b9ad18062a062c01c8bdb2f720a',
      signature: '3045022100a613d9a094fac52779b29c40ba6c82e8deb047e45bda90f9b15e976286d2e3a7022017f4dead5f9241f31f47e7c4bfac6f052067a98021281394a5bc859c5fb251cc'
    },
    serverNonce: 'UFX3UUGl4L76T9v3M2YLd/Es25CEwAAoGTowblLtM3s='
  },
  func: async (req, res, server) => {
    try {
      const { clientNonce, type, fields, keyring } = req.body
      // Validate params
      try {
        server.certifierSignCheckArgs(req.body)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid parameters'
        return res.status(400).json({
          status: 'error',
          description: message
        })
      }

      // Verify the client actually created the provided nonce
      await verifyNonce(clientNonce, server.wallet, req.auth.identityKey)

      // Server creates a random nonce that the client can verify
      const serverNonce = await createNonce(server.wallet, req.auth.identityKey)
      // The server compute a serial number from the client and server nonce
      const { hmac } = await server.wallet.createHmac({
        data: Utils.toArray(clientNonce + serverNonce, 'base64'),
        protocolID: [2, 'certificate issuance'],
        keyID: serverNonce + clientNonce,
        counterparty: req.auth.identityKey
      })
      const serialNumber = Utils.toBase64(hmac)
      const decryptedFields: Record<CertificateFieldNameUnder50Bytes, string> = {}

      // Decrypt and verify fields
      // TODO: Move to shared helper function in ts-sdk
      try {
        // Note: we want to iterate through all fields, not just masterKeyring keys/value pairs.
        for (const fieldName of Object.keys(fields)) {
          const { plaintext: fieldRevelationKey } = await server.wallet.decrypt({
            ciphertext: Utils.toArray(keyring[fieldName], 'base64'),
            counterparty: req.auth.identityKey,
            ...Certificate.getCertificateFieldEncryptionDetails(serialNumber, fieldName)
          })

          const fieldValue = new SymmetricKey(fieldRevelationKey).decrypt(Utils.toArray(fields[fieldName], 'base64'))
          decryptedFields[fieldName] = Utils.toUTF8(fieldValue as number[])
        }
      } catch (e) {
        throw new Error('Failed to decrypt all certificate fields.')
      }

      // TODO: Validate the decryptedFields based on your specific requirements and the certificate type.
      // If previous validation was done by a third-party service (ex. Persona API), you can check the results here.
      // Ex. await server.getVerificationProof(decryptedFields.metadata.verificationId)

      // Create a revocation outpoint
      const revocationOutputTags: string[] = []
      for (const [fieldName, fieldValue] of Object.entries(decryptedFields)) {
        // Create tags to find this output based on metadata
        // Ex. { firstName: 'John', lastName: 'Smith' }
        const { hmac: hashedField } = await server.wallet.createHmac({
          protocolID: [2, 'revocation output tagging'],
          keyID: `${serialNumber} ${fieldName}`,
          counterparty: req.auth.identityKey,
          data: Utils.toArray(fieldValue, 'utf8')
        })
        revocationOutputTags.push(`${fieldName} ${Utils.toBase64(hashedField)}`)
      }

      // Create a locking script the serial number as push data
      // Use random data for key derivation to prevent key-reuse
      const derivationPrefix = Utils.toBase64(Random(10))
      const derivationSuffix = Utils.toBase64(Random(10))
      // Note: The revocation output could contain encrypted metadata the certifier wants to keep track of
      // TODO: Make this 1 of 2 so that the subject can revoke the certificate as well.
      const lockingScript = await new PushDrop(server.wallet).lock(
        [Utils.toArray(serialNumber)], // Do we want this serial number to be public?
        [2, 'certificate revocation'],
        `${derivationPrefix} ${derivationSuffix}`,
        req.auth.identityKey
      )

      // Create certificate revocation output
      const args: CreateActionArgs = {
        description: 'New certificate revocation output',
        outputs: [{
          lockingScript: lockingScript.toHex(),
          satoshis: 1,
          outputDescription: 'Certificate revocation output',
          basket: 'certificate revocation',
          tags: [`certificate-revocation-for-${req.auth.identityKey}`, ...revocationOutputTags],
          customInstructions: JSON.stringify({
            derivationPrefix,
            derivationSuffix
          })
        }]
      }

      const { txid: revocationTxid } = await server.wallet.createAction(args)

      const signedCertificate = new Certificate(
        type,
        serialNumber,
        req.auth.identityKey,
        server.wallet.identityKey,
        `${revocationTxid}.0`, // TODO: verify revocation outpoint format
        fields
      )

      await signedCertificate.sign(server.wallet)

      // TODO: Save certificate data and revocation key derivation information
      // Ex. await saveCertificate(req.authrite.identityKey, certificate, tx, derivationPrefix, derivationSuffix)

      // Returns signed cert to the requester
      return res.status(200).json({
        certificate: signedCertificate,
        serverNonce
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'An internal error has occurred.'
      })
    }
  }
}
