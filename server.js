const inquirer = require("inquirer");
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'employees_db',
},
    console.log('Conected to database!'));



db.connect(function (err) {
    if (err) throw err;
    startMenu();
});

const startMenu = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "menu",
            message: "What would you like to do?",
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
        }
    ]).then((res) => {

        switch (res.menu) {
            case 'View All Employees':
                viewEmployees()
                break;
            case 'Add Employee':
                addEmployee()

                break;
            case 'Update Employee Role':
                updateEmployeeRole()
                break;
            case 'View All Roles':
                viewRoles()
                break;
            case 'Add Role':
                addRole()
                break;
            case 'View All Departments':
                viewTable('department')
                break;
            case 'Add Department':
                addDepartment()
                break;
            case 'Quit':
                db.end();
                break;
        }
    })
}
//helper functions
function addToDb(q) {
    db.query( q
        , (err, result) => {
            if (err) throw err;
            console.table(result);
            startMenu()
        });
}
const uniqueBy = (arr, prop) => {
    return [...new Map(arr.map((m) => [m[prop], m])).values()];
  };

  //viewing functions

const viewTable = (table) => {
    db.query(`SELECT * FROM ${table}`, (err, result) => {
        if (err) throw err;
        console.table(result);
        startMenu()
    })
}

const viewRoles = () => {
    db.query(`SELECT title, role.id, dept_name AS department, salary FROM role INNER JOIN department ON role.department_id = department.id; `, (err, result) => {
        if (err) throw err;
        console.table(result);
        startMenu()
    })
}

const viewEmployees = () => {
    db.query(`
    SELECT employee.id AS id, employee.first_name AS firstName, employee.last_name AS lastName, role.title AS title, department.dept_name AS department, role.salary AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id
  `
        , (err, result) => {
            if (err) throw err;
            console.table(result);
            startMenu()
        });
}

//adding functions
const addEmployee = () => {
    // Function to get roles from the database
    const getRoles = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, title FROM role', (err, res) => {
                if (err) {
                    reject(err);
                }
                const roles = res.map((row) => ({
                    name: row.title,
                    value: row.id
                }));
                resolve(roles);
            });
        });
    };

    // Next, get the list of employees to use as managers from the database
    const getManagers = () => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT employee.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name FROM employee LEFT JOIN employee manager ON manager.id = employee.manager_id WHERE employee.manager_id IS NOT NULL`, (err, res) => {
                if (err) {
                    reject(err);
                }
                 const managers= res.map((row) => ({
                    name: row.manager_name,
                    value: row.manager_id
                }));

                const newManagers = uniqueBy(managers, 'value')
                newManagers.push('none');
                resolve(newManagers);
            });
        });
    };

    // Use Promise.all to retrieve both roles and managers
    Promise.all([getRoles(), getManagers()])
        .then(([roles, managers]) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "Type the employee's first name"
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "Type the employee's last name"
                },
                {
                    type: 'list',
                    name: 'role_id', // Use role_id to store the selected role's ID
                    message: "What is the employee's role?",
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager_id', // Use manager_id to store the selected manager's ID
                    message: "Who is the employee's manager?",
                    choices: managers
                }
            ])
                .then((res) => {
                    let employee = {
                        first_name: res.first_name,
                        last_name: res.last_name,
                        role_id: res.role_id,
                        manager_id: res.manager_id,
                    };
                    
                    if (employee.manager_id === 'none'){
                        employee = {
                            first_name: res.first_name,
                            last_name: res.last_name,
                            role_id: res.role_id,
                            manager_id: null
                        }
                    }
                   const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${employee.first_name}', '${employee.last_name}', '${employee.role_id}', '${employee.manager_id}')`
                    // Now you have the role_id and manager_id to add to the database
                    console.log(`Added employee ${employee.first_name} ${employee.last_name} to database`)
                    addToDb(query);
                });
        })
        .catch((err) => {
            console.error(err); // Handle any errors
        });
};

const addRole = () => {
    const getDepts = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, dept_name FROM department', (err, res) => {
                if (err) {
                    reject(err);
                }
                const depts = res.map((row) => ({
                    name: row.dept_name,
                    value: row.id
                }));
                const newDepts = uniqueBy(depts, 'value');
                resolve(newDepts);
            });
        });
    };

    getDepts()
        .then((depts) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: "What is the title of the role?"
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: "What is the salary of the role?",
                    validate: (answer) => {
                        if (isNaN(answer)) {
                          return "please enter a number";
                        }
                        return true;
                      },
                  
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: "What department does the role belong to?",
                    choices: depts
                },
            ])
            .then((res) => {
                const role = {
                    title: res.title,
                    salary: res.salary,
                    department_id: res.department_id
                };

                // Use placeholders in the SQL query and pass values as parameters
                const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
                const values = [role.title, role.salary, role.department_id];

                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        startMenu()
                        console.log(`Role "${role.title}" added successfully.`);
                    }
                });
            })
            .catch((err) => {
                console.error(err); // Handle inquirer errors
            });
        })
        .catch((err) => {
            console.error(err); // Handle database query errors
        });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'dept_name',
            message: "Enter the name of the department:"
        }
    ])
    .then((res) => {
        const department = {
            dept_name: res.dept_name
        };

        // Use placeholders in the SQL query and pass values as parameters
        const query = 'INSERT INTO department (dept_name) VALUES (?)';
        const values = [department.dept_name];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                startMenu()
                console.log(`Department "${department.dept_name}" added successfully.`);
            }
        });
    })
    .catch((err) => {
        console.error(err); // Handle inquirer errors
    });
};


const updateEmployeeRole = () => {
    // Function to get a list of employees from the database
    const getEmployees = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, CONCAT(first_name, " ", last_name) AS employee_name FROM employee', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const employees = res.map((row) => ({
                        name: row.employee_name,
                        value: row.id
                    }));
                    resolve(employees);
                }
            });
        });
    };

    // Function to get a list of roles from the database
    const getRoles = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, title FROM role', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const roles = res.map((row) => ({
                        name: row.title,
                        value: row.id
                    }));
                    resolve(roles);
                }
            });
        });
    };

    Promise.all([getEmployees(), getRoles()])
        .then(([employees, roles]) => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to update:',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'new_role_id',
                    message: 'Select the new role for the employee:',
                    choices: roles
                }
            ])
            .then((answers) => {
                const { employee_id, new_role_id } = answers;

                // Use placeholders in the SQL query and pass values as parameters
                const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
                const values = [new_role_id, employee_id];

                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Employee role updated successfully.');
                        startMenu()
                    }
                });
            })
            .catch((err) => {
                console.error(err); // Handle inquirer errors
            });
        })
        .catch((err) => {
            console.error(err); // Handle database query errors
        });
};