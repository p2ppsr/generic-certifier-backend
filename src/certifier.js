require('dotenv').config()
const bsv = require('babbage-bsv')

const genericCert = require('./certificates/genericCert')

const certifierPrivateKey = process.env.SERVER_PRIVATE_KEY
const certifierPublicKey = new bsv.PrivateKey(certifierPrivateKey).publicKey.toString('hex')

// The confirmCertificate route of this server can be used to confirm that
// the requester has been issued and has authorized access to specific
// certificate types and field values.
// This specifies which types and fields are to be requested by authrite for confirmations.
const requestedTypesAndFields = Object.fromEntries([[genericCert.certificateType, genericCert.certificateFields]])

module.exports = {
  certifierPrivateKey,
  certifierPublicKey,
  certificateType: genericCert.certificateType,
  certificateDefinition: genericCert.certificateDefinition,
  certificateFields: genericCert.certificateFields,
  requestedTypesAndFields
}
