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

describe('POST /api/auth/register', function() {
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
      .expect(201) // Using 201 Created for registration
      .expect(res => {
        // Assertions instead of mutations
        if (!res.body.hasOwnProperty('id')) throw new Error("Missing ID");
        if (res.body.username.toLowerCase() !== 'johndoe') {
            throw new Error("Username case-insensitive match failed");
        }
      })
      .end(done);
  });
});