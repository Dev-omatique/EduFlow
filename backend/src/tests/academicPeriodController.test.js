import { jest } from "@jest/globals";

const db = {
  AcademicPeriod: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Exam: { count: jest.fn(), findAll: jest.fn() },
  Note: {},
  User: { findByPk: jest.fn() },
  Roles: {},
  ParentStudent: { findAll: jest.fn() },
};

jest.unstable_mockModule("../models/index.js", () => ({ default: db }));

const { default: periodController } = await import("../controllers/academicPeriodController.js");

function createResponse() {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

beforeEach(() => {
  jest.clearAllMocks();
  db.AcademicPeriod.findAll.mockResolvedValue([]);
  db.Exam.findAll.mockResolvedValue([]);
});

test("returns only periods attached to the authenticated student's notes", async () => {
  const periods = [{ id: 2, label: "Trimestre 2", schoolYear: "2025-2026" }];
  db.User.findByPk.mockResolvedValue({ id: 12, Role: { role: "STUDENT" } });
  db.AcademicPeriod.findAll.mockResolvedValue(periods);
  const response = createResponse();

  await periodController.getForCurrentUser({ user: { userId: 12 } }, response, jest.fn());

  const query = db.AcademicPeriod.findAll.mock.calls[0][0];
  expect(query.include[0]).toEqual(expect.objectContaining({
    as: "Exams",
    required: true,
    include: [expect.objectContaining({
      model: db.Note,
      required: true,
      where: { studentId: 12 },
    })],
  }));
  expect(response.json).toHaveBeenCalledWith(periods);
});

test("creates a configured semester with its school year and date range", async () => {
  const period = { id: 4, label: "Semestre 2", periodType: "SEMESTER", number: 2 };
  db.AcademicPeriod.create.mockResolvedValue(period);
  const response = createResponse();

  await periodController.create({
    body: {
      periodType: "semester",
      number: 2,
      schoolYear: "2026-2027",
      startDate: "2027-01-01",
      endDate: "2027-06-30",
    },
  }, response, jest.fn());

  expect(db.AcademicPeriod.create).toHaveBeenCalledWith({
    label: "Semestre 2",
    periodType: "SEMESTER",
    number: 2,
    schoolYear: "2026-2027",
    startDate: "2027-01-01",
    endDate: "2027-06-30",
  });
  expect(response.status).toHaveBeenCalledWith(201);
});

test("does not mix semesters and trimesters within one school year", async () => {
  db.AcademicPeriod.findAll.mockResolvedValue([
    { id: 1, periodType: "TRIMESTER" },
  ]);
  const response = createResponse();

  await periodController.create({
    body: { periodType: "SEMESTER", number: 1, schoolYear: "2026-2027" },
  }, response, jest.fn());

  expect(response.status).toHaveBeenCalledWith(409);
  expect(db.AcademicPeriod.create).not.toHaveBeenCalled();
});

test("rejects a fourth trimester", async () => {
  const response = createResponse();

  await periodController.create({
    body: { periodType: "TRIMESTER", number: 4, schoolYear: "2026-2027" },
  }, response, jest.fn());

  expect(response.status).toHaveBeenCalledWith(400);
  expect(db.AcademicPeriod.create).not.toHaveBeenCalled();
});

test("does not delete a period linked to exams", async () => {
  const period = { id: 4, destroy: jest.fn() };
  db.AcademicPeriod.findByPk.mockResolvedValue(period);
  db.Exam.count.mockResolvedValue(2);
  const response = createResponse();

  await periodController.delete({ params: { id: "4" } }, response, jest.fn());

  expect(response.status).toHaveBeenCalledWith(409);
  expect(period.destroy).not.toHaveBeenCalled();
});