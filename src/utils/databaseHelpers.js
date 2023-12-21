const fs = require('fs')

async function connectToMongoDB () {
  // Internal helper function
}

async function getMongoClient () {
  // Internal helper function
}

/**
 * Saves record of a newly issued certificate
 * @param {string} identityKey
 * @param {object} certificate
 * @param {string} tx
 * @param {string} derivationPrefix
 * @param {string} derivationSuffix
 */
const saveCertificate = async (identityKey, certificate, tx, derivationPrefix, derivationSuffix) => {
  // Updates certificate issuances data for a verified identity

  fs.writeFile('./certificate.json', JSON.stringify(certificate), (err) => {
    if (err) {
      console.error(err)
      throw new Error(err)
    } else {
      // res.send('File written successfully')
      console.log('success')
    }
  })
}

/**
 * Saves proof of attribute verification
 * @param {string} identityKey
 * @param {string} verificationId
 * @param {Date | string} expirationDate
 */
const saveVerificationProof = async (identityKey, verificationId, expirationDate) => {
  // Insert verification proof for a new certificate
  // Filter by identity key and verificationId
  // Only select relevant data
  // Return the matching result
}

/**
 * Returns verification proof for a given search query (in this case a user's identity key)
 * @param {string} identityKey
 * @returns
 */
const getVerificationProof = async (identityKey) => {
  // Filter by identity key and verificationId
  // Only select relevant data
  // Return the matching result
  return {
    verificationId: 'mockVerificationId',
    expirationDate: new Date() + 100000
  }
}

/**
 * Returns revocation data associarted with a user and a certificate
 * @param {string} identityKey
 * @param {string} serialNumber
 */
const getRevocationData = async (identityKey, serialNumber) => {
  // Filter by identity key or certificate serialNumber
  // Only select relevant data
}

/**
 * Inserts a new revocation record (consider integration with an overlay network in the future)
 * @param {string} _id
 * @param {string} tx
 */
const insertRevocationRecord = async (_id, tx) => {
  // TODO: Add the revocation tx to the revoked certificate
}

module.exports = {
  saveCertificate,
  saveVerificationProof,
  getVerificationProof,
  getRevocationData,
  insertRevocationRecord,
  connectToMongoDB,
  getMongoClient
}
