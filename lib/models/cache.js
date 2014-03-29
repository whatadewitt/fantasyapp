var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CacheSchema = new Schema({
  key: String,
  value: Schema.Types.Mixed
});
var Cache = mongoose.model('Cache', CacheSchema);

module.exports = Cache;