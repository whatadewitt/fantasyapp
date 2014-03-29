
/*
 * GET home page.
 */

var fantasy = require("../lib/utils/fantasy");
var _ = require("lodash");

exports.index = function(req, res){
  fantasy.doTeamValueCheck(function(e, teams) {
    if (e) throw e;

    _.forEach( teams, function(team) {
      var players = team.players;
      // console.log(players);
      players =  _.sortBy( players, "cost" ).reverse();
      // console.log(players);
      team.players = players;
    });

    teams = _.sortBy(teams, function(team) { return team.value; }).reverse();

    res.render("index", { team_data: teams });
  });
};
