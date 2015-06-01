voidjs.items = {};

/**
 * AI gun item (turret)
 * This item is used by sentries among others.
 * Aggro system needs to be implemented
 * @progress 60%
 * @param number smart
 * @param number damage
 * @param number speed
 * @param number cooldown
 * @param number magazine
 * @param number reload_time
 * @return function @see create_item
 */
voidjs.items.sentry_gun = function( smart, damage, speed, cooldown, magazine, reload_time) {
  var targeting = function( self, speed ) {
    var target = voidjs.entities[self.target];
    var p2;
    if ( smart ) {
      var p1 = self.GetPosition();
      // Smart guns can predict target future position
      // (this means fukken hard enemies)
      p2 = vcore.predict( p1, speed, target );
    }
    else {
      p2 = target.GetPosition();
    }

    return p2;
  };
  // Use "parent" function for the inner workings
  return voidjs.items.gun(targeting, damage, speed, cooldown, magazine, reload_time);
};

/**
 * Gun item
 * This item is used by sentries among others.
 * Aggro system needs to be implemented
 * @progress 60%
 * @param function targeting Targeting callback that returns a target to shoot at
 * @param number damage
 * @param number speed
 * @param number cooldown
 * @param number magazine
 * @param number reload_time
 * @return function @see create_item
 */
voidjs.items.gun = function( targeting, damage, speed, cooldown, magazine, reload_time, team ) {
  if ( undefined === team )
    team = 2;
  // Set defaults
  if (speed === undefined) {
    speed = 8;
  }
  if (undefined === cooldown) {
    cooldown = 250; // milliseconds
  }
  if (undefined === magazine) {
    magazine = 3; // shots
  }
  if (undefined === reload_time) {
    reload_time = 1000; // milliseconds
  }
  var acd = 0; // active cooldowns
  var bullets = magazine;

  return function(self) {
    //@TODO: Aggro system please =)

    // Enitity is alive / active
    if (self.IsActive()) {
      // Cooldown check
      if (acd > 0) {
        acd-= voidjs.fps;
      }
      else {
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
        var p2 = targeting( self, speed );
        voidjs.entityCreator.create( 'bullet', [p1, p2, speed, damage, team] );
      }
    }
  };
};

/**
 * Shield item ( player )
 * @progress 60%
 * @type item
 * @param number damage
 * @param number cooldown
 * @return function @see create_item
 */
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


/**
 * Activate item script ( to be deprecated)
 * @progress 5%
 * @param object item
 * @param array args
 * @return undefined
 */
voidjs.activate_item = function(item, args) {
  if (typeof item === 'function') {
    item(args);
  }
  else if (typeof item === 'object') {
    item.script(args);
  }
};

/**
 * Sword item ( player )
 * @progress 60%
 * @type item
 * @param number damage
 * @param number cooldown
 * @return object item ??? @see create_item
 */
voidjs.items.player_sword = function(damage, cooldown) {
  if (damage === undefined) {
    damage = 100;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }

  // Que creation. Using an entity as the hitbox
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
