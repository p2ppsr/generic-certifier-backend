import { Base64String } from '@bsv/sdk'
import { sdk } from '@bsv/wallet-toolbox'

export interface CertificateField extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   certificateId: number
   fieldName: string
   fieldValue: string
   masterKey: Base64String
}
