const { db, defaultErrorHandler, errorHandlerCreator } = require('./db/db.js');
const { BadQueryError, parsePgError } = require('./errors/dbErrors.js');

class Name {
    constructor(firstName, lastName) {
        this.first = firstName;
        this.last = lastName;
    }
    toString() {
        return `${this.first} ${this.last}`;
    }
}


class User {
    constructor(name, phoneNumber, email, password) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
    }

    // attempts to save the user by inserting into db (async tag is just noting its return type)
    // returns a promise that will resolve with success, reject with db error
    async save() {
        //query that adds user to db
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO users (first_name, last_name, email, phone, password)\
                    VALUES ($1, $2, $3, $4, $5)',
            [this.name.first, this.name.last, this.email, this.phoneNumber, this.password])
            .then(result => resolve({message: "User created succesfully."}))
            .catch(err => reject(parsePgError(err)));

        });
    }


    // finds a user with a given id
    // returns a promise that resolves with a user, rejects with a db error
    static async find(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * from users WHERE id=$1::integer', [id])
            .then(result => resolve(result.rows[0]))
            .catch(err => reject(new NotFoundError("User could not be found.")))
        });
    }
    //finds user by email in order to log them in
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * from users WHERE email=$1::text', [email])
            .then(result => resolve(result.rows[0]))
            .catch(err => reject(new NotFoundError("User could not be found.")))
        });
    }
}

module.exports = {
    User,
    Name
}