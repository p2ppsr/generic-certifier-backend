/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex'
import { sdk } from '@bsv/wallet-toolbox'

interface Migration {
    up: (knex: Knex) => Promise<void>;
    down?: (knex: Knex) => Promise<void>;
    config?: object;
}

interface MigrationSource<TMigrationSpec> {
    getMigrations(loadExtensions: readonly string[]): Promise<TMigrationSpec[]>;
    getMigrationName(migration: TMigrationSpec): string;
    getMigration(migration: TMigrationSpec): Promise<Migration>;
}


export class KnexMigrations implements MigrationSource<string> {

    migrations: Record<string, Migration> = {}

    /**
     * @param chain 
     */
    constructor(
        public chain: sdk.Chain,
    ) {
        this.migrations = this.setupMigrations(
            chain
        )
    }

    async getMigrations(): Promise<string[]> { return Object.keys(this.migrations).sort() }
    getMigrationName(migration: string) { return migration }
    async getMigration(migration: string): Promise<Migration> { return this.migrations[migration] }

    async getLatestMigration(): Promise<string> {
        const ms = await this.getMigrations()
        return ms[ms.length - 1]
    }

    static async latestMigration(): Promise<string> {
        const km = new KnexMigrations('test')
        return await km.getLatestMigration()
    }

    setupMigrations(
        chain: string
    ): Record<string, Migration> {

        const migrations: Record<string, Migration> = {}

        const addTimeStamps = (knex: Knex<any, any[]>, table: Knex.CreateTableBuilder) => {
            table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable()
            table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable()
        }

        migrations['2025-01-27-001 initial migration'] = {
            async up(knex) {

                await knex.schema.createTable('certificates', table => {
                    addTimeStamps(knex, table)
                    table.increments('certificateId')
                    table.string('serialNumber', 100).notNullable()
                    table.string('type', 100).notNullable()
                    table.string('certifier', 100).notNullable()
                    table.string('subject', 100).notNullable()
                    table.string('verifier', 100).nullable()
                    table.string('revocationOutpoint', 100).notNullable()
                    table.string('signature', 255).notNullable()
                    table.unique(['userId', 'type', 'certifier', 'serialNumber'])
                })
                await knex.schema.createTable('certificate_fields', table => {
                    addTimeStamps(knex, table)
                    table.integer('certificateId').unsigned().references('certificateId').inTable('certificates').notNullable()
                    table.string('fieldName', 100).notNullable()
                    table.string('fieldValue').notNullable()
                    table.string('masterKey', 255).defaultTo('').notNullable()
                    table.unique(['fieldName', 'certificateId'])
                })
                await knex.schema.createTable('settings', table => {
                    addTimeStamps(knex, table)
                    table.string('chain', 10).notNullable()
                })

                await knex('settings').insert({
                    chain,
                })
            },
            async down(knex) {
                await knex.schema.dropTable('settings')
                await knex.schema.dropTable('certificate_fields')
                await knex.schema.dropTable('certificates')
            }
        }
        return migrations
    }
}