/* eslint-disable @typescript-eslint/no-explicit-any */
import { sdk, verifyOne } from 'wallet-storage'
import { KnexMigrations, table } from '.'

import { Knex } from 'knex'

export class CertifierStorage {
  _settings?: table.Settings

  constructor(public knex: Knex, public chain: sdk.Chain) {
  }

  async makeAvailable(): Promise<table.Settings> {
      return this._settings = await this.readSettings()
  }

  private async readSettings(): Promise<table.Settings> {
    return this.validateEntity(verifyOne(await this.knex<table.Settings>('settings')))
  }

  async destroy(): Promise<void> {
    await this.knex?.destroy()
  }

  async migrate(): Promise<string> {
    const config = {
      migrationSource: new KnexMigrations(this.chain)
    }
    await this.knex.migrate.latest(config)
    const version = await this.knex.migrate.currentVersion(config)
    return version
  }

  async dropAllData(): Promise<void> {
    // Only using migrations to migrate down, don't need valid properties for settings table.
    const config = { migrationSource: new KnexMigrations('test') }
    const count = Object.keys(config.migrationSource.migrations).length
    for (let i = 0; i < count; i++) {
      try {
        const r = await this.knex.migrate.down(config)
        expect(r).toBeTruthy()
      } catch (eu: unknown) {
        break
      }
    }
  }

  async insertCertificate(certificate: table.CertificateX): Promise<number> {
    const e: any = certificate
    const fields = e.fields
    if (e.fields) delete e.fields
    if (e.certificateId === 0) delete e.certificateId
    const [id] = await this.knex<table.Certificate>('certificates').insert(e)
    certificate.certificateId = id

    if (fields) {
      for (const field of fields) {
        field.certificateId = id
        field.userId = certificate.userId
        await this.insertCertificateField(field)
      }
    }

    return certificate.certificateId
  }

  private async insertCertificateField(certificateField: table.CertificateField): Promise<void> {
    await this.knex<table.Certificate>('certificate_fields').insert(certificateField)
  }

  async updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>): Promise<number> {
    return await this.knex<table.CertificateField>('certificate_fields').where({ certificateId, fieldName }).update(update)
  }

  async updateCertificate(id: number, update: Partial<table.Certificate>): Promise<number> {
    return await this.knex<table.Certificate>('certificates').where({ certificateId: id }).update(update)
  }

  private setupQuery<T extends object>(table: string, partial: Partial<T>): Knex.QueryBuilder {
    const q = this.knex<T>(table)
    if (partial && Object.keys(partial).length > 0) q.where(partial)
    return q
  }

  private findCertificateFieldsQuery(partial: Partial<table.CertificateField>): Knex.QueryBuilder {
    return this.setupQuery('certificate_fields', partial)
  }

  private findCertificatesQuery(partial: Partial<table.Certificate>): Knex.QueryBuilder {
    const q = this.setupQuery('certificates', partial)
    return q
  }

  private async findCertificateFields(partial: Partial<table.CertificateField>): Promise<table.CertificateField[]> {
    return this.validateEntities(await this.findCertificateFieldsQuery(partial))
  }

  async findCertificates(partial: Partial<table.Certificate>): Promise<table.CertificateX[]> {
    const q = this.findCertificatesQuery(partial)
    const r = await q
    const certs: table.CertificateX[] = this.validateEntities(r)

    for (const cert of certs) {
      cert.fields = await this.findCertificateFields({ certificateId: cert.certificateId })
    }

    return certs
  }

  /**
   * Helper to force uniform behavior across database engines.
   * Use to process all individual records with time stamps retreived from database.
   */
  private validateEntity<T extends sdk.EntityTimeStamp>(entity: T): T {
    for (const key of Object.keys(entity)) {
      const val = entity[key]
      if (val === null) {
        entity[key] = undefined
      }
    }
    return entity
  }

  /**
   * Helper to force uniform behavior across database engines.
   * Use to process all arrays of records with time stamps retreived from database.
   * @returns input `entities` array with contained values validated.
   */
  private validateEntities<T extends sdk.EntityTimeStamp>(entities: T[]): T[] {
    for (let i = 0; i < entities.length; i++) {
      entities[i] = this.validateEntity(entities[i])
    }
    return entities
  }

}
