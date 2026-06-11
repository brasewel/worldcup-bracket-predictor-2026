// June 11, 2026 19:00 UTC = 3:00 PM ET (Mexico vs South Africa kickoff)
export const DEADLINE_ISO = '2026-06-11T19:00:00Z';
export const DEADLINE_MS = new Date(DEADLINE_ISO).getTime();

export const GROUPS: Record<string, { flag: string; name: string }[]> = {
  A: [
    { flag: '\uD83C\uDDF2\uD83C\uDDFD', name: 'Mexico' },
    { flag: '\uD83C\uDDFF\uD83C\uDDE6', name: 'South Africa' },
    { flag: '\uD83C\uDDF0\uD83C\uDDF7', name: 'South Korea' },
    { flag: '\uD83C\uDDE8\uD83C\uDDFF', name: 'Czechia' },
  ],
  B: [
    { flag: '\uD83C\uDDE8\uD83C\uDDE6', name: 'Canada' },
    { flag: '\uD83C\uDDE7\uD83C\uDDE6', name: 'Bosnia & Herzegovina' },
    { flag: '\uD83C\uDDF6\uD83C\uDDE6', name: 'Qatar' },
    { flag: '\uD83C\uDDE8\uD83C\uDDED', name: 'Switzerland' },
  ],
  C: [
    { flag: '\uD83C\uDDE7\uD83C\uDDF7', name: 'Brazil' },
    { flag: '\uD83C\uDDF2\uD83C\uDDE6', name: 'Morocco' },
    { flag: '\uD83C\uDDED\uD83C\uDDF9', name: 'Haiti' },
    { flag: '\uD83C\uDFF4\uDDB3\uDC67\uDC62\uDC73\uDC63\uDC74\uDDB3', name: 'Scotland' },
  ],
  D: [
    { flag: '\uD83C\uDDFA\uD83C\uDDF8', name: 'USA' },
    { flag: '\uD83C\uDDF5\uD83C\uDDFE', name: 'Paraguay' },
    { flag: '\uD83C\uDDE6\uD83C\uDDFA', name: 'Australia' },
    { flag: '\uD83C\uDDF9\uD83C\uDDF7', name: 'T\u00fcrkiye' },
  ],
  E: [
    { flag: '\uD83C\uDDE9\uD83C\uDDEA', name: 'Germany' },
    { flag: '\uD83C\uDDE8\uD83C\uDDFC', name: 'Cura\u00e7ao' },
    { flag: '\uD83C\uDDE8\uD83C\uDDEE', name: 'Ivory Coast' },
    { flag: '\uD83C\uDDEA\uD83C\uDDE8', name: 'Ecuador' },
  ],
  F: [
    { flag: '\uD83C\uDDF3\uD83C\uDDF1', name: 'Netherlands' },
    { flag: '\uD83C\uDDEF\uD83C\uDDF5', name: 'Japan' },
    { flag: '\uD83C\uDDF8\uD83C\uDDEA', name: 'Sweden' },
    { flag: '\uD83C\uDDF9\uD83C\uDDF3', name: 'Tunisia' },
  ],
  G: [
    { flag: '\uD83C\uDDE7\uD83C\uDDEA', name: 'Belgium' },
    { flag: '\uD83C\uDDEA\uD83C\uDDEC', name: 'Egypt' },
    { flag: '\uD83C\uDDEE\uD83C\uDDF7', name: 'Iran' },
    { flag: '\uD83C\uDDF3\uD83C\uDDFF', name: 'New Zealand' },
  ],
  H: [
    { flag: '\uD83C\uDDEA\uD83C\uDDF8', name: 'Spain' },
    { flag: '\uD83C\uDDE8\uD83C\uDDFB', name: 'Cape Verde' },
    { flag: '\uD83C\uDDF8\uD83C\uDDE6', name: 'Saudi Arabia' },
    { flag: '\uD83C\uDDFA\uD83C\uDDFE', name: 'Uruguay' },
  ],
  I: [
    { flag: '\uD83C\uDDEB\uD83C\uDDF7', name: 'France' },
    { flag: '\uD83C\uDDF8\uD83C\uDDF3', name: 'Senegal' },
    { flag: '\uD83C\uDDEE\uD83C\uDDF6', name: 'Iraq' },
    { flag: '\uD83C\uDDF3\uD83C\uDDF4', name: 'Norway' },
  ],
  J: [
    { flag: '\uD83C\uDDE6\uD83C\uDDF7', name: 'Argentina' },
    { flag: '\uD83C\uDDE9\uD83C\uDDFF', name: 'Algeria' },
    { flag: '\uD83C\uDDE6\uD83C\uDDF9', name: 'Austria' },
    { flag: '\uD83C\uDDEF\uD83C\uDDF4', name: 'Jordan' },
  ],
  K: [
    { flag: '\uD83C\uDDF5\uD83C\uDDF9', name: 'Portugal' },
    { flag: '\uD83C\uDDE8\uD83C\uDDE9', name: 'DR Congo' },
    { flag: '\uD83C\uDDFA\uD83C\uDDFF', name: 'Uzbekistan' },
    { flag: '\uD83C\uDDE8\uD83C\uDDF4', name: 'Colombia' },
  ],
  L: [
    { flag: '\uD83C\uDFF4\uDDB3\uDC67\uDC62\uDC65\uDC6E\uDC67\uDDB3', name: 'England' },
    { flag: '\uD83C\uDDED\uD83C\uDDF7', name: 'Croatia' },
    { flag: '\uD83C\uDDEC\uD83C\uDDED', name: 'Ghana' },
    { flag: '\uD83C\uDDF5\uD83C\uDDE6', name: 'Panama' },
  ],
};

// football-data.org match IDs mapped to our 1-104 match numbers
export const FD_MATCH_IDS: number[] = [537327,537328,537333,537345,537334,537339,537340,537346,537351,537357,537352,537358,537369,537363,537370,537364,537391,537392,537397,537398,537403,537409,537410,537404,537329,537335,537336,537330,537348,537342,537341,537347,537359,537353,537354,537360,537371,537365,537372,537366,537399,537393,537394,537400,537405,537411,537412,537406,537337,537338,537344,537343,537331,537332,537355,537356,537361,537362,537349,537350,537395,537396,537373,537374,537367,537368,537413,537414,537407,537408,537401,537402,537417,537423,537415,537418,537424,537416,537425,537426,537422,537421,537420,537419,537429,537428,537427,537430,537376,537375,537377,537378,537379,537380,537381,537382,537383,537384,537385,537386,537387,537388,537389,537390];
