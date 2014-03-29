var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DraftCache = new Schema({
  player_key: String,
  cost: { type: Number, default: 3 }
});
var Draft = mongoose.model('Draft', DraftCache);

module.exports = Draft;