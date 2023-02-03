const db = require(`../config/connection`);

class Departments {
    constructor(name){
        this.name = name;
        
    }

    createDepartment = () => {
        db.query(`INSERT INTO department VALUES(?)`, [this.name], function (err, results) {
            if (err) {
                throw err;
            } else {
                console.log(`${this.name} has been added to the departments table`);
            }
        })
    }
}

module.exports = Departments;