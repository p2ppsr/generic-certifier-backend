/* eslint-disable @typescript-eslint/no-unused-vars */
import { CertifierRoute } from '../CertifierServer'

export const checkVerification: CertifierRoute = {
  type: 'post',
  path: '/checkVerification',
  summary: 'Checks that attribute verification has already been done.',
  parameters: {
    attributes: {}
  },
  exampleResponse: {
    status: 'verified | notVerified'
  },
  func: async (req, res, server) => {
    try {
      if (getVerificationInfo(req.body.attributes.metadata.verificationId)) {
        return res.status(200).json({
          status: 'verified',
          description: 'Attributes have been verified!'
        })
      } else {
        return res.status(400).json({ // 204 might be better
          status: 'notVerified',
          description: 'Attributes have not been verified!'
        })
      }
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

// Example function that would be used to get the verification info
function getVerificationInfo(id: string): boolean {
  return true
}