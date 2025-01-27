import { sdk } from "wallet-storage"

export interface Settings extends sdk.EntityTimeStamp {
    created_at: Date
    updated_at: Date
    chain: sdk.Chain
}

