/*
 * Lancement de la vérification à la soumission (chap. 9, « Mise en ligne ») : GitHub ne tient pas l'horaire des tâches
 * planifiées d'un petit dépôt (quelques passages par jour au lieu d'un par heure). Chaque partie enregistrée lance donc
 * `verify.yml` aussitôt ; le passage horaire reste en secours.
 */

/** Dépôt, tâche et branche de la vérification */
export const VERIFY_WORKFLOW = { repository: 'Jyhem2000/Concordia', file: 'verify.yml', ref: 'master' } as const

/**
 * Demande à GitHub de lancer la vérification. Sans jeton, rien n'est demandé ; un refus ou une panne de GitHub ne fait pas
 * échouer l'envoi : la partie attend le passage horaire. Renvoie vrai si GitHub a accepté.
 */
export async function dispatchVerification(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const { repository, file, ref } = VERIFY_WORKFLOW
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/${file}/dispatches`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        // GitHub refuse une requête sans agent
        'user-agent': 'concordia-leaderboard',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ ref }),
    })
    return response.ok
  } catch {
    return false
  }
}
