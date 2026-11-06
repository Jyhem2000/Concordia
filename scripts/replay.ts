import { readFileSync } from 'node:fs'
import { isPendingRun, verdictOf } from './verdict.ts'

/*
 * Rejeu en ligne de commande, lancé par verify.ts dans l'extrait du commit de chaque version des règles : des parties en
 * attente en JSON sur l'entrée standard, leurs verdicts en JSON sur la sortie.
 * Ce fichier et verdict.ts gardent la même interface d'un commit à l'autre : une version plus ancienne doit rester
 * lisible par la vérification d'aujourd'hui.
 */

const input: unknown = JSON.parse(readFileSync(0, 'utf8'))
const runs = Array.isArray(input) ? input.filter(isPendingRun) : []
process.stdout.write(JSON.stringify(runs.map(verdictOf)))
