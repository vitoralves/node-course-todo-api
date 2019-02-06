const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { ObjectID } = require('mongodb');

let id = new ObjectID();

const todos = [{
    _id: id,
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 12312312
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

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
            .get(`/todos/${id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id.toHexString());
            })
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id.toHexString()).then((res) => {
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
})