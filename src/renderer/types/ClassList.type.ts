interface specs {
  name: string;
  specID: string;
}

export interface ClassList {
  class: string;
  specs: specs[];
}

export const classLists: ClassList[] = [
  {
    class: 'warrior',
    specs: [
      {
        name: 'Arms',
        specID: '1',
      },
      {
        name: 'Fury',
        specID: '2',
      },
      {
        name: 'Protection',
        specID: '3',
      },
      {
        name: 'General Tree',
        specID: '33',
      },
    ],
  },
  {
    class: 'paladin',
    specs: [
      {
        name: 'Holy',
        specID: '4',
      },
      {
        name: 'Protection',
        specID: '5',
      },
      {
        name: 'Retribution',
        specID: '6',
      },
      {
        name: 'General Tree',
        specID: '34',
      },
    ],
  },
  {
    class: 'hunter',
    specs: [
      {
        name: 'Beast Mastery',
        specID: '7',
      },
      {
        name: 'Marksmanship',
        specID: '8',
      },
      {
        name: 'Survival',
        specID: '9',
      },
      {
        name: 'General Tree',
        specID: '35',
      },
    ],
  },
  {
    class: 'rogue',
    specs: [
      {
        name: 'Assassination',
        specID: '10',
      },
      {
        name: 'Combat',
        specID: '11',
      },
      {
        name: 'Subtlety',
        specID: '12',
      },
      {
        name: 'General Tree',
        specID: '36',
      },
    ],
  },
  {
    class: 'priest',
    specs: [
      {
        name: 'Holy',
        specID: '13',
      },
      {
        name: 'Discipline',
        specID: '14',
      },
      {
        name: 'Shadow',
        specID: '15',
      },
      {
        name: 'General Tree',
        specID: '37',
      },
    ],
  },
  {
    class: 'deathknight',
    specs: [
      {
        name: 'Blood',
        specID: '16',
      },
      {
        name: 'Frost',
        specID: '17',
      },
      {
        name: 'Unholy',
        specID: '18',
      },
      {
        name: 'General Tree',
        specID: '38',
      },
    ],
  },
  {
    class: 'shaman',
    specs: [
      {
        name: 'Elemental',
        specID: '19',
      },
      {
        name: 'Enhancement',
        specID: '20',
      },
      {
        name: 'Restoration',
        specID: '21',
      },
      {
        name: 'Stonewarden',
        specID: '32',
      },
      {
        name: 'General Tree',
        specID: '39',
      },
    ],
  },
  {
    class: 'mage',
    specs: [
      {
        name: 'Arcane',
        specID: '22',
      },
      {
        name: 'Fire',
        specID: '23',
      },
      {
        name: 'Frost',
        specID: '24',
      },
      {
        name: 'General Tree',
        specID: '40',
      },
    ],
  },
  {
    class: 'warlock',
    specs: [
      {
        name: 'Affliction',
        specID: '25',
      },
      {
        name: 'Demonology',
        specID: '26',
      },
      {
        name: 'Destruction',
        specID: '27',
      },
      {
        name: 'General Tree',
        specID: '41',
      },
    ],
  },
  {
    class: 'druid',
    specs: [
      {
        name: 'Balance',
        specID: '28',
      },
      {
        name: 'Feral',
        specID: '29',
      },
      {
        name: 'Restoration',
        specID: '30',
      },
      {
        name: 'Guardian',
        specID: '31',
      },
      {
        name: 'General Tree',
        specID: '42',
      },
    ],
  },
];
