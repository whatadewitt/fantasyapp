var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  player_key: String,
  name: String,
  head: String,
  team: String,
  position: String,
  cost: { type: Number, default: 3 }
});
var Player = mongoose.model('Player', PlayerSchema);

module.exports = Player;