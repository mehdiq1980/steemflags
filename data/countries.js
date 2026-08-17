// Canonical quiz country dataset.
// Each country includes its ISO 3166-1 alpha-2 code for a real flag asset.
// Excluded countries are intentionally absent from both questions and options.
export const EXCLUDED_COUNTRIES = new Set(['Iran','Russia','North Korea','Cuba']);

const RAW_COUNTRIES = [
['France','🇫🇷','fr'],['Germany','🇩🇪','de'],['Italy','🇮🇹','it'],['Spain','🇪🇸','es'],['Portugal','🇵🇹','pt'],['Japan','🇯🇵','jp'],['South Korea','🇰🇷','kr'],['India','🇮🇳','in'],['Brazil','🇧🇷','br'],['Canada','🇨🇦','ca'],['United States','🇺🇸','us'],['United Kingdom','🇬🇧','gb'],['Australia','🇦🇺','au'],['Mexico','🇲🇽','mx'],['Argentina','🇦🇷','ar'],['Turkey','🇹🇷','tr'],['Egypt','🇪🇬','eg'],['South Africa','🇿🇦','za'],['Nigeria','🇳🇬','ng'],['Sweden','🇸🇪','se'],['Norway','🇳🇴','no'],['Finland','🇫🇮','fi'],['Greece','🇬🇷','gr'],['Thailand','🇹🇭','th'],['Indonesia','🇮🇩','id'],['Vietnam','🇻🇳','vn'],['Philippines','🇵🇭','ph'],['New Zealand','🇳🇿','nz'],['Switzerland','🇨🇭','ch'],['Austria','🇦🇹','at'],['Netherlands','🇳🇱','nl'],['Belgium','🇧🇪','be'],['Denmark','🇩🇰','dk'],['Poland','🇵🇱','pl'],['Ukraine','🇺🇦','ua'],['Ireland','🇮🇪','ie'],['Iceland','🇮🇸','is'],['Czech Republic','🇨🇿','cz'],['Hungary','🇭🇺','hu'],['Romania','🇷🇴','ro'],['Croatia','🇭🇷','hr'],['Serbia','🇷🇸','rs'],['Slovakia','🇸🇰','sk'],['Slovenia','🇸🇮','si'],['Bulgaria','🇧🇬','bg'],['Lithuania','🇱🇹','lt'],['Latvia','🇱🇻','lv'],['Estonia','🇪🇪','ee'],['Morocco','🇲🇦','ma'],['Kenya','🇰🇪','ke'],['Ghana','🇬🇭','gh'],['Chile','🇨🇱','cl'],['Colombia','🇨🇴','co'],['Peru','🇵🇪','pe'],['Uruguay','🇺🇾','uy'],['Ecuador','🇪🇨','ec'],['Costa Rica','🇨🇷','cr'],['Panama','🇵🇦','pa'],['Jamaica','🇯🇲','jm'],['Dominican Republic','🇩🇴','do'],['Saudi Arabia','🇸🇦','sa'],['United Arab Emirates','🇦🇪','ae'],['Jordan','🇯🇴','jo'],['Iraq','🇮🇶','iq'],['Pakistan','🇵🇰','pk'],['Bangladesh','🇧🇩','bd'],['Nepal','🇳🇵','np'],['Malaysia','🇲🇾','my'],['Singapore','🇸🇬','sg']
];

export const COUNTRIES = RAW_COUNTRIES.filter(([name]) => !EXCLUDED_COUNTRIES.has(name));
