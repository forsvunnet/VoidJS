voidjs.menu = {};



(function(menu) {
  var m = {};
  // Small helper jquery function
  $.fn.m_click = function(action) {
    $(this).click(function() {
        menu.hide();
        action();
      });
    return this;
  };
  // Build menues
  // @TODO: Factorise menu out of core

  var next_level = function() {
    chapter = voidjs.chapter;
    chapter = chapter+1<voidjs.levels.length ? chapter+1 : 0;
    voidjs.goto('game', chapter);
  };
  var inventory = function() {
    alert('accessing inventory');
    voidjs.menu.show('main');
  };


  // #1 : Level selection
  // #2 : Sound options
  // #3 : Control options
  // #4 : Progression status
  // #5 : Game settings??
  m.complete = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Next level'),
      $('<li>')
        .m_click(inventory)
        .text('Inventory')
    )
  );
  m.main = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Play'),
      $('<li>')
        .m_click(inventory)
        .text('Inventory')
    )
  );
  m.pause = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(voidjs.menu.hide)
        .text('Continue'),
      $('<li>')
        .m_click(function() {
          window.clearInterval(voidjs.ticker);
          voidjs.goto('menu', 'Main');
        })
        .text('Exit to main menu')
    )
  );

  for (var x in m) {
    $('#menu').append(m[x]);
  }

  menu.show = function(part) {
    var elements = [];
    switch (part) {
      case 'LevelComplete':
        m.complete.show();
        break;
      case 'Pause':
        m.pause.show();
        break;
      case 'Other':
      break;

      default:
        m.main.show();
        break;
    }

    if (!$('li.selected:visible').length) {
      $('li:visible:eq(0)').addClass('selected');
    }

    vcore.invoke('menu_show', part);
  }; // - show menu
  menu.hide = function(part) {
    for (var x in m) {
      m[x].hide();
    }
    vcore.invoke('menu_hide', part);
  }; // - show menu

  menu.next = function() {
    if (!$('li.selected:visible').length) {
      $('li:visible:eq(0)').addClass('selected');
    } else {
      $('li.selected')
        .removeClass('selected')
        .next()
        .addClass('selected');
      vcore.invoke('menu_next');
    }
  };
  menu.prev = function() {
    if (!$('li.selected:visible').length) {
      $('li:visible:eq(0)').addClass('selected');
    } else {
      $('li.selected')
        .removeClass('selected')
        .prev()
        .addClass('selected');
      vcore.invoke('menu_prev');
    }
  };
  menu.select = function() {
    $('li.selected').click();
    vcore.invoke('menu_select');
  };

})(voidjs.menu);


// Implement a hook to move around the menu with controllers
vcore.hook('player_action', function(args) {
  var key = args[2];
  if (!voidjs.world) {
    // @TODO: Each controller gets own pause menu
    if ('fire' == key || 'select' == key) {
      voidjs.menu.select();
    }
    else if ('up' == key || 'left' == key) {
      voidjs.menu.prev();
    }
    else if ('down' == key || 'right' == key) {
      voidjs.menu.next();
    }
  }
  else {
    if ('pause' == key) {
      voidjs.menu.show('Pause');
    }
  }
});