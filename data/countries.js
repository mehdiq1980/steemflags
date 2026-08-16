// Canonical quiz country dataset.
// Excluded countries are intentionally absent from both questions and options.
export const EXCLUDED_COUNTRIES = new Set(['Iran','Russia','North Korea','Cuba']);

const RAW_COUNTRIES = [
['France','🇫🇷'],['Germany','🇩🇪'],['Italy','🇮🇹'],['Spain','🇪🇸'],['Portugal','🇵🇹'],['Japan','🇯🇵'],['South Korea','🇰🇷'],['India','🇮🇳'],['Brazil','🇧🇷'],['Canada','🇨🇦'],['United States','🇺🇸'],['United Kingdom','🇬🇧'],['Australia','🇦🇺'],['Mexico','🇲🇽'],['Argentina','🇦🇷'],['Turkey','🇹🇷'],['Egypt','🇪🇬'],['South Africa','🇿🇦'],['Nigeria','🇳🇬'],['Sweden','🇸🇪'],['Norway','🇳🇴'],['Finland','🇫🇮'],['Greece','🇬🇷'],['Thailand','🇹🇭'],['Indonesia','🇮🇩'],['Vietnam','🇻🇳'],['Philippines','🇵🇭'],['New Zealand','🇳🇿'],['Switzerland','🇨🇭'],['Austria','🇦🇹'],['Netherlands','🇳🇱'],['Belgium','🇧🇪'],['Denmark','🇩🇰'],['Poland','🇵🇱'],['Ukraine','🇺🇦'],['Ireland','🇮🇪'],['Iceland','🇮🇸'],['Czech Republic','🇨🇿'],['Hungary','🇭🇺'],['Romania','🇷🇴'],['Croatia','🇭🇷'],['Serbia','🇷🇸'],['Slovakia','🇸🇰'],['Slovenia','🇸🇮'],['Bulgaria','🇧🇬'],['Lithuania','🇱🇹'],['Latvia','🇱🇻'],['Estonia','🇪🇪'],['Morocco','🇲🇦'],['Kenya','🇰🇪'],['Ghana','🇬🇭'],['Chile','🇨🇱'],['Colombia','🇨🇴'],['Peru','🇵🇪'],['Uruguay','🇺🇾'],['Ecuador','🇪🇨'],['Costa Rica','🇨🇷'],['Panama','🇵🇦'],['Jamaica','🇯🇲'],['Dominican Republic','🇩🇴'],['Saudi Arabia','🇸🇦'],['United Arab Emirates','🇦🇪'],['Jordan','🇯🇴'],['Iraq','🇮🇶'],['Pakistan','🇵🇰'],['Bangladesh','🇧🇩'],['Nepal','🇳🇵'],['Malaysia','🇲🇾'],['Singapore','🇸🇬']
];

export const COUNTRIES = RAW_COUNTRIES.filter(([name]) => !EXCLUDED_COUNTRIES.has(name));
