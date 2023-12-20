const { getVerificationInfo } = require('../utils/getVerificationInfo')

module.exports = {
  type: 'post',
  path: '/checkVerification',
  summary: 'Submit KYC verification proof for the current user',
  parameters: {
    verificationId: '',
    certificateFields: {}
  },
  exampleResponse: {
    status: 'verified | notVerified'
  },
  func: async (req, res) => {
    try {
      // TODO: Actually return verification status
      if (getVerificationInfo(req.body.verificationId)) {
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
