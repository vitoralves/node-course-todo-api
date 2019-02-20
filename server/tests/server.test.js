const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { ObjectID } = require('mongodb');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({ text: '' })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should get 400 when id is invalid', (done) => {
        request(app)
            .get('/todos/123')
            .expect(400)
            .end(done);
    });

    it('should return 404 when objects does not exist', (done) => {
        let o = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${o}`)
            .expect(404)
            .end(done);
    });

    it('should return todo object', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            })
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todos[0]._id.toHexString()).then((res) => {
                    expect(res).toBeNull();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 400, invalid id', (done) => {
        request(app)
            .delete('/todos/addsaasssda')
            .expect(400)
            .end(done);
    });

    it('should return 404 to inexistent id', (done) => {
        let deleteID = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${deleteID}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todo/:id', () => {
    it('should update a todo', (done) => {
        let todo = {
            text: 'new text',
            completed: true
        }

        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .send(todo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res.body.todo.text).toBe(todo.text);
                expect(res.body.todo.completed).toBe(todo.completed);
                expect(typeof res.body.todo.completedAt).toBe('number');
                done();
            })
    });

    it('should completedAt when todo is not completed', (done) => {
        let todo = {
            text: 'new',
            completed: false
        }

        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .send(todo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res.body.todo.text).toBe(todo.text);
                expect(res.body.todo.completed).toBe(todo.completed);
                expect(res.body.todo.completedAt).toBeNull();
                done();
            })
    });
});

describe('GET /users/me', () => {
    it('should return user if autheticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);

                done();
            })
    });

    it('should return 401 if not autheticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body).toEqual({});
                done();
            });
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'test@test.com';
        var password = '123abc';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                })
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'test.com';
        var password = '123abc';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end((err, res) => {
                expect(res.body.errors).toBeTruthy();
                done();
            });
    });

    it('should not create user if email in user', (done) => {
        let email = users[0].email;
        let password = users[0].password;

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
    });
});

describe('POST users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined()
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'asdsadasdasd'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0)
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe('DELETE users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, succ) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0)
                    done();
                });
            })
    });
});