import { Base64String, HexString, OutpointString, PubKeyHex } from '@bsv/sdk'
import { sdk } from '@bsv/wallet-toolbox'
import { CertificateField } from './CertificateField'

export interface Certificate extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   certificateId: number
   type: Base64String
   serialNumber: Base64String
   certifier: PubKeyHex
   subject: PubKeyHex
   verifier?: PubKeyHex
   revocationOutpoint: OutpointString
   signature: HexString
}

export interface CertificateX extends Certificate {
   fields?: CertificateField[]
}

