var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
  team_key: String,
  name: String,
  logo: String,
  value: Number,
  players: Array
});
var Team = mongoose.model('Team', TeamSchema);

module.exports = Team;