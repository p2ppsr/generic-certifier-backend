/* eslint-disable @typescript-eslint/no-unused-vars */
import { certifierPublicKey } from '..'
import { certificateFields, certificateType } from '../certificates/genericCert'
import { CertifierRoute } from '../CertifierServer'
/*
 * This route returns the certifier's public key and certificate types.
 */
export const confirmCertificate: CertifierRoute = {
  type: 'post',
  path: '/identify',
  summary: 'Identify Certifier by returning certifierPublicKey and certificateTypes.',
  exampleResponse: {
    status: 'success',
    certifierPublicKey,
    certificateTypes: [
      [certificateType, certificateFields]
    ]
  },
  func: async (req, res, server) => {
    try {
      return res.status(200).json({
        status: 'success',
        certifierPublicKey,
        certificateTypes: [[certificateType, certificateFields]]
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'An internal error has occurred.'
      })
    }
  }
}
