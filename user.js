voidjs.user = {};


// Runs a login attempt
voidjs.user.login = function(username, password) {
  vcore.invoke('login_init');
  var credentials = {
    username: username,
    password: password
  };

  // Post the credentials to the login script
  var url = false;

  // Apply filters to the login url
  url = vcore.filter('login_url', url);
  vcore.invoke('login_credentials', credentials);
  if (url) {
    $.ajax({
      type: "POST",
      url: url,
      data: credentials,
      success: function(data, status, jqXHR) {
        vcore.invoke('login_success', data, status, jqXHR);
      },
      error: function(jqXHR, status, error) {
        vcore.invoke('login_error', jqXHR.responseText, status, error, jqXHR);
      },
    });
  }
  else {
    vcore.invoke('login_internal', credentials);
  }
};


voidjs.user.init = function () {
  vcore.hook('login_init', function() {
    alert('Please wait while I post a login request to the server...');
  });


  vcore.hook('login_internal', function() {
    alert('Please wait while I post a login request to the server...');
  });
};
