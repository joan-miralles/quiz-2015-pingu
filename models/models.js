var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name     = (url[6]||null);
var user        = (url[2]||null);
var pwd         = (url[3]||null);
var protocol    = (url[1]||null);
var dialect     = (url[1]||null);
var port        = (url[5]||null);
var host        = (url[4]||null);
var storage     = process.env.DATABASE_STORAGE;

// Cargar Modelo RM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
    {
        dialect: protocol,
        protocol: protocol,
        port: port,
        host: host,
        storage: storage, // solo SQLite (.env)
        omitNull: true    // solo Postgres
    }
);

// Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // exportar la definicion de la table Quiz
exports.Comment = Comment;

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().success(function () {
    // success(..) ejecuta el manejador una vez creada la tabla
    Quiz.count().success(function (count) {
        if (count === 0) {
            Quiz.create({
                pregunta: 'Capital de Italia',
                respuesta: 'Roma',
                tema: 'humanidades'
            });
            Quiz.create({
                pregunta: 'Capital de Portugal',
                respuesta: 'Lisboa',
                tema: 'humanidades'
            })
                .success(function () {
                    console.log('Base de datos inicializada')
                });
        }
    });
});