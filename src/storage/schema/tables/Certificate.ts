import { Base64String, HexString, OutpointString, PubKeyHex } from '@bsv/sdk'
import { sdk, table } from "wallet-storage"

export interface Certificate extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   certificateId: number
   userId: number
   type: Base64String
   serialNumber: Base64String
   certifier: PubKeyHex
   subject: PubKeyHex
   verifier?: PubKeyHex
   revocationOutpoint: OutpointString
   signature: HexString
}

export interface CertificateX extends table.Certificate {
   fields?: table.CertificateField[]
}

