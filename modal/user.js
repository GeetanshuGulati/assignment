/**
 * Created by geetanshu on 2/12/17.
 */
var mongoose = require("mongoose")
var Schema = mongoose.Schema

var userSchema = mongoose.model('users',new Schema({
    name:"String"
}))

var teamSchema = mongoose.model('teams',new Schema({
    name:"String",
    isDomestic:"Boolean",
    country:"String"
}))

module.exports = {
    userSchema,
    teamSchema
}