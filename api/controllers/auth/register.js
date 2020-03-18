module.exports = {
  friendlyName: 'Register Controller',
  description: "Registers a new user in the 'Users' collection",
  extendedDescription: `Adds the user information in a new document in 'Users' collection. The following information will be added:
    -email,
    -password,
    -full name 
  `,
  inputs: {
    email: {
      type: 'string',
      description: "User's email, duh..",
      isEmail: true,
      required: true
    },

    password: {
      type: 'string',
      description: "User's password without hashing",
      minLength: 6,
      required: true
    },

    name: {
      type: 'string',
      description: "User's full name",
      required: true,
      maxLength: 255
    },

    isAdmin: {
      type: 'boolean',
      description: 'Set to true if user is an admin (just for fun)'
    }
  },

  exits: {
    userAlreadyExists: {
      statusCode: 420,
      description: 'User with the same email already exists'
    }
  },

  fn: async function(inputs, exits) {
    inputs.password = await sails.helpers.passwords.hashPassword(
      inputs.password
    );
    const aql = sails.config.db.aql;
    const db = sails.config.db.instance();
    const cursor = await db.query(aql`UPSERT {
        email: ${inputs.email}
    }
    INSERT ${{ ...inputs, timestamp: _.now() }}
    UPDATE {
    }
    IN Users
    
    RETURN {
        info: NEW,
        alreadyExists: OLD
    }`);
    const res = await cursor.all();
    const user = res[0];
    db.close();
    // if user already exists throw an error
    if (!_.isEmpty(user.alreadyExists)) {
      throw 'userAlreadyExists';
    }

    // else success
    // TODO: add JWT Authentication
    this.req.session.userId = user.info._id;
    return exits.success();
  }
};
