voidjs.menu = {};



(function(menu) {
  // var m = {};
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
  var select_level = function() {
    voidjs.menu.show('SelectLevel');
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
  /*
  m.complete = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Next level')
    )
  );
  m.level_select = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Level 1'),
      $('<li>')
        .m_click(next_level)
        .text('Level 2')
    )
  );
  m.main = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Continue'),
      $('<li>')
        .m_click(select_level)
        .text('Select level'),
      $('<li>')
        .m_click(select_level)
        .text('Player settings')
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
  */


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

// } )//( voidjs.menu );
// ( function( menu ) {
  var container = $('#menu-container');
  var book_list = $('<ul>');
  var chapter_list = $('<ul>');
  var section_list = $('<ul>');

  var book1 = $('<li>');
  var chapter1 = $('<li>');
  var section1 = $('<li>');

  var variables = {
    on: {
      book: $('<span>').text('Book 1: The first book'),
      chapter: $('<span>').text('Chapter 1: The first chapter'),
      section: $('<span>').text('Section 1: The first section')
    },
    list: {
      book: book_list,
      chapter: chapter_list,
      section: section_list
    }
  };

  menu.hide = function() { container.hide(); };
  container.html( function( index, oldHtml ) {
    return oldHtml.replace( /{{/g, '<span class="placeholder">').replace( /}}/g, '</span>')
  } );

  $( '.placeholder', container ).replaceWith( function() {
    var parts = $(this).text().split(':');
    return variables[parts[0]][parts[1]];
  } );

  var catalog = {
    main: $('#main-menu'),
    level_complete: $('#level-complete'),
    level_select: $('#level-select'),
    pause: $('#pause'),
  };

  menu.show = function(part) {
  $('.menu').hide();
    container.show();
    var elements = [];
    var active_menu = false;
    switch (part) {
      case 'LevelComplete':
        active_menu = catalog.level_complete;
        break;
      case 'SelectLevel':
        active_menu = catalog.level_select;
        break;
      case 'Pause':
        active_menu = catalog.pause;
        break;
      case 'Other':
      break;

      case 'Main':
      default:
        active_menu = catalog.main;
        break;
    }

    if ( active_menu ) {
      active_menu.show();
    }

    if (!$('li.selected:visible').length) {
      $('li:visible:eq(0)').addClass('selected');
    }

    vcore.invoke('menu_show', part);
  }; // - show menu


  $('[data-action="continue_play"] a').m_click(
    function() {
      voidjs.goto('game', 1);
    });
  $('[data-action="select_level"] a').m_click( menu.hide );
} ( voidjs.menu ) );

// Implement a hook to move around the menu with controllers
vcore.hook( 'player_action', function(args) {
  var key = args[2];
  if ( !voidjs.world ) {
    // @TODO: Each controller gets own pause menu
    if ( 'fire' == key || 'select' == key ) {
      voidjs.menu.select();
    }
    else if ( 'up' == key || 'left' == key ) {
      voidjs.menu.prev();
    }
    else if ( 'down' == key || 'right' == key ) {
      voidjs.menu.next();
    }
  }
  else {
    if ( 'pause' == key ) {
      voidjs.menu.show( 'Pause' );
    }
  }
} );
