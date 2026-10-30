import { ENDINGS } from '../../data/balance.ts'
import type { Highlight } from '../../engine/types.ts'
import { useI18n } from '../../i18n/useI18n.ts'

/** Texte d'un fait marquant du carnet de route (chap. 7) */
export function useHighlightText(): (highlight: Highlight) => string {
  const { t, credits } = useI18n()
  const j = t.journal
  return (highlight) => {
    switch (highlight.kind) {
      case 'trip':
        return j.trip(t.district[highlight.from].name, t.district[highlight.to].name, highlight.phase === 'night')
      case 'control': {
        const outcome = [
          ...(highlight.success === null ? [] : [highlight.success ? t.report.success : t.report.failure]),
          ...(highlight.crates < 0 ? [j.lostCrates(-highlight.crates)] : []),
          ...(highlight.custodyDays > 0 ? [j.custody(highlight.custodyDays)] : []),
        ].join(', ')
        return j.control(t.interception.moves[highlight.move], outcome)
      }
      case 'road':
        return j.road(t.event[highlight.eventId].name, highlight.won === null ? '' : highlight.won ? t.road.won : t.road.lost)
      case 'delivered':
        return j.delivered(credits(highlight.fee))
      case 'deviated':
        return j.deviated
      case 'injection':
        return j.injection(highlight.total, ENDINGS.resident.injections)
      case 'vehicle':
        return j.vehicle(t.vehicle[highlight.vehicleId].name)
      case 'module':
        return j.module(t.module[highlight.moduleId].name)
      case 'crew':
        return j.crew(t.crew[highlight.crewId].name)
      case 'debtPaid':
        return j.debtPaid
      case 'wanted':
        return j.wanted(highlight.level)
      case 'iccTier':
        return j.iccTier(t.iccTier[highlight.tier])
      case 'ending':
        return j.ending(t.end.endings[highlight.id].title, credits(highlight.score))
      case 'raid':
        return j.raid(credits(highlight.loss))
      case 'contractDone':
        return j.contractDone(credits(highlight.reward))
      case 'contractFailed':
        return j.contractFailed(credits(highlight.penalty))
    }
  }
}
