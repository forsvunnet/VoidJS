<?php

// The minimum of variables needed

// Leave blank if untargeted pulling is wanted
define('GIT_BRANCH', '');

// Set to false if pulling regardless of errors is wanted
define('GIT_STRICT', FALSE);

// Specify a logfile
define('GIT_LOGFILE', 'gitlog.txt');

// Set the timezone for logging purposes:
define('GIT_TIMEZONE', 'CET');

// The command to send the system
define('GIT_COMMAND', 'git pull');

// If the .git/config file is not properly set up you can use this definition instead:
// define('GIT_COMMAND', 'git pull origin ' . GIT_BRANCH); // NB! replace origin with the name of the remote

if (GIT_TIMEZONE !== '') {
  date_default_timezone_set(GIT_TIMEZONE);
}

// Keep in mind that PHP allows [] to be used on strings
// when validating variables from post and get
if (
  // Make sure post variable is set!
  isset($_POST) &&
  // Make sure it is an array
  is_array($_POST)
  ) {
  // By this point we're fairly confident that this script was not triggered by accident

  // Since we got this far we want to see if there is any recognisable variables in the post array
  // We could log everything, but then what good is the repo? That is what we've got git for.
  // All we really need is branch, (server) time and commit pointer

  // Set up some useful variables;
  $errors = FALSE;
  $match_branch = FALSE;
  $commit_log = array();
  $log = '';
  $data = FALSE;

  // BitBucket stores the POST data as json in the 'payload' value
  if (isset($_POST['payload'])) {
    // Make a propper assoc out of her!
    $data = json_decode($_POST['payload'], true);
  }

  // We know $_POST is an array so no need to worry about false string positives
  if (is_array($data) && isset($data['commits']) && is_array($data['commits'])) {
    $commits = $data['commits'];
    // Loop through the commits:
    foreach ($commits as $commit) {
      // Make sure there is no monkeybusiness in the commit
      if (is_array($commit) && isset($commit['node'], $commit['message'])) {
        $author = isset($commit['author'])?$commit['author']:'Anonymous';
        $commit['message'] = strtr($commit['message'], array(
          "\n" => '',
          "\r" => ''
        ));
        $commit_log[] = '"' . $commit['node'] . '" : "' . $commit['message'] . '" - ' . $author;
      }
      else {
        // Something wrong with the commit item
        $errors = TRUE;
      }

      if ($commit['branch'] == GIT_BRANCH) {
        $match_branch = TRUE;
      }
    } // End commit itteration
  }
  else {
    // No information from the post
    $errors = TRUE;
  }

  // The target branch came up in the logs, no errors and a healthy log
  if (!$errors && count($commit_log) > 0) {
    // Log the occurence
    $log = "/v={\n\t" . implode(",\n\t", $commit_log) . "\n}";

    // Make sure the target branch was in the commit, or no target
    if (GIT_BRANCH == '' || $match_branch) {
      _log($log);
      _git_commands();
    }
    else {
      // Just log since our target branch was not found
      _log($log);
    }
  }
  else if (!GIT_STRICT) {
    // Logg the whole array of madness
    if ($data) {
      $log = '/!=' . serialize($data);
    } else {
      $log = '/!=Invalid Data';
    }
    _log($log);
    _git_commands();
  }
}
// Any visits not carrying post data are not interesting

function _git_commands() {
  // Use exec so we can make sure nothing goes wrong
  exec(GIT_COMMAND, $response, $code);
  if ($code != '0' ) {
    // Log any error..
    _log('/x='. $code . ' -> ' . serialize($response));

    // At this point we should probably send an email to someone..
    // Logs are well and good, but they don't get checked very often
    mail(
      'landa@drivdigital.no', 
      'git error! - ' . dirname(__FILE__),
      var_export($_POST) . "\n\n" .
      file_get_contents(GIT_LOGFILE)
    );
  }
}

function _log($log = '') {
  $ip = '0.0.0.0';
  if (isset($_SERVER) && is_array($_SERVER) && isset($_SERVER['REMOTE_ADDR'])){
    $ip = $_SERVER['REMOTE_ADDR'];
  }
  // NB! date('c') requires PHP 5
  file_put_contents(GIT_LOGFILE, $ip . '@' . date('c') . ' - ' . $log . "\n" , FILE_APPEND);
}

// As the WordPress saying goes: Silence is golden!