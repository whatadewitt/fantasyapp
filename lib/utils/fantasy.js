var async = require("async");

var conf = require("../../conf/conf.json");
var oauth = require("./oauth.js");

var Team = require("../models/team");
var Cache = require("../models/cache");
var Draft = require("../models/draft");
var Player = require("../models/player");

var league = conf.LEAGUE_ID;

// TODO: Better error handling...

exports.getTeams = function(callback) {
  Team.find({}).sort("-value").execFind(function(e, teams) {
    if (e) throw e;
    return callback(null, teams);
  });
};

exports.updateTeamValues = function(callback) {
  Team.find({}, function(e, teams) {
    if (e) return callback(e);

    async.eachSeries(teams, function(t, cb) {
      exports.updateTeamValue(t.team_key, function() {
        cb(null);
      });
    }, function(e) {
      if (e) return callback(e);

      Team.find({}, function(e, teams) {
        if (e) return callback(e);

        return callback(null, teams);
      });
    });
  });
};

exports.doTeamValueCheck = function(callback) {
  exports.checkTransactions(function(last_transaction) {
    // check last saved transaction against the last transaction that has happened in the league
    var updateFlag = false;

    Cache.findOne( { key: "last_transaction" }, function(e, lt) {
      if (e) return callback(e);

      if (null === lt) {
        // if we"ve never had a transaction for this league we want to save it...
        lt = new Cache({
          key: "last_transaction",
          value: last_transaction
        });

        updateFlag = true;
      } else if (last_transaction !== lt.value) {
        // or there"s been a new transaction...
        lt.value = last_transaction;

        updateFlag = true;
      }

      if (updateFlag) {
        // update the transaction number
        lt.save(function(e, c) {
          if (e) return callback(e);

          // ... and now update the team values
          exports.updateTeamValues(function(e, teams) {
            if (e) return callback(e);

            return callback(null, teams);
          });
        });
      } else {
        // if no new transactions, just return the teams as they are
        exports.getTeams(function(e, teams) {
          if (e) return callback(e);

          return callback(null, teams);
        });
      }
    });
  });
};

exports.getDraftResults = function(req, res) {
  oauth.get(
    "http://fantasysports.yahooapis.com/fantasy/v2/league/" + league + "/draftresults?format=json",
    null,
    null,
    function(e, data, resp) {
      data = JSON.parse(data);

      var draft = data.fantasy_content.league[1].draft_results;
      var notfound = [];

      async.each(Object.keys(draft), function(pick, cb) {
        if ("object" == typeof(draft[pick])) {
          // check to see if this player has already been brought in to the db
          Draft.find({ player_key: draft[pick].draft_result.player_key }, function(e, dp) {
            if (e) return cb(e);

            if (0 === dp.length) {
              // insert them if they have not been
              var draftpick = new Draft({
                player_key: draft[pick].draft_result.player_key,
                cost: draft[pick].draft_result.cost
              });

              draftpick.save(function(e, draftpick) {
                if (e) return cb(e);

                return cb(null);
              });
            }
          });
        } else {
          return cb(null);
        }
      }, function(e) {
        if (e) throw e;
      }
    );

    res.json({ "draft_import": "success" });
  });
};

exports.getPlayers = function(keys, cb) {
  //console.log("http://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=" + keys.join(",") + "?format=json");
  oauth.get(
    "http://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=" + keys.join(",") + "?format=json",
    null,
    null,
    function(e, data, resp) {
      data = JSON.parse(data);
      cb(data);
  });
};

exports.getDraftedPlayers = function(req, res) {
  Draft.find(function(e, players) {
    var keys = players.map(function(p) {
      return p.player_key;
    });

    exports.getPlayers(keys, function(data) {
      res.json(data);
    });
  });
};

exports.checkTransactions = function(cb) {
  oauth.get(
    "http://fantasysports.yahooapis.com/fantasy/v2/league/" + league + "/transactions?format=json",
    null,
    null,
    function(e, data, resp) {
      data = JSON.parse(data);

      var last_transaction = data.fantasy_content.league[1].transactions.count;
      cb(last_transaction);
    }
  );
};

exports.updateTeamValue = function(team, callback) {
  oauth.get(
    "http://fantasysports.yahooapis.com/fantasy/v2/team/" + team + "/roster?format=json",
    null,
    null,
    function(e, data, resp) {
      data = JSON.parse(data);

      var roster = data.fantasy_content.team[1].roster[0].players;
      var value = 0;
      var players = [];

      async.each(Object.keys(roster), function(player, cb) {
        if ("object" == typeof(roster[player])) {
          Draft.findOne({ player_key: roster[player].player[0][0].player_key }, function(e, p) {
            if (e) return cb(e);

            var cost = conf.FREE_AGENT_COST;
            if (null !== p) {
              cost = p.cost;
            }

            value += cost;

            players.push({
              name: roster[player].player[0][2].name.full,
              team: roster[player].player[0][6].editorial_team_abbr,
              pos: roster[player].player[0][8].display_position,
              img: roster[player].player[0][9].image_url,
              pos_type: roster[player].player[0][11].position_type,
              cost: cost
            });

            return cb(null);
          });
        } else {
          return cb(null);
        }
      }, function(e) {
        if (e) callback(e);

        Team.findOne({ team_key: team }, function(e, t) {
          if (e) callback(e);

          t.value = value;
          t.players = players;
          t.save(function(e, t) {
            if (e) return callback(e);

            return callback(null);
          });
        });

      });
   });
};

exports.getLeagueTeams = function(req, res) {
  oauth.get(
    "http://fantasysports.yahooapis.com/fantasy/v2/league/" + league + "/teams?format=json",
    null,
    null,
    function(e, data, resp) {
      data = JSON.parse(data);
      var teams = data.fantasy_content.league[1].teams;

      async.each(Object.keys(teams), function(team, cb) {
        if ("object" == typeof(teams[team])) {
          // check to see if the team exists
          Team.find({ team_key: teams[team].team[0][0].team_key }, function(e, t) {
            if (e) return cb(e);

            if (0 === t.length) {
              // if the team doesn"t exist, create a new one
              var newteam = new Team({
                team_key: teams[team].team[0][0].team_key,
                name: teams[team].team[0][2].name,
                logo: teams[team].team[0][5].team_logos[0].team_logo.url,
                value: 0
              });

              // TODO: If the team does exist, make sure the name is up to date
              newteam.save(function(e, nt) {
                if (e) return cb(e);

                return cb(null);
              });
            }
          });
        } else {
          return cb(null);
        }
      }, function(e) {
        if (e) throw e;
      });

      // return a list
      res.json(teams);
   });
};