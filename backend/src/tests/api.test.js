import request from "supertest";
import app from "../app.js";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const TEST_USER_EMAIL = "ci-admin@eduflow.test";
const TEST_USER_PASSWORD = "CiTestPassword123";
let cookie;
let courseFixtures;

beforeAll(async () => {
  const role = await db.Roles.create({ role: "CI_ADMIN" });
  const permissions = await db.Permission.bulkCreate([
    { code: "MANAGE_USERS", description: "CI test user management" },
    { code: "MANAGE_SCHEDULE", description: "CI test schedule management" },
    { code: "VIEW_SCHEDULE", description: "CI test schedule viewing" },
  ]);
  await db.RolePermission.bulkCreate(permissions.map((permission) => ({
    roleId: role.id,
    permissionId: permission.id,
  })));

  const grade = await db.Grade.create({ name: "CI Grade", schoolYear: "2024-09-01" });
  const subject = await db.Subject.create({ type: "CI Subject", color: "#12B2E8" });
  const roomType = await db.RoomType.create({ type: "CI Room" });
  const room = await db.Room.create({ name: "CI Room 1", roomTypeId: roomType.id });
  const user = await db.User.create({
    username: "ci-admin",
    email: TEST_USER_EMAIL,
    password: await bcrypt.hash(TEST_USER_PASSWORD, 10),
    firstName: "CI",
    lastName: "Admin",
    roleId: role.id,
    gradeId: grade.id,
  });

  courseFixtures = { gradeId: grade.id, subjectId: subject.id, roomId: room.id, teacherId: user.id };

  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

  cookie = res.headers["set-cookie"];
});

test("POST /login - Devrait échouer avec un mauvais mot de passe", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: TEST_USER_EMAIL,
      password: "wrongPassword123",
    });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("message");
});

test("POST /login - Devrait échouer si l'email n'existe pas", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "ghost@notfound.com",
      password: "somePassword",
    });

  expect(res.statusCode).toBe(401);
});

test("POST /login - Devrait échouer si des champs sont manquants", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "only-email@test.com" });

  expect(res.statusCode).toBe(400);
});

test("POST /register - Devrait échouer si l'email est déjà utilisé", async () => {
  const existingUser = {
    username: 'DuplicateUser',
    email: TEST_USER_EMAIL,
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(existingUser)
    .set("Cookie", cookie);

  expect(res.statusCode).toBe(409);
  expect(res.body.message).toMatch(/already exists|email/i);
});

test("POST /register - Devrait échouer si un champ obligatoire est vide", async () => {
  const incompleteUser = {
    username: 'NoPassword',
    email: 'new@user.com'
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(incompleteUser)
    .set("Cookie", cookie);

  expect(res.statusCode).toBe(400);
});

test("GET /users avec cookie", async () => {
  const res = await request(app)
    .get("/api/users")
    .set("Cookie", cookie);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});


let testId;

test('POST /register', async () => {
  const newUser = {
    username: 'JohnDoe',
    email: 'john@something.doe',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe'
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(newUser)
    .set('Accept', 'application/json')
    .set("Cookie", cookie);

  expect(res.status).toBe(201);
  expect(res.body.user).toHaveProperty('id');
  
  testId = res.body.user.id; 
  
  expect(res.body.user.username.toLowerCase()).toBe('johndoe');
});

test('Update user', async () => {
  expect(testId).toBeDefined();

  const res = await request(app)
    .put(`/api/users/${testId}`)
    .send({
      firstName: 'DoeJohn',
      email: 'doe@something.john'
    })
    .set('Accept', 'application/json')
    .set("Cookie", cookie);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('successful update');
});

test('Delete User', async () => {
  expect(testId).toBeDefined();

  const res = await request(app)
    .delete(`/api/users/${testId}`)
    .set('Accept', 'application/json')
    .set("Cookie", cookie);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('successful delete');
});


let createdCourseId;

describe("Courses API (/api/courses)", () => {

  describe("POST /", () => {
    test("Devrait créer un nouveau cours", async () => {
      const newCourse = {
        startTime: "2024-10-20T08:00:00Z",
        endTime: "2024-10-20T10:00:00Z",
        roomId: courseFixtures.roomId,
        subjectId: courseFixtures.subjectId,
        teacherId: courseFixtures.teacherId,
        gradeId: courseFixtures.gradeId
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Cookie", cookie)
        .send(newCourse);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      createdCourseId = res.body.id; 
    });
  });

  describe("GET /:type/:id", () => {
    test("Devrait récupérer les cours d'un enseignant (teacher)", async () => {
      const res = await request(app)
        .get(`/api/courses/teacher/${courseFixtures.teacherId}`)
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].teacherId).toBe(courseFixtures.teacherId);
      }
    });

    test("Devrait récupérer les cours d'une classe (grade) avec filtres de date", async () => {
      const start = "2024-10-01";
      const end = "2024-10-31";
      
      const res = await request(app)
        .get(`/api/courses/grade/${courseFixtures.gradeId}?startDate=${start}&endDate=${end}`)
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Devrait retourner 400 pour un type invalide", async () => {
      const res = await request(app)
        .get("/api/courses/student/1")
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Type invalide");
    });
  });

  describe("PUT /:id", () => {
    test("Devrait modifier l'horaire du cours créé", async () => {
      const updatedData = {
        startTime: "2024-10-21T09:00:00Z"
      };

      const res = await request(app)
        .put(`/api/courses/${createdCourseId}`)
        .set("Cookie", cookie)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("successful update");
    });
  });

  describe("DELETE /:id", () => {
    test("Devrait supprimer le cours", async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("successful delete");
    });
  });
});