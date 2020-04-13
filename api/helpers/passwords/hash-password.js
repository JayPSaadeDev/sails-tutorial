const md5 = require('md5');

module.exports = {
  friendlyName: 'Hashes a password using md5',

  description: 'Takes as input a password then returns a hashed md5 password',

  inputs: {
    password: {
      type: 'string',
      description: 'Not hashed password',
    },
  },

  exits: {
    success: {
      description: 'Password is hashed successfully',
    },
  },

  fn: async function (inputs, exits) {
    return exits.success(md5(inputs.password));
  },
};
