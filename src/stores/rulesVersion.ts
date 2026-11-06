/** Version des règles de ce build (README, Mise en ligne) : une partie classée la garde et ne s'envoie qu'avec elle */
export const RULES_VERSION = __RULES_VERSION__

/** Build sans commit (serveur de dev, tests) : ses parties classées ne s'envoient pas */
export const LOCAL_BUILD = RULES_VERSION === 'dev'
