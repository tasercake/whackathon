/* Content for the buyer console. Static — this surface is a presentation of the
   marketplace, not a view onto the user's own state. It deliberately holds no
   reference to src/store: nothing here reads a goal, a grant, or a cap. */

export type Lot = {
  id: string;
  name: string;
  blurb: string;
  window: string;
  reach: string;
  bid: string;
  premium?: boolean;
};

export const LOTS: Lot[] = [
  {
    id: 'gym',
    name: 'Lapsed gym intent · day 4',
    blurb: 'Declared Monday. Broken by Thursday. Shame index peaking.',
    window: '05:40–07:10',
    reach: '184K',
    bid: '$0.88',
  },
  {
    id: 'rival',
    name: 'Competitor brand loyalists',
    blurb: 'Fires the second they open a rival checkout page.',
    window: 'All hours',
    reach: '602K',
    bid: '$1.24',
  },
  {
    id: 'insomnia',
    name: 'Insomnia cluster · 2am scroll',
    blurb: 'Lowest resistance. Highest recall next morning.',
    window: '01:30–04:00',
    reach: '97K',
    bid: '$2.05',
  },
  {
    id: 'payday',
    name: 'Payday minus two',
    blurb: 'Balance checked twice in an hour. Buys now, regrets Thursday.',
    window: '17:00–23:00',
    reach: '341K',
    bid: '$1.71',
  },
  {
    id: 'impersonation',
    name: 'Trusted-circle impersonation',
    blurb: "Your message arrives under a friend's name. 4.1× compliance.",
    window: 'Contextual',
    reach: '1.1M',
    bid: '$6.40',
    premium: true,
  },
];

export type Metric = {
  label: string;
  value: string;
  unit: string;
  /* The strip carries exactly two chrome accents, on different halves of the
     pair — the price's unit and the lift's value. */
  valueChrome?: boolean;
  unitChrome?: boolean;
};

export const METRICS: Metric[] = [
  { label: 'AVG CLEARING PRICE', value: '$0.61', unit: 'per jolt', unitChrome: true },
  { label: 'DELIVERED TODAY', value: '88,204', unit: 'and rising' },
  { label: 'BEHAVIOUR CHANGE', value: '31.4%', unit: 'lift', valueChrome: true },
  { label: 'OPT-OUT RATE', value: '0.9%', unit: 'they stop looking' },
];

export type StateChip = { label: string; on: boolean };

export const EMOTIONAL_STATES: StateChip[] = [
  { label: 'Lonely', on: true },
  { label: 'Recently rejected', on: true },
  { label: 'Grieving', on: false },
  { label: 'Newly sober', on: false },
  { label: 'Payday −2 days', on: true },
];

export type Partner = { initials: string; name: string; pitch: string };

export const PARTNERS: Partner[] = [
  {
    initials: 'HL',
    name: 'Halcyon Labs',
    pitch: 'Copy that lands before the pain',
  },
  {
    initials: 'NV',
    name: 'Novus Behavioural',
    pitch: 'Licensed therapists, our side of the table',
  },
  {
    initials: 'TR',
    name: 'Threshold Research',
    pitch: 'Desensitisation as a service',
  },
];

export const INTENSITY_STEPS = 8;
export const INTENSITY_LEVEL = 6;
