import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../index.js';
import { connectDB } from '../config/db.js';

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth, Quiz create, Submit flow', () => {
  let teacherToken;
  let studentToken;
  let quizId;

  it('registers and logs in teacher', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Teacher',
      email: 't@test.com',
      password: 'pass1234',
      role: 'teacher'
    });
    expect(reg.statusCode).toBe(201);
    expect(reg.body.token).toBeDefined();
    teacherToken = reg.body.token;

    const login = await request(app).post('/api/auth/login').send({
      email: 't@test.com',
      password: 'pass1234'
    });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
  });

  it('registers and logs in student', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Student',
      email: 's@test.com',
      password: 'pass1234',
      role: 'student'
    });
    expect(reg.statusCode).toBe(201);
    studentToken = reg.body.token;

    const login = await request(app).post('/api/auth/login').send({
      email: 's@test.com',
      password: 'pass1234'
    });
    expect(login.statusCode).toBe(200);
  });

  it('teacher creates a quiz', async () => {
    const create = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Sample',
        description: 'Desc',
        questions: [
          { text: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
          { text: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 }
        ]
      });

    expect(create.statusCode).toBe(201);
    quizId = create.body.id;
    expect(quizId).toBeDefined();
  });

  it('student gets quiz without answers and submits', async () => {
    const getQuiz = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(getQuiz.statusCode).toBe(200);
    expect(getQuiz.body.questions[0].correctAnswer).toBeUndefined();

    const submit = await request(app)
      .post(`/api/results/submit/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: [1, 2] });

    expect(submit.statusCode).toBe(201);
    expect(submit.body.score).toBe(2);
    expect(submit.body.total).toBe(2);
  });
});



