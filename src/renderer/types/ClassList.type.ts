export interface ClassList {
  class: string;
  specs: specs[];
}

interface specs {
  name: string;
  specID: string;
}

export const classLists: ClassList[] = [
  {
    class: 'warrior',
    specs: [
      {
        name: 'arms',
        specID: '1',
      },
      {
        name: 'fury',
        specID: '2',
      },
      {
        name: 'protection',
        specID: '3',
      },
      {
        name: 'general',
        specID: '33',
      },
    ],
  },
  {
    class: 'paladin',
    specs: [
      {
        name: 'holy',
        specID: '4',
      },
      {
        name: 'protection',
        specID: '5',
      },
      {
        name: 'retribution',
        specID: '6',
      },
      {
        name: 'general',
        specID: '34',
      },
    ],
  },
  {
    class: 'hunter',
    specs: [
      {
        name: 'beastmastery',
        specID: '7',
      },
      {
        name: 'marksmanship',
        specID: '8',
      },
      {
        name: 'survival',
        specID: '9',
      },
      {
        name: 'general',
        specID: '35',
      },
    ],
  },
  {
    class: 'rogue',
    specs: [
      {
        name: 'assassination',
        specID: '10',
      },
      {
        name: 'combat',
        specID: '11',
      },
      {
        name: 'subtlety',
        specID: '12',
      },
      {
        name: 'general',
        specID: '36',
      },
    ],
  },
  {
    class: 'priest',
    specs: [
      {
        name: 'holy',
        specID: '13',
      },
      {
        name: 'discipline',
        specID: '14',
      },
      {
        name: 'shadow',
        specID: '15',
      },
      {
        name: 'general',
        specID: '37',
      },
    ],
  },
  {
    class: 'deathknight',
    specs: [
      {
        name: 'blood',
        specID: '16',
      },
      {
        name: 'frost',
        specID: '17',
      },
      {
        name: 'unholy',
        specID: '18',
      },
      {
        name: 'general',
        specID: '38',
      },
    ],
  },
  {
    class: 'shaman',
    specs: [
      {
        name: 'elemental',
        specID: '19',
      },
      {
        name: 'enhancement',
        specID: '20',
      },
      {
        name: 'restoration',
        specID: '21',
      },
      {
        name: 'stonewarden',
        specID: '32',
      },
      {
        name: 'general',
        specID: '39',
      },
    ],
  },
  {
    class: 'mage',
    specs: [
      {
        name: 'arcane',
        specID: '22',
      },
      {
        name: 'fire',
        specID: '23',
      },
      {
        name: 'frost',
        specID: '24',
      },
      {
        name: 'general',
        specID: '40',
      },
    ],
  },
  {
    class: 'warlock',
    specs: [
      {
        name: 'affliction',
        specID: '25',
      },
      {
        name: 'demonology',
        specID: '26',
      },
      {
        name: 'destruction',
        specID: '27',
      },
      {
        name: 'general',
        specID: '41',
      },
    ],
  },
  {
    class: 'druid',
    specs: [
      {
        name: 'balance',
        specID: '28',
      },
      {
        name: 'feral',
        specID: '29',
      },
      {
        name: 'restoration',
        specID: '30',
      },
      {
        name: 'guardian',
        specID: '31',
      },
      {
        name: 'general',
        specID: '42',
      },
    ],
  },
];
