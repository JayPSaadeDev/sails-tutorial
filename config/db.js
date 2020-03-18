/**
 * DB
 * (sails.config.db)
 *
 * This is where the connection to the db occurs.
 * In order to access the instance from the api controllers, do this by typing sails.config.db.instance()
 */

module.exports.db = {
  instance: () => {
    var arangojs = require('arangojs');

    var DB = {
      URL: '127.0.0.1',
      PORT: '8529',
      NAME: 'tutorialDB',
      USERNAME: 'root',
      PASSWORD: '123456'
    };
    // initlializing db
    var con = new arangojs({
      url: `http://${DB.USERNAME}:${DB.PASSWORD}@${DB.URL}:${DB.PORT}/`,
      databaseName: DB.NAME
    }).useDatabase(DB.NAME);
    return con;
  },

  aql: require('arangojs').aql
};
