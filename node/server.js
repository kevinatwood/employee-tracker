const inquirer
 = require("inquirer");
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  'Fuckface69',
    database: 'employees_db',
}, 
console.log('Conected to database!'))


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
        // viewTable('employee')
        viewEmployees()
        break;
        case 'Add Employee':

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
    SELECT employee.id AS id, employee.first_name AS firstName, employee.last_name AS lastName, role.title AS title, department.dept_name AS department, role.salary AS salary
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
  `
,  (err, result) => {
    if (err) throw err;
    console.table(result);
    startMenu()});
}
    // db.query(`SELECT employee.id AS id, employee.first_name AS first name, employee.last_name AS last name, role.title AS title, department.dept_name AS department, role.salary AS salary 
    // FROM employee JOIN employee ON role.id = role_id 
    // JOIN department ON role.department_id = department.id `,  (err, result) => {
    //     if (err) throw err;
    //     console.table(result);
    //     startMenu()
    // })
//}