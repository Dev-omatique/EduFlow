import request from "supertest";
import app from "../app.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

let cookie;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    });

  cookie = res.headers["set-cookie"];
});

test("GET /users avec cookie", async () => {
  const res = await request(app)
    .get("/api/users")
    .set("Cookie", cookie);

  expect(res.statusCode).toBe(200);
  expect(res.body[0].id).toBe(1);
  
});

describe('User Lifecycle: Register & Delete', function() {
  let userId;

  it('should register a user and return a normalized name', function(done) {
    const newUser = {
      username: 'JohnDoe',
      email: 'john@something.doe',
      password: 'securePassword123',
      firstName: 'John',
      lastName: 'Doe'
    };

    request(app)
      .post('/api/auth/register')
      .send(newUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .expect(res => {
        if (!res.body.hasOwnProperty('id')) throw new Error("Missing ID");
        if (res.body.username.toLowerCase() !== 'johndoe') {
            throw new Error("Username case-insensitive match failed");
        }
      })
      .end(done);
  });


    it('should delete the user we just created', function(done) {
    if (!userId) {
      return done(new Error("Impossible de supprimer : ID non défini"));
    }

    request(app)
      .delete(`/api/users/${userId}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function(res) {
        res.body.message.should.equal('successful delete');
      })
      .end(done);
  });
});