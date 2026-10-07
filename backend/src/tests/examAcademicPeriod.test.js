import { jest } from "@jest/globals";

const db = {
  Exam: { create: jest.fn(), findByPk: jest.fn() },
  Subject: {},
  Grade: {},
  User: {},
  AcademicPeriod: { findByPk: jest.fn(), findOne: jest.fn() },
};

jest.unstable_mockModule("../models/index.js", () => ({ default: db }));

const { default: examController } = await import("../controllers/examController.js");

function createResponse() {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

beforeEach(() => jest.clearAllMocks());

test("assigns the selected period when the exam date is inside its range", async () => {
  db.AcademicPeriod.findByPk.mockResolvedValue({
    id: 4,
    startDate: "2026-09-01",
    endDate: "2026-12-20",
  });
  db.Exam.create.mockResolvedValue({ id: 11, academicPeriodId: 4 });
  const response = createResponse();

  await examController.create({
    body: { title: "Contrôle", dueDate: "2026-12-20", academicPeriodId: 4 },
  }, response, jest.fn());

  expect(db.Exam.create).toHaveBeenCalledWith({
    title: "Contrôle",
    dueDate: "2026-12-20",
    academicPeriodId: 4,
  });
  expect(response.status).toHaveBeenCalledWith(201);
});

test("rejects an exam dated outside the selected period", async () => {
  db.AcademicPeriod.findByPk.mockResolvedValue({
    id: 4,
    startDate: "2026-09-01",
    endDate: "2026-12-20",
  });
  const response = createResponse();

  await examController.create({
    body: { title: "Contrôle", dueDate: "2026-12-21", academicPeriodId: 4 },
  }, response, jest.fn());

  expect(response.status).toHaveBeenCalledWith(400);
  expect(db.Exam.create).not.toHaveBeenCalled();
});

test("defaults an exam without a selected period to trimester one of its school year", async () => {
  db.AcademicPeriod.findOne.mockResolvedValue({ id: 1 });
  db.Exam.create.mockResolvedValue({ id: 12, academicPeriodId: 1 });
  const response = createResponse();

  await examController.create({
    body: { title: "Devoir", dueDate: "2026-07-24" },
  }, response, jest.fn());

  expect(db.AcademicPeriod.findOne).toHaveBeenCalledWith({
    where: { periodType: "TRIMESTER", number: 1, schoolYear: "2025-2026" },
  });
  expect(db.Exam.create).toHaveBeenCalledWith({
    title: "Devoir",
    dueDate: "2026-07-24",
    academicPeriodId: 1,
  });
});

test("replaces an explicitly cleared period with trimester one on update", async () => {
  const exam = { dueDate: "2026-07-24", update: jest.fn() };
  db.Exam.findByPk.mockResolvedValue(exam);
  db.AcademicPeriod.findOne.mockResolvedValue({ id: 1 });
  const response = createResponse();

  await examController.update({
    params: { id: "12" },
    body: { academicPeriodId: null },
  }, response, jest.fn());

  expect(exam.update).toHaveBeenCalledWith({ academicPeriodId: 1 });
});