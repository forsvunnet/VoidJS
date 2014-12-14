
( function( v ) {
  var constant = {
    max_slots: 5
  };
  v.inventory = {};
  v.inventory.new = function() {
    var equipped = {};
    var items = [];

    vcore.invoke( 'inventory-new', this, equipped, items );
    var helper = {};
    helper.equip = function( item, slot ) {
      if ( 'number' !== typeof slot || !( 0 < slot && constant.max_slots > slot ) ) {
        return false;
      }
      vcore.invoke( 'inventory-equip', this, item, slot, equipped, items );

      // @TODO: bind slot to slot action ( button )
    };
    helper.push = function( item ) {
      equipped[0] = item;
      items.push( item );
      vcore.invoke( 'inventory-push', this, item, equipped, items );

      // @TODO: bind slot to slot action ( button )
    };

    // Bind arrays and functions
    return {
      equipped: equipped,
      items: items,
      equip: helper.equip,
      push: helper.push
    };
  };
}( voidjs ) );
