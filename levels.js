// Levels are reffered to 1 indexed
voidjs.levels = [
  { // Level 1
    walls : [
      {x: 10, y: 400 / 30 + 1.8, w: 20, h: 2},
      {x: 10, y: -1.8, w: 20, h: 2},
      {x: -1.8, y: 13, w: 2, h: 14},
      {x: 21.8, y: 13, w: 2, h: 14},
      {x: 10, y: 200/30, w: 2, h: 2, a: Math.PI/4}
    ],
    zones : [
    //The first ZONE acts as the starting point
      {type: 'checkpoint', x: 3, y: 3},
      {type: 'checkpoint', x: 3, y: 10},
      {type: 'end', x: 17, y: 10}
    ],
    collectibles : [
      {type:'shard', x:1,y:1}
    ]
  },{ // Level 2
    walls : [
      {x: 10, y: 400 / 30 + 1.8, w: 20, h: 2},
      {x: 10, y: -1.8, w: 20, h: 2},
      {x: -1.8, y: 13, w: 2, h: 14},
      {x: 21.8, y: 13, w: 2, h: 14},
      {x: 10, y: 10/3, w: 2, h: 2, a: Math.PI/4},
      {x: 10, y: 30/3, w: 2, h: 2, a: Math.PI/4}
    ],
    zones : [
    //The first ZONE acts as the starting point
      {type: 'checkpoint', x: 3, y: 3},
      {type: 'checkpoint', x: 10, y: 20/3},
      {type: 'end', x: 17, y: 10}
    ],
    collectibles : [
      {x:0,y:0}
    ]
  }
];