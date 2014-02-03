voidjs.items = {};


voidjs.items.gun = function(smart, damage, speed, cooldown, magazine, reload_time) {
  if (speed === undefined) {
    speed = 8;
  }
  if (!cooldown) {
    cooldown = 250; // milliseconds
  }
  if (!magazine) {
    magazine = 3; // shots
  }
  if (!reload_time) {
    reload_time = 1000; // milliseconds
  }
  var acd = 0; // active cooldowns
  var bullets = magazine;

  return function(self) {
    //@TODO: Aggro system please =)
    var target = voidjs.entities[self.target];

    if (self.IsActive()) {
      if (acd > 0) {
        acd-= voidjs.fps;
      } else {
        // No cooldown active
        // Activate the cooldown
        acd = cooldown;
        if (--bullets <= 0) {
          // Refill the magazine
          bullets = magazine;
          // Apply reload time
          acd = reload_time;
        }
        // Shoot at target
        var p1 = self.GetPosition();
        var p2;
        if (smart) {
          // Smart guns can predict target future position
          // (this means fukken hard enemies)
          p2 = vcore.predict(p1, speed, target);
        }
        else {
          p2 = target.GetPosition();
        }
        voidjs.entityCreator.create('bullet', [p1, p2, speed, damage]);
      }
    }
  };
};

voidjs.items.player_shield = function(damage, cooldown) {
  if (damage === undefined) {
    damage = 100;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }
  // Items are not entities, but they can easily create entities
  // Storing entities in closures is bad.
  // The id is fine because it is not an object
  var shield_id = voidjs.entityCreator.create('player_shield', [cooldown]);
  // Entities are useful for scrips that need to run every frame,
  // but i concede that I need to make an array for non entity scripts
  // to run every frame too.
  return function(self) {
    // Sword and shield are basically the same. Simplify?
    // @TODO: Make this smarter
    var shield = voidjs.entities[shield_id];
    if (self.life > 0 && shield.cd <= 0) {
      shield.life = shield.max_life;
      shield.SetActive(true);
      shield.cd = cooldown;
    }
  };
};


voidjs.activate_item = function(item, args) {
  if (typeof item === 'function') {
    item(args);
  }
  else if (typeof item === 'object') {
    item.script(args);
  }
};
voidjs.items.player_sword = function(damage, cooldown) {
  if (damage === undefined) {
    damage = 100;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }

  // Que creation.
  var sword_id = voidjs.entityCreator.create('player_sword', [cooldown]);

  return {
    entity_id: sword_id,
    script: function(self) {
      var sword = voidjs.entities[sword_id];
      if (sword && self.life > 0 && sword.cd <= 0) {
        sword.activation_id++;
        sword.life = sword.max_life;
        sword.SetPosition(self.GetPosition());
        sword.SetLinearVelocity(self.GetLinearVelocity());
        sword.SetActive(true);
        sword.cd = cooldown;
      }
    }
  };
};