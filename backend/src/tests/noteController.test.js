import { jest } from "@jest/globals";

const db = {
  Note: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Exam: { findByPk: jest.fn() },
  AcademicPeriod: { findByPk: jest.fn() },
  Subject: {},
  User: { findByPk: jest.fn(), findAll: jest.fn() },
  Roles: {},
  ParentStudent: { findAll: jest.fn() },
  Permission: { findOne: jest.fn() },
  RolePermission: { findOne: jest.fn() },
  sequelize: { transaction: jest.fn() },
};

jest.unstable_mockModule("../models/index.js", () => ({ default: db }));

const { default: noteController } = await import("../controllers/noteController.js");

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("a student requesting exam notes receives only their own records", async () => {
  db.User.findByPk.mockResolvedValue({ id: 12, gradeId: 4, Role: { role: "STUDENT" } });
  db.Exam.findByPk.mockResolvedValue({ id: 30, gradeId: 4, teacherId: 8 });
  db.Note.findAll.mockResolvedValue([{ id: 1, grade: "15" }]);
  const response = createResponse();

  await noteController.getTypeAll(
    { user: { userId: 12 }, params: { type: "exam", id: "30" } },
    response,
    jest.fn(),
  );

  expect(db.Note.findAll).toHaveBeenCalledWith(expect.objectContaining({
    where: { examId: 30, studentId: 12 },
  }));
  expect(response.json).toHaveBeenCalledWith([{ id: 1, grade: "15" }]);
});

test("a selected period is applied to the database query for a student's notes", async () => {
  db.User.findByPk.mockResolvedValue({ id: 12, gradeId: 4, Role: { role: "STUDENT" } });
  db.AcademicPeriod.findByPk.mockResolvedValue({ id: 2 });
  db.Note.findAll.mockResolvedValue([]);
  const response = createResponse();

  await noteController.getTypeAll(
    {
      user: { userId: 12 },
      params: { type: "student", id: "12" },
      query: { academicPeriodId: "2" },
    },
    response,
    jest.fn(),
  );

  const query = db.Note.findAll.mock.calls[0][0];
  expect(query.where).toEqual({ studentId: 12 });
  expect(query.include[0].include[1]).toEqual(expect.objectContaining({
    where: { id: 2 },
    required: true,
  }));
});

test("class statistics return aggregate values rather than individual notes", async () => {
  db.User.findByPk.mockResolvedValue({ id: 12, gradeId: 4, Role: { role: "STUDENT" } });
  db.Exam.findByPk.mockResolvedValue({ id: 30, gradeId: 4 });
  db.Note.findAll.mockResolvedValue([{ grade: "10" }, { grade: "16" }]);
  const response = createResponse();

  await noteController.getExamStats(
    { user: { userId: 12 }, params: { id: "30" } },
    response,
    jest.fn(),
  );

  expect(response.json).toHaveBeenCalledWith({ average: 13, min: 10, max: 16, count: 2 });
  expect(db.Note.findAll).toHaveBeenCalledWith({
    where: { examId: 30 },
    attributes: ["grade"],
  });
});

test("a teacher cannot read grades for an exam owned by another teacher", async () => {
  db.User.findByPk.mockResolvedValue({ id: 8, roleId: 3, Role: { role: "TEACHER" } });
  db.Exam.findByPk.mockResolvedValue({ id: 30, teacherId: 9 });
  const response = createResponse();

  await noteController.getTypeAll(
    { user: { userId: 8 }, params: { type: "exam", id: "30" } },
    response,
    jest.fn(),
  );

  expect(response.status).toHaveBeenCalledWith(403);
  expect(db.Note.findAll).not.toHaveBeenCalled();
});

test("a parent cannot read notes for a student who is not their child", async () => {
  db.User.findByPk.mockResolvedValue({ id: 8, Role: { role: "PARENT" } });
  db.ParentStudent.findAll.mockResolvedValue([{ studentId: 12 }]);
  const response = createResponse();

  await noteController.getTypeAll(
    { user: { userId: 8 }, params: { type: "student", id: "13" } },
    response,
    jest.fn(),
  );

  expect(response.status).toHaveBeenCalledWith(403);
  expect(db.Note.findAll).not.toHaveBeenCalled();
});

test("bulk grading validates all values before starting a transaction", async () => {
  db.User.findByPk.mockResolvedValue({ id: 8, Role: { role: "TEACHER" } });
  db.Exam.findByPk.mockResolvedValue({ id: 30, teacherId: 8, maxNotes: "20", isGraded: true });
  const response = createResponse();

  await noteController.saveBulk(
    {
      user: { userId: 8 },
      body: { examId: 30, notes: [{ studentId: 12, grade: "21" }] },
    },
    response,
    jest.fn(),
  );

  expect(response.status).toHaveBeenCalledWith(400);
  expect(db.sequelize.transaction).not.toHaveBeenCalled();
});

test("bulk grading updates and creates notes inside one transaction", async () => {
  const transaction = { LOCK: { UPDATE: "UPDATE" } };
  const created = { id: 2, studentId: 13, grade: "14" };
  const existing = { id: 1, studentId: 12, update: jest.fn().mockResolvedValue(undefined) };

  db.User.findByPk.mockResolvedValue({ id: 8, roleId: 3, Role: { role: "TEACHER" } });
  db.Exam.findByPk.mockResolvedValue({
    id: 30,
    teacherId: 8,
    gradeId: 4,
    maxNotes: "20",
    isGraded: true,
  });
  db.User.findAll.mockResolvedValue([{ id: 12 }, { id: 13 }]);
  db.Permission.findOne
    .mockResolvedValueOnce({ id: 1 })
    .mockResolvedValueOnce({ id: 2 });
  db.RolePermission.findOne
    .mockResolvedValueOnce({ id: 1 })
    .mockResolvedValueOnce({ id: 2 });
  db.sequelize.transaction.mockImplementation((callback) => callback(transaction));
  db.Note.findOne
    .mockResolvedValueOnce(existing)
    .mockResolvedValueOnce(null);
  db.Note.create.mockResolvedValue(created);
  const response = createResponse();

  await noteController.saveBulk(
    {
      user: { userId: 8 },
      body: {
        examId: 30,
        notes: [
          { studentId: 12, grade: "16" },
          { studentId: 13, grade: "14" },
        ],
      },
    },
    response,
    jest.fn(),
  );

  expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
  expect(existing.update).toHaveBeenCalledWith({ grade: "16" }, { transaction });
  expect(db.Note.create).toHaveBeenCalledWith(
    { examId: 30, studentId: 13, grade: "14" },
    { transaction },
  );
  expect(response.json).toHaveBeenCalledWith({ notes: [existing, created] });
});