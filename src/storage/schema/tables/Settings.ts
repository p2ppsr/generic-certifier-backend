import { sdk } from '@bsv/wallet-toolbox'

export interface Settings extends sdk.EntityTimeStamp {
    created_at: Date
    updated_at: Date
    chain: sdk.Chain
}

