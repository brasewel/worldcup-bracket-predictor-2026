export interface TeamDef {
  flag: string;
  name: string;
}

export const GROUPS_DATA: Record<string, TeamDef[]> = {
  A: [
    { flag: '🇲🇽', name: 'Mexico' },
    { flag: '🇿🇦', name: 'South Africa' },
    { flag: '🇰🇷', name: 'South Korea' },
    { flag: '🇨🇿', name: 'Czechia' },
  ],
  B: [
    { flag: '🇨🇦', name: 'Canada' },
    { flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
    { flag: '🇶🇦', name: 'Qatar' },
    { flag: '🇨🇭', name: 'Switzerland' },
  ],
  C: [
    { flag: '🇧🇷', name: 'Brazil' },
    { flag: '🇲🇦', name: 'Morocco' },
    { flag: '🇭🇹', name: 'Haiti' },
    { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland' },
  ],
  D: [
    { flag: '🇺🇸', name: 'USA' },
    { flag: '🇵🇾', name: 'Paraguay' },
    { flag: '🇦🇺', name: 'Australia' },
    { flag: '🇹🇷', name: 'Türkiye' },
  ],
  E: [
    { flag: '🇩🇪', name: 'Germany' },
    { flag: '🇨🇼', name: 'Curaçao' },
    { flag: '🇨🇮', name: 'Ivory Coast' },
    { flag: '🇪🇨', name: 'Ecuador' },
  ],
  F: [
    { flag: '🇳🇱', name: 'Netherlands' },
    { flag: '🇯🇵', name: 'Japan' },
    { flag: '🇸🇪', name: 'Sweden' },
    { flag: '🇹🇳', name: 'Tunisia' },
  ],
  G: [
    { flag: '🇧🇪', name: 'Belgium' },
    { flag: '🇪🇬', name: 'Egypt' },
    { flag: '🇮🇷', name: 'Iran' },
    { flag: '🇳🇿', name: 'New Zealand' },
  ],
  H: [
    { flag: '🇪🇸', name: 'Spain' },
    { flag: '🇨🇻', name: 'Cape Verde' },
    { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇺🇾', name: 'Uruguay' },
  ],
  I: [
    { flag: '🇫🇷', name: 'France' },
    { flag: '🇸🇳', name: 'Senegal' },
    { flag: '🇮🇶', name: 'Iraq' },
    { flag: '🇳🇴', name: 'Norway' },
  ],
  J: [
    { flag: '🇦🇷', name: 'Argentina' },
    { flag: '🇩🇿', name: 'Algeria' },
    { flag: '🇦🇹', name: 'Austria' },
    { flag: '🇯🇴', name: 'Jordan' },
  ],
  K: [
    { flag: '🇵🇹', name: 'Portugal' },
    { flag: '🇨🇩', name: 'DR Congo' },
    { flag: '🇺🇿', name: 'Uzbekistan' },
    { flag: '🇨🇴', name: 'Colombia' },
  ],
  L: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' },
    { flag: '🇭🇷', name: 'Croatia' },
    { flag: '🇬🇭', name: 'Ghana' },
    { flag: '🇵🇦', name: 'Panama' },
  ],
};

export function getFlagForTeam(name: string): string {
  for (const teams of Object.values(GROUPS_DATA)) {
    const t = teams.find(t => t.name === name);
    if (t) return t.flag;
  }
  return '🏳';
}

// Official FIFA 2026 World Cup Round of 32 matchups (matches 73-88).
// {g, p} = group/position (p:0=winner, p:1=runner-up).
// {third: [...groups]} = best 3rd-place team from those groups.
export type Seed = { g: string; p: number } | { third: string[] };

export const R32_SEEDS: [Seed, Seed][] = [
  [{ g: 'A', p: 1 }, { g: 'B', p: 1 }],                         // M73
  [{ g: 'E', p: 0 }, { third: ['A', 'B', 'C', 'D', 'F'] }],     // M74
  [{ g: 'F', p: 0 }, { g: 'C', p: 1 }],                         // M75
  [{ g: 'C', p: 0 }, { g: 'F', p: 1 }],                         // M76
  [{ g: 'I', p: 0 }, { third: ['C', 'D', 'F', 'G', 'H'] }],     // M77
  [{ g: 'E', p: 1 }, { g: 'I', p: 1 }],                         // M78
  [{ g: 'A', p: 0 }, { third: ['C', 'E', 'F', 'H', 'I'] }],     // M79
  [{ g: 'L', p: 0 }, { third: ['E', 'H', 'I', 'J', 'K'] }],     // M80
  [{ g: 'D', p: 0 }, { third: ['B', 'E', 'F', 'I', 'J'] }],     // M81
  [{ g: 'G', p: 0 }, { third: ['A', 'E', 'H', 'I', 'J'] }],     // M82
  [{ g: 'K', p: 1 }, { g: 'L', p: 1 }],                         // M83
  [{ g: 'H', p: 0 }, { g: 'J', p: 1 }],                         // M84
  [{ g: 'B', p: 0 }, { third: ['E', 'F', 'G', 'I', 'J'] }],     // M85
  [{ g: 'J', p: 0 }, { g: 'H', p: 1 }],                         // M86
  [{ g: 'K', p: 0 }, { third: ['D', 'E', 'I', 'J', 'L'] }],     // M87
  [{ g: 'D', p: 1 }, { g: 'G', p: 1 }],                         // M88
];

export const ROUND_COUNTS: Record<string, number> = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 };

export const ROUND_LABELS_SHORT: Record<string, string> = {
  r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final',
};

// Format: [matchId, dateISO, timeET, team1, team2, group, venue, city]
export type MatchRow = [number, string, string, string, string, string | null, string, string];

export const SCHEDULE: MatchRow[] = [
  [1,'2026-06-11','15:00','Mexico','South Africa','A','Estadio Azteca','Mexico City'],
  [2,'2026-06-11','22:00','South Korea','Czechia','A','Estadio Akron','Guadalajara'],
  [3,'2026-06-12','15:00','Canada','Bosnia & Herz.','B','BMO Field','Toronto'],
  [4,'2026-06-12','21:00','USA','Paraguay','D','SoFi Stadium','Los Angeles'],
  [5,'2026-06-13','21:00','Haiti','Scotland','C','Gillette Stadium','Boston'],
  [6,'2026-06-13','00:00','Australia','Türkiye','D','BC Place','Vancouver'],
  [7,'2026-06-13','18:00','Brazil','Morocco','C','MetLife Stadium','New York/NJ'],
  [8,'2026-06-13','15:00','Qatar','Switzerland','B','Levi\u2019s Stadium','San Francisco'],
  [9,'2026-06-14','19:00','Ivory Coast','Ecuador','E','Lincoln Financial','Philadelphia'],
  [10,'2026-06-14','13:00','Germany','Cura\u00e7ao','E','NRG Stadium','Houston'],
  [11,'2026-06-14','16:00','Netherlands','Japan','F','AT&T Stadium','Dallas'],
  [12,'2026-06-14','22:00','Sweden','Tunisia','F','Estadio BBVA','Monterrey'],
  [13,'2026-06-15','18:00','Saudi Arabia','Uruguay','H','Hard Rock Stadium','Miami'],
  [14,'2026-06-15','12:00','Spain','Cape Verde','H','Mercedes-Benz Stadium','Atlanta'],
  [15,'2026-06-15','21:00','Iran','New Zealand','G','SoFi Stadium','Los Angeles'],
  [16,'2026-06-15','15:00','Belgium','Egypt','G','Lumen Field','Seattle'],
  [17,'2026-06-16','15:00','France','Senegal','I','MetLife Stadium','New York/NJ'],
  [18,'2026-06-16','18:00','Iraq','Norway','I','Gillette Stadium','Boston'],
  [19,'2026-06-16','21:00','Argentina','Algeria','J','Arrowhead Stadium','Kansas City'],
  [20,'2026-06-16','00:00','Austria','Jordan','J','Levi\u2019s Stadium','San Francisco'],
  [21,'2026-06-17','19:00','Ghana','Panama','L','BMO Field','Toronto'],
  [22,'2026-06-17','16:00','England','Croatia','L','AT&T Stadium','Dallas'],
  [23,'2026-06-17','13:00','Portugal','DR Congo','K','NRG Stadium','Houston'],
  [24,'2026-06-17','22:00','Uzbekistan','Colombia','K','Estadio Azteca','Mexico City'],
  [25,'2026-06-18','12:00','Czechia','South Africa','A','Mercedes-Benz Stadium','Atlanta'],
  [26,'2026-06-18','15:00','Switzerland','Bosnia & Herz.','B','SoFi Stadium','Los Angeles'],
  [27,'2026-06-18','18:00','Canada','Qatar','B','BC Place','Vancouver'],
  [28,'2026-06-18','21:00','Mexico','South Korea','A','Estadio Akron','Guadalajara'],
  [29,'2026-06-19','21:00','Brazil','Haiti','C','Lincoln Financial','Philadelphia'],
  [30,'2026-06-19','18:00','Scotland','Morocco','C','Gillette Stadium','Boston'],
  [31,'2026-06-19','23:00','T\u00fcrkiye','Paraguay','D','Levi\u2019s Stadium','San Francisco'],
  [32,'2026-06-19','15:00','USA','Australia','D','Lumen Field','Seattle'],
  [33,'2026-06-20','16:00','Germany','Ivory Coast','E','BMO Field','Toronto'],
  [34,'2026-06-20','20:00','Ecuador','Cura\u00e7ao','E','Arrowhead Stadium','Kansas City'],
  [35,'2026-06-20','13:00','Netherlands','Sweden','F','NRG Stadium','Houston'],
  [36,'2026-06-20','00:00','Tunisia','Japan','F','Estadio BBVA','Monterrey'],
  [37,'2026-06-21','18:00','Uruguay','Cape Verde','H','Hard Rock Stadium','Miami'],
  [38,'2026-06-21','12:00','Spain','Saudi Arabia','H','Mercedes-Benz Stadium','Atlanta'],
  [39,'2026-06-21','15:00','Belgium','Iran','G','SoFi Stadium','Los Angeles'],
  [40,'2026-06-21','21:00','New Zealand','Egypt','G','BC Place','Vancouver'],
  [41,'2026-06-22','20:00','Norway','Senegal','I','MetLife Stadium','New York/NJ'],
  [42,'2026-06-22','17:00','France','Iraq','I','Lincoln Financial','Philadelphia'],
  [43,'2026-06-22','13:00','Argentina','Austria','J','AT&T Stadium','Dallas'],
  [44,'2026-06-22','23:00','Jordan','Algeria','J','Levi\u2019s Stadium','San Francisco'],
  [45,'2026-06-23','16:00','England','Ghana','L','Gillette Stadium','Boston'],
  [46,'2026-06-23','19:00','Panama','Croatia','L','BMO Field','Toronto'],
  [47,'2026-06-23','13:00','Portugal','Uzbekistan','K','NRG Stadium','Houston'],
  [48,'2026-06-23','22:00','Colombia','DR Congo','K','Estadio Akron','Guadalajara'],
  [49,'2026-06-24','18:00','Scotland','Brazil','C','Hard Rock Stadium','Miami'],
  [50,'2026-06-24','18:00','Morocco','Haiti','C','Mercedes-Benz Stadium','Atlanta'],
  [51,'2026-06-24','15:00','Switzerland','Canada','B','BC Place','Vancouver'],
  [52,'2026-06-24','15:00','Bosnia & Herz.','Qatar','B','Lumen Field','Seattle'],
  [53,'2026-06-24','21:00','Czechia','Mexico','A','Estadio Azteca','Mexico City'],
  [54,'2026-06-24','21:00','South Africa','South Korea','A','Estadio BBVA','Monterrey'],
  [55,'2026-06-25','16:00','Cura\u00e7ao','Ivory Coast','E','Lincoln Financial','Philadelphia'],
  [56,'2026-06-25','16:00','Ecuador','Germany','E','MetLife Stadium','New York/NJ'],
  [57,'2026-06-25','19:00','Japan','Sweden','F','AT&T Stadium','Dallas'],
  [58,'2026-06-25','19:00','Tunisia','Netherlands','F','Arrowhead Stadium','Kansas City'],
  [59,'2026-06-25','22:00','T\u00fcrkiye','USA','D','SoFi Stadium','Los Angeles'],
  [60,'2026-06-25','22:00','Paraguay','Australia','D','Levi\u2019s Stadium','San Francisco'],
  [61,'2026-06-26','15:00','Norway','France','I','Gillette Stadium','Boston'],
  [62,'2026-06-26','15:00','Senegal','Iraq','I','BMO Field','Toronto'],
  [63,'2026-06-26','23:00','Egypt','Iran','G','Lumen Field','Seattle'],
  [64,'2026-06-26','23:00','New Zealand','Belgium','G','BC Place','Vancouver'],
  [65,'2026-06-26','20:00','Cape Verde','Saudi Arabia','H','NRG Stadium','Houston'],
  [66,'2026-06-26','20:00','Uruguay','Spain','H','Estadio Akron','Guadalajara'],
  [67,'2026-06-27','17:00','Panama','England','L','MetLife Stadium','New York/NJ'],
  [68,'2026-06-27','17:00','Croatia','Ghana','L','Lincoln Financial','Philadelphia'],
  [69,'2026-06-27','22:00','Algeria','Austria','J','Arrowhead Stadium','Kansas City'],
  [70,'2026-06-27','22:00','Jordan','Argentina','J','AT&T Stadium','Dallas'],
  [71,'2026-06-27','19:30','Colombia','Portugal','K','Hard Rock Stadium','Miami'],
  [72,'2026-06-27','19:30','DR Congo','Uzbekistan','K','Mercedes-Benz Stadium','Atlanta'],
  [73,'2026-06-28','15:00','2nd Group A','2nd Group B',null,'SoFi Stadium','Los Angeles'],
  [74,'2026-06-29','16:30','1st Group E','Best 3rd (A/B/C/D/F)',null,'Gillette Stadium','Boston'],
  [75,'2026-06-29','21:00','1st Group F','2nd Group C',null,'Estadio BBVA','Monterrey'],
  [76,'2026-06-29','13:00','1st Group C','2nd Group F',null,'NRG Stadium','Houston'],
  [77,'2026-06-30','17:00','1st Group I','Best 3rd (C/D/F/G/H)',null,'MetLife Stadium','New York/NJ'],
  [78,'2026-06-30','13:00','2nd Group E','2nd Group I',null,'AT&T Stadium','Dallas'],
  [79,'2026-06-30','21:00','1st Group A','Best 3rd (C/E/F/H/I)',null,'Estadio Azteca','Mexico City'],
  [80,'2026-07-01','12:00','1st Group L','Best 3rd (E/H/I/J/K)',null,'Mercedes-Benz Stadium','Atlanta'],
  [81,'2026-07-01','20:00','1st Group D','Best 3rd (B/E/F/I/J)',null,'Levi\u2019s Stadium','San Francisco'],
  [82,'2026-07-01','16:00','1st Group G','Best 3rd (A/E/H/I/J)',null,'Lumen Field','Seattle'],
  [83,'2026-07-02','19:00','2nd Group K','2nd Group L',null,'BMO Field','Toronto'],
  [84,'2026-07-02','15:00','1st Group H','2nd Group J',null,'SoFi Stadium','Los Angeles'],
  [85,'2026-07-02','23:00','1st Group B','Best 3rd (E/F/G/I/J)',null,'BC Place','Vancouver'],
  [86,'2026-07-03','18:00','1st Group J','2nd Group H',null,'Hard Rock Stadium','Miami'],
  [87,'2026-07-03','21:30','1st Group K','Best 3rd (D/E/I/J/L)',null,'Arrowhead Stadium','Kansas City'],
  [88,'2026-07-03','14:00','2nd Group D','2nd Group G',null,'AT&T Stadium','Dallas'],
  [89,'2026-07-04','17:00','W74','W77',null,'Lincoln Financial','Philadelphia'],
  [90,'2026-07-04','13:00','W73','W75',null,'NRG Stadium','Houston'],
  [91,'2026-07-05','16:00','W76','W78',null,'MetLife Stadium','New York/NJ'],
  [92,'2026-07-05','20:00','W79','W80',null,'Estadio Azteca','Mexico City'],
  [93,'2026-07-06','15:00','W83','W84',null,'AT&T Stadium','Dallas'],
  [94,'2026-07-06','20:00','W81','W82',null,'Lumen Field','Seattle'],
  [95,'2026-07-07','12:00','W86','W88',null,'Mercedes-Benz Stadium','Atlanta'],
  [96,'2026-07-07','16:00','W85','W87',null,'BC Place','Vancouver'],
  [97,'2026-07-09','16:00','W89','W90',null,'Gillette Stadium','Boston'],
  [98,'2026-07-10','15:00','W93','W94',null,'SoFi Stadium','Los Angeles'],
  [99,'2026-07-11','17:00','W91','W92',null,'Hard Rock Stadium','Miami'],
  [100,'2026-07-11','21:00','W95','W96',null,'Arrowhead Stadium','Kansas City'],
  [101,'2026-07-14','15:00','W97','W98',null,'AT&T Stadium','Dallas'],
  [102,'2026-07-15','15:00','W99','W100',null,'Mercedes-Benz Stadium','Atlanta'],
  [103,'2026-07-18','17:00','L101','L102',null,'Hard Rock Stadium','Miami'],
  [104,'2026-07-19','15:00','W101','W102',null,'MetLife Stadium','New York/NJ'],
];

// Precomputed kickoff times in UTC ms for score-pick lockout
export const SCHEDULE_UTC_MS: Record<number, number> = {};
for (const m of SCHEDULE) {
  const [matchId, dateStr, timeET] = m;
  const [h, min] = timeET.split(':').map(Number);
  SCHEDULE_UTC_MS[matchId] = new Date(dateStr + 'T00:00:00Z').getTime() + (h + 4) * 3600000 + min * 60000;
}

export function getRoundLabel(matchId: number): string {
  if (matchId <= 72)  return 'Group Stage \u00b7 Group ' + (SCHEDULE[matchId - 1][5] ?? '');
  if (matchId <= 88)  return 'Round of 32';
  if (matchId <= 96)  return 'Round of 16';
  if (matchId <= 100) return 'Quarter-Finals';
  if (matchId <= 102) return 'Semi-Finals';
  if (matchId === 103) return 'Third Place Play-off';
  return 'FINAL';
}

export function formatMatchTime(dateStr: string, timeET: string): string {
  const [h, m] = timeET.split(':').map(Number);
  const utcMs = new Date(dateStr + 'T00:00:00Z').getTime() + (h + 4) * 3600000 + m * 60000;
  return new Date(utcMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
