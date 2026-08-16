// Quiz data. Excluded countries are filtered again at runtime.
export const EXCLUDED_COUNTRIES = new Set(['Iran','Russia','North Korea','Cuba']);

export const COUNTRIES = [
  ['United States','🇺🇸'],['Canada','🇨🇦'],['Mexico','🇲🇽'],['Brazil','🇧🇷'],['Argentina','🇦🇷'],
  ['United Kingdom','🇬🇧'],['France','🇫🇷'],['Germany','🇩🇪'],['Italy','🇮🇹'],['Spain','🇪🇸'],
  ['Portugal','🇵🇹'],['Netherlands','🇳🇱'],['Belgium','🇧🇪'],['Switzerland','🇨🇭'],['Austria','🇦🇹'],
  ['Sweden','🇸🇪'],['Norway','🇳🇴'],['Denmark','🇩🇰'],['Finland','🇫🇮'],['Poland','🇵🇱'],
  ['Ukraine','🇺🇦'],['Greece','🇬🇷'],['Turkey','🇹🇷'],['India','🇮🇳'],['Japan','🇯🇵'],
  ['South Korea','🇰🇷'],['China','🇨🇳'],['Thailand','🇹🇭'],['Vietnam','🇻🇳'],['Philippines','🇵🇭'],
  ['Indonesia','🇮🇩'],['Australia','🇦🇺'],['New Zealand','🇳🇿'],['South Africa','🇿🇦'],['Egypt','🇪🇬'],
  ['Morocco','🇲🇦'],['Nigeria','🇳🇬'],['Kenya','🇰🇪'],['Ghana','🇬🇭'],['Saudi Arabia','🇸🇦'],
  ['United Arab Emirates','🇦🇪'],['Israel','🇮🇱'],['Jordan','🇯🇴'],['Iraq','🇮🇶'],['Pakistan','🇵🇰'],
  ['Bangladesh','🇧🇩'],['Nepal','🇳🇵'],['Malaysia','🇲🇾'],['Singapore','🇸🇬'],['Chile','🇨🇱'],
  ['Colombia','🇨🇴'],['Peru','🇵🇪'],['Uruguay','🇺🇾'],['Ecuador','🇪🇨'],['Costa Rica','🇨🇷']
].filter(([name]) => !EXCLUDED_COUNTRIES.has(name));