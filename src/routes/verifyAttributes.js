const fs = require('fs')

module.exports = {
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
  func: async (req, res) => {
    try {
      const attributesVerifiedWithSomeRandomService = () => {
        return true
      }

      if (attributesVerifiedWithSomeRandomService) {
        fs.writeFile('./test.json', JSON.stringify(req.body.attributes), (err) => {
          if (err) {
            console.error(err)
            return res.status(400).json({ // 204 might be better
              status: 'failed',
              description: 'Failed to verify the submitted attributes!'
            })
          } else {
            console.log('success')
          }
        })

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
