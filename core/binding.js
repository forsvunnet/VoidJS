// This document is intrinsically deprecated and only added for the purpose of keeping record.
// All code below is to be considered pseudo-code and only used for sketching up the finished idea.

var item_sets = {
  0: {
    0: 'item-51322',
    1: 'item-97641',
    2: 'item-68341',
    3: 'item-98721',
    4: false,
    5: false,
  },
  1: {
    0: 'item-68341',
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  },
  2: false,
  3: false,
  4: {
    1: false,
  }
};

var equipped_set = 0;


var equipped = function( i ) {
  return function() {
    var eq_set = get_equipment_set();
    var item = get_item( eq_set[i] );

    //bind?
  };
};

control[0].keymap = {
  'btn1': 'action1',
  'btn2': 'action2',
  'btn3': 'up',
  'btn4': 'down',
  'btn5': 'right',
  'btn6': 'left',
  'btn8': 'action3',
  'btn7': 'action4',
  'btn9': 'action5',
};


// To bind:
// - Bindings will usually be found on items
var bindings = {
  'keydown': function() { /*...*/ },
  'keyup': function() { /*...*/ },
  'tick': function() { /*...*/ },
};

// eg.:
var bindings = item.bindings;

// Bind
controller[0].bind( 'action1', bindings );
// - or -
controller[0].bind( 'action1', [type], [func] );

// Unbind
controller[0].unbind( 'action1', [type] );



// When triggered
var trigger = function( machine_key, type ) {
  var controller = this;
  var key = controller[0].keymap[machine_key]; // = action1
};

// On keydown:
var machine_key = 'btn1';
controller[0].trigger( machine_key, 'keydown' );
controller[0].ticks[machine_key] = true;


// On game tick
for ( var key in controller[0].ticks ) {
  if ( controller[0].ticks[machine_key] ) {
    controller[0].trigger( machine_key, 'tick' );
  }
}


// On keyup:
var machine_key = 'btn1';
controller[0].trigger( machine_key, 'keyup' );
controller[0].ticks[machine_key] = false;













































