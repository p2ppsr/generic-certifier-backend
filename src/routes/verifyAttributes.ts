/* eslint-disable @typescript-eslint/no-unused-vars */
import { CertifierRoute } from '../CertifierServer'

export const verifyAttributes: CertifierRoute = {
  type: 'post',
  path: '/verifyAttributes',
  summary: 'Attempts to verify submitted attributes',
  parameters: {
    attributes: {
      firstName: 'John',
      lastName: 'Smith',
      profilePhoto: 'uhrp://',
      skill: 'Kempo Martial Arts'
    }
  },
  exampleResponse: {
    status: 'verified | notVerified'
  },
  func: async (req, res, server) => {
    try {
      const attributesVerifiedWithSomeRandomService = () => {
        return true
      }

      if (attributesVerifiedWithSomeRandomService()) {
        return res.status(200).json({
          status: 'passed',
          description: 'The attributes have been successfully verified!',
          verifiedAttributes: req.body.attributes
        })
      } else {
        return res.status(400).json({ // 204 might be better
          status: 'failed',
          description: 'Failed to verify the submitted attributes!'
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
