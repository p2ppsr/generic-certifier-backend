const bsv = require('babbage-bsv')
const { Ninja } = require('ninja-base')
const pushdrop = require('pushdrop')
const { getPaymentPrivateKey } = require('sendover')
const { getRevocationData, insertRevocationRecord } = require('../utils/databaseHelpers')

const {
  SERVER_PRIVATE_KEY,
  DOJO_URL
} = process.env

module.exports = {
  type: 'post',
  path: '/revokeCertificate',
  summary: 'Revokes a previously issued identity certificate',
  parameters: {
    identityKey: 'identityKeyToRevoke',
    serialNumber: 'abc'
  },
  exampleResponse: {
    status: 'verified | notVerified'
  },
  func: async (req, res) => {
    try {
      // Make sure only authorized users can revoke certificates
      if (req.authrite.identityKey !== new bsv.PrivateKey(SERVER_PRIVATE_KEY).publicKey.toString('hex')) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_UNAUTHORIZED',
          description: 'You are not authorized to access this route!'
        })
      }

      // Make sure the required params are provided
      if (!req.body.identityKey && !req.body.serialNumber) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_PARAMS',
          description: 'Insufficient query parameters!'
        })
      }

      const revocationData = await getRevocationData(req.body.identityKey, req.body.serialNumber)

      if (!revocationData) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_MISSING_REVOCATION_DATA',
          description: 'Insufficient data to revoke certificate!'
        })
      }

      // Create an actual spendable revocation outpoint
      const ninja = new Ninja({
        privateKey: SERVER_PRIVATE_KEY,
        config: {
          dojoURL: DOJO_URL
        }
      })

      // Random key derivation data
      const derivationPrefix = revocationData.derivationPrefix
      const derivationSuffix = revocationData.derivationSuffix
      const invoiceNumber = `2-3241645161d8-${derivationPrefix} ${derivationSuffix}`

      // Derive a new key for the revocation tx locking script
      const derivedPrivateKey = getPaymentPrivateKey({
        recipientPrivateKey: SERVER_PRIVATE_KEY,
        senderPublicKey: new bsv.PrivateKey(SERVER_PRIVATE_KEY).publicKey.toString('hex'),
        invoiceNumber
      })

      const prevTx = new bsv.Transaction(revocationData.tx.rawTx)
      const defaultVout = 0

      // Create a unlocking script for the pushdrop revocation token
      const unlockingScript = await pushdrop.redeem({
        prevTxId: revocationData.tx.txid,
        outputIndex: defaultVout,
        lockingScript: prevTx.outputs[defaultVout].script.toHex(),
        outputAmount: prevTx.outputs[defaultVout].satoshis,
        key: derivedPrivateKey
      })

      // Create a new Bitcoin transaction to spend the revocation token
      const tx = await ninja.getTransactionWithOutputs({
        inputs: {
          [revocationData.tx.txid]: {
            ...revocationData.tx,
            outputsToRedeem: [{
              index: defaultVout,
              unlockingScript
            }]
          }
        },
        labels: [
          'genericCert'
        ],
        note: 'GenericCert Certificate Revocation',
        autoProcess: true
      })

      // Save record of revoking the certificate
      await insertRevocationRecord(revocationData._id, tx)

      return res.status(200).json({
        status: 'success',
        description: `Certificate ${revocationData.certificate.serialNumber} successfully revoked!`
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'An internal error has occurred.'
      })
    }
  }
}
