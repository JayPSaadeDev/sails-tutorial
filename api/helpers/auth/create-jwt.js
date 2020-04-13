const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Creates a JWT token',
  description: 'Creates a JWT token with the provided payload.',
  inputs: {
    payload: {
      type: 'string',
      friendlyName: 'Payload',
      description: 'The payload',
      required: true,
    },
  },
  exits: {
    success: {
      description: 'Invalid token or no authentication present.',
    },
  },
  fn: async function (inputs, exits) {
    const token = jwt.sign(inputs.payload, sails.config.custom.JWT_SECRET);
    return exits.success(token);
  },
};
