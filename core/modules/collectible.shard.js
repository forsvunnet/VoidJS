voidjs.module.collectible.shard = {
  style : {
    type: 'square',
    fill: 'red'
  },
  script : function(player) {
    if (player.inventory.shard === undefined) {
      player.inventory.shard = 0;
    }
    player.inventory.shard++;
  }
};