module.exports = {
    friendlyName: 'Update user Controller',
  
    description: "Updates the user's informations based on the request body",
  
    extendedDescription: `First, we fetch the user's current details from req.me.
      Note that there will always be a req.me since this route is protected by api/policies/is-logged-in.
      We will then be able to modify the user's information since we have all necessary variables to update the document in the db
      `,
  
    inputs: {
      email: {
        type: 'string',
        description: "User's email, duh..",
        isEmail: true
      },
  
      password: {
        type: 'string',
        description: "User's password without hashing",
        minLength: 6
      },
  
      name: {
        type: 'string',
        description: "User's full name",
        maxLength: 255
      }
    },
  
    exits: {
      emailAlreadyInUse: {
        statusCode: 422,
        description: 'Email already exists'
      }
    },
    fn: async function(inputs, exits) {
      // hashing new password if exists
      if (inputs.password) {
        inputs.password = await sails.helpers.passwords.hashPassword(
          inputs.password
        );
      }
      const aql = sails.config.db.aql;
      const db = sails.config.db.instance();
  
      // if user is changing emails, then check first if email already exists
      if (inputs.email) {
        await sails.helpers.email
          .checkIfUnique(inputs.email, this.req)
          .intercept('emailNotUnique', 'emailAlreadyInUse');
      }
  
      // else exec query
      const cursor = await db.query(aql`
          UPDATE ${this.req._key}
          with ${{ ...inputs }} in Users
          RETURN doc`);
      const res = await cursor.all();
      db.close();
  
      return exits.success(res[0]);
    }
  };
  