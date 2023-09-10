const { default: inquirer } = require("inquirer");
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:   process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}, 
console.log('Conected to database!'))

// const startMenu = () =>{
// inquirer .prompt([
//     {
//         type: "list",
//         name: "menu",
//         message: "What would you like to do?",
//         choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
//     }
// ]).then (response){
//     switch
// }}