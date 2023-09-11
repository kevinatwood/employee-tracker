const inquirer
 = require("inquirer");
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  '',
    database: 'employees_db',
}, 
console.log('Conected to database!'));

const Employee = require('./classes')


db.connect(function (err) {
    if (err) throw err;
    startMenu();
});

const startMenu = () => {
inquirer .prompt([
    {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
    }
]).then ((res) => {
    
    switch(res.menu){
        case 'View All Employees':
        viewEmployees()
        break;
        case 'Add Employee':
            addEmployee()

        break;
        case 'Update Employee Role':

        break;
        case 'View All Roles':
                viewRoles()
        break;
        case 'Add Role':

        break;
        case 'View All Departments':
            viewTable('department')
        break;
        case 'Add Department':

        break;
        case 'Quit':

        break;
    }
})}

const viewTable = (table) => {
    db.query(`SELECT * FROM ${table}`,  (err, result) => {
        if (err) throw err;
        console.table(result);
    startMenu()
})
}

const viewRoles = () => {
    db.query(`SELECT title, role.id, dept_name AS department, salary FROM role INNER JOIN department ON role.department_id = department.id; `,  (err, result) => {
        if (err) throw err;
        console.table(result);
    startMenu()
})
}
// employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to



const viewEmployees = () =>{
    db.query(`
    SELECT employee.id AS id, employee.first_name AS firstName, employee.last_name AS lastName, role.title AS title, department.dept_name AS department, role.salary AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id
  `
,  (err, result) => {
    if (err) throw err;
    console.table(result);
    startMenu()});
}

function addToDb(q) {
    db.query(q
,  (err, result) => {
    if (err) throw err;
    console.table(result);
    startMenu()});
}
const addEmployee = () =>{
    const roles = () => {
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT title FROM role`,
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                const arr = res.map((res) => res.title);
                resolve(arr);
              }
            }
          );
        });
      };
      roles()
        .then((arr) => {
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
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: arr
                }, 
                {
                type: 'input',
                name: 'manager',
                message: "Who is the employee's manager?"
            }
            ])
            .then ((res) =>{
                const e = new Employee(res.first_name, res.last_name, res.role, res.manager);
                const q = e.query()
                addToDb(q);
            });
                })
            .catch((err) => {
             console.error(err); // Handle any errors
                 });
    }




