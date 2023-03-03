const mysql = require(`mysql2`);
const inquirer = require(`inquirer`);
const db = require(`./config/connection`);
const util = require(`util`);

const init = () => {
    inquirer
        .prompt([
            {
                type: `list`,
                message: `Please select your desired operation:`,
                choices: [`1) View all departments`, `2) View all roles`, `3) View all employees`, `4) Add a department`, `5) Add a role`, `6) Add employee`, `7) Update an employee role`],
                name: `operation`,
            }
        ]).then((res) => {
            //this method is not very robust or flexible, should uses more versitile lables to pass to functions
            const operation = res.operation[0];
            const parsed = parseInt(operation);
            
            if(parsed < 4) {
                views(parsed);
            } else if(parsed > 3 && parsed < 7) {
                addClass(parsed);
            } else if(parsed === 7) {
                getNames();
            } else {
                console.log(`something went wrong`);
            }
        })
}

const views = (view) => {
    //1 = departments, 2 = roles, 3 = employees
    if(view === 1){
        db.query(`SELECT id AS 'ID', name AS 'Departments' FROM departments`, function (err, res) {
            console.table(res);
            init();
        });
    } else if(view === 2){
        db.query(`SELECT r.id AS 'ID', r.title AS 'Position', r.salary AS 'Salary', d.name AS 'Department' FROM roles r JOIN departments d ON d.id = r.department_id`, function (err, res) {
            console.table(res);
            init();
        });
    } else if(view === 3){
        db.query(`SELECT e.id, e.first_name AS 'First Name', e.last_name AS 'Last Name', r.title AS 'Position', d.name AS 'Department', m.first_name AS 'Manager' FROM employees e JOIN roles r ON r.id = e.role_id JOIN departments d ON d.id = r.department_id LEFT JOIN employees m ON m.id = e.manager_id;
        `, function (err, res) {
            console.table(res);
            init();
        });
    } else {
        console.log(`something went wrong`);
    }
}

const addClass = async (create) => {
    if(create === 4){
        const addDepartment = await inquirer.prompt([
                {
                    type: `input`,
                    message: `Please provide the name of the new department`,
                    name: `name`,
                }
            ]).then((res) => {
                const name = res.name;

                db.query(`INSERT INTO departments(name) VALUES(?)`, [`${name}`], function (err, results) {
                    if (err) {
                        throw err;
                    } else {
                        console.log(`${name} has been added to the departments table`);
                    }
                })
            })
    } else  if(create === 5){
        const departments = [];
        db.query(`SELECT name FROM departments`, function (err, res) {
            if(err){
                throw err;
            } else {
                res.forEach(element => {
                    departments.push(element.name);
                });
            }
        });
        
        const addRole = await inquirer.prompt([
                {
                    type: `input`,
                    message: `Please provide the title of the new role`,
                    name: `title`,
                },
                {
                    type: `input`,
                    message: `Please provide this roles salary`,
                    name: `salary`,
                },
                {
                    type: `list`,
                    message: `Please select which department this role belongs to`,
                    choices: departments,
                    name: `role`,
                },
            ]).then((res) => {
                const title = res.title;
                const salary = res.salary.match(/[0-9]*(\.[0-9]{0,2})?/g).filter(el => el != '');
                const departmentId = departments.indexOf(res.role) + 1;
                db.query(`INSERT INTO roles(title, salary, department_id) VALUES(?, ?, ?)`, [`${title}`, salary[0], departmentId], function (err, results) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log(`${title} has been added to the departments table`);
                    }
                })
            })
    } else if (create === 6) {
        const employeesRaw = [];
        const employees = [];
        db.query(`SELECT first_name, last_name, id FROM employees`,  function (err, res) {
            if(err){
                console.log('oh no!');
                throw err;
            } else {
                res.forEach(element => {
                    employeesRaw.push({
                        firstName: element.first_name,
                        lastName: element.last_name,
                        managerId: element.id
                    });
                    employees.push(`${element.first_name} ${element.last_name}`);
                });

            }
        });
        const rolesRaw = [];
        const roles = [];
        db.query(`SELECT title, id FROM roles`, function (err, res) {
            if(err){
                throw err;
            } else {
                res.forEach(element => {
                    rolesRaw.push({
                        position: element.title,
                        roleId: element.id
                    });
                    roles.push(element.title);
                });
            }
        });

        const addEmployee = await inquirer.prompt([
                    {
                        type: `input`,
                        message: `Please provide the employee's first name`,
                        name: `firstName`,
                    },
                    {
                        type: `input`,
                        message: `Please provide the employee's last name`,
                        name: `lastName`,
                    },
                    {
                        type: `list`,
                        message: `Please choose the employee's role`,
                        choices: roles,
                        name: `role`,
                    },
                    {
                        type: `list`,
                        message: `Please choose the employee's manager`,
                        choices: employees,
                        name: `manager`,
                    },
                ]).then((res) => {
                    const positionObj = rolesRaw.filter(role => role.position === res.role);
                    const positionId = positionObj[0].roleId;
                    const managerObj = employeesRaw.filter(name => {
                        const splitName = res.manager.split(' ');
                        if(name.firstName === splitName[0] && name.lastName === splitName[1]){
                            return name.managerId;
                        };
                    });
                    const managerId = managerObj[0].managerId;

                    db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`, [`${res.firstName}`, `${res.lastName}`, positionId, managerId], function (err, results) {
                        if (err) {
                            console.log(err);
                            throw err;
                        } else {
                            console.log(`${res.firstName} ${res.lastName} has been added to the employees table`);
                        }
                    })
                })
    }
    init();
    return;
}

const getDepartments = async () => {
    const departmentNames = [];
        db.query(`SELECT name FROM departments`, function (err, res) {
            if(err){
                throw err;
            } else {
                res.forEach(element => {
                    departmentNames.push(element.name);
                });
            }
        });
}

const getNames = async () => {
    const employeeNames = [];
    db.query(`SELECT first_name, last_name, id FROM employees`,  function (err, res) {
        if(err){
            console.log('oh no!');
            throw err;
        } else {
            res.forEach(element => {
                employeeNames.push({
                    firstName: element.first_name,
                    lastName: element.last_name,
                    managerId: element.id
                });
            });
            getRoles(employeeNames);
            return;
        }
        //return updateClass(employeeNames);
    });
}

const getRoles = async (names) => {
    const roleNames = [];
        db.query(`SELECT title, id FROM roles`, function (err, res) {
            if(err){
                throw err;
            } else {
                res.forEach(element => {
                    roleNames.push({
                        position: element.title,
                        roleId: element.id
                    });
                });
                updateClass(names, roleNames);
                return;
            }
        });
}


const updateClass = async (names, roles) => {   
    
    let employeeNames = names.map(name => `${name.firstName} ${name.lastName}`);
    let employeeRoles = roles.map(role => role.position);

    if(employeeNames === undefined){
        employeeNames = [];
    }
        
    const updateEmployee = inquirer.prompt([
        {
            type: `list`,
            message: `Please select the employees to update`,
            choices: employeeNames,
            name: `employee`,
        },
        {
            type: `input`,
            message: `Please input the employees first name`,
            name: `firstName`,
        },
        {
            type: `input`,
            message: `Please input the employees last name`,
            name: `lastName`,
        },
        {
            type: `list`,
            message: `Please select the employees position`,
            choices: employeeRoles,
            name: `position`,
        },
        {
            type: `list`,
            message: `Please select the employees manager`,
            choices: employeeNames,
            name: `manager`,
        },
    ]).then((res) => {
        const title = res.title;
                const employeeRaw = names.filter(name => {
                    const splitName = res.employee.split(' ');
                    if(name.firstName === splitName[0] && name.lastName === splitName[1]){
                        return name.managerId;
                    };
                });
                const employeeId = employeeRaw[0].managerId;
                const firstName = res.firstName;
                const lastName = res.lastName;
                const positionObj = roles.filter(role => role.position === res.position);
                const positionId = positionObj[0].roleId;
                const managerObj = names.filter(name => {
                    const splitName = res.manager.split(' ');
                    if(name.firstName === splitName[0] && name.lastName === splitName[1]){
                        return name.managerId;
                    };
                });
                const managerId = managerObj[0].managerId;
                
                db.query(`UPDATE employees SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? WHERE id = ?`, [`${firstName}`, `${lastName}`, positionId, managerId, employeeId], function (err, results) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log(`${res.employee} has been has been updated to ${firstName} ${lastName}`);
                    }
                });
                init();
                return;
    })
}

init();