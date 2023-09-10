const { default: inquirer } = require("inquirer");
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password:   process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
    switch(res){
        case 'View All Employees':
        viewEmployees()
        break;
        case 'Add Employee':

        break;
        case 'Update Employee Role':

        break;
        case 'View All Roles':

        break;
        case 'Add Role':

        break;
        case 'View All Departments':

        break;
        case 'Add Department':

        break;
        case 'Quit':

        break;
    }
})}

const viewEmployees = () => console.log("hello");