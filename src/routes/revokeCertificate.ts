import { CertifierRoute } from '../CertifierServer'

export const revokeCertificate: CertifierRoute = {
  type: 'post',
  path: '/revokeCertificate',
  summary: 'Revokes a previously issued identity certificate',
  parameters: {
    serialNumber: 'abc'
  },
  exampleResponse: {
    status: 'success'
  },
  func: async (req, res, server) => {
    try {
      // Make sure only authorized users can revoke certificates
      if (req.auth.identityKey !== (await server.wallet.getPublicKey({ identityKey: true })).publicKey) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_UNAUTHORIZED',
          description: 'You are not authorized to access this route!'
        })
      }

      // Make sure the required params are provided
      if (req.body.serialNumber === undefined) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_PARAMS',
          description: 'Insufficient query parameters!'
        })
      }

      // TODO: Get the revocation data from your storage, and use createAction to spend the outpoint.
      // const revocationData = await server.getRevocationData(req.body.identityKey, req.body.serialNumber)
      // if (!revocationData) {
      //   return res.status(400).json({
      //     status: 'error',
      //     code: 'ERR_MISSING_REVOCATION_DATA',
      //     description: 'Insufficient data to revoke certificate!'
      //   })
      // }

      // TODO: Save record of revoking the certificate
      // await server.insertRevocationRecord(revocationData._id, tx)

      return res.status(200).json({
        status: 'success',
        description: 'Certificate successfully revoked!'
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