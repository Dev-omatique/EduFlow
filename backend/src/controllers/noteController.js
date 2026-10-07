import db from "../models/index.js";

const { Note, Exam, Subject, User, Roles, ParentStudent, Permission, RolePermission, AcademicPeriod } = db;

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadActor(req, res) {
    const actor = await User.findByPk(req.user.userId, {
        include: [{ model: Roles, as: "Role", attributes: ["role"] }],
    });

    if (!actor) {
        res.status(404).json({ message: "Utilisateur introuvable" });
        return null;
    }

    return actor;
}

function canViewExam(actor, exam) {
    if (actor.Role?.role === "STUDENT") return actor.gradeId === exam.gradeId;
    if (actor.Role?.role === "TEACHER") return actor.id === exam.teacherId;
    return true;
}

function canManageExam(actor, exam) {
    if (actor.Role?.role === "STUDENT") return false;
    if (isParent(actor)) return false;
    if (actor.Role?.role === "TEACHER") return actor.id === exam.teacherId;
    return true;
}

function isParent(actor) {
    return actor.Role?.role?.toUpperCase().includes("PARENT");
}

async function getLinkedStudentIds(actor) {
    const links = await ParentStudent.findAll({
        where: { parentId: actor.id },
        attributes: ["studentId"],
    });
    return links.map(({ studentId }) => studentId);
}

function validateGrade(value, exam) {
    if (value === undefined || value === null || String(value).trim() === "") {
        return "La note est obligatoire.";
    }

    const grade = Number(value);
    const maxGrade = Number(exam.maxNotes);
    if (!Number.isFinite(grade) || !Number.isFinite(maxGrade) || grade < 0 || grade > maxGrade) {
        return `La note doit être comprise entre 0 et ${exam.maxNotes}.`;
    }

    if (!exam.isGraded) return "Cet examen n'accepte pas de note.";
    return null;
}

async function loadManageableExam(req, res, actor, examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
        res.status(404).json({ message: "Examen introuvable." });
        return null;
    }
    if (!canManageExam(actor, exam)) {
        res.status(403).json({ message: "Vous ne pouvez pas gérer les notes de cet examen." });
        return null;
    }
    return exam;
}

async function validateStudents(studentIds, exam, transaction) {
    const students = await User.findAll({
        where: { id: studentIds, gradeId: exam.gradeId },
        include: [{
            model: Roles,
            as: "Role",
            attributes: [],
            where: { role: "STUDENT" },
            required: true,
        }],
        attributes: ["id"],
        transaction,
    });

    return students.length === studentIds.length;
}

async function actorHasPermission(actor, permissionCode) {
    if (!actor.roleId) return false;

    const permission = await Permission.findOne({
        where: { code: permissionCode },
        attributes: ["id"],
    });
    if (!permission) return false;

    return Boolean(await RolePermission.findOne({
        where: { roleId: actor.roleId, permissionId: permission.id },
    }));
}

const create = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const examId = parseId(req.body.examId);
        const studentId = parseId(req.body.studentId);
        if (!examId || !studentId) {
            return res.status(400).json({ message: "examId et studentId doivent être valides." });
        }

        const exam = await loadManageableExam(req, res, actor, examId);
        if (!exam) return;

        const gradeError = validateGrade(req.body.grade, exam);
        if (gradeError) return res.status(400).json({ message: gradeError });

        if (!(await validateStudents([studentId], exam))) {
            return res.status(400).json({ message: "L'élève ne fait pas partie de la classe de cet examen." });
        }

        const existingNote = await Note.findOne({ where: { examId, studentId } });
        if (existingNote) {
            return res.status(409).json({ message: "Une note existe déjà pour cet élève et cet examen." });
        }

        const note = await Note.create({ examId, studentId, grade: req.body.grade });
        return res.status(201).json(note);
    } catch (err) {
        return next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const note = await Note.findByPk(parseId(req.params.id));
        if (!note) return res.status(404).json({ message: "Note introuvable." });

        const exam = await loadManageableExam(req, res, actor, note.examId);
        if (!exam) return;

        const gradeError = validateGrade(req.body.grade, exam);
        if (gradeError) return res.status(400).json({ message: gradeError });

        await note.update({ grade: req.body.grade });
        return res.json(note);
    } catch (err) {
        return next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const note = await Note.findByPk(parseId(req.params.id));
        if (!note) return res.status(404).json({ message: "Note introuvable." });

        const exam = await loadManageableExam(req, res, actor, note.examId);
        if (!exam) return;

        await note.destroy();
        return res.json({ message: "Note supprimée." });
    } catch (err) {
        return next(err);
    }
};

const saveBulk = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const examId = parseId(req.body.examId);
        const notes = req.body.notes;
        if (!examId || !Array.isArray(notes) || notes.length === 0) {
            return res.status(400).json({ message: "examId et une liste de notes non vide sont requis." });
        }

        const exam = await loadManageableExam(req, res, actor, examId);
        if (!exam) return;

        const studentIds = notes.map((note) => parseId(note.studentId));
        if (studentIds.some((id) => !id) || new Set(studentIds).size !== studentIds.length) {
            return res.status(400).json({ message: "Chaque élève doit être valide et présent une seule fois." });
        }

        for (const note of notes) {
            const gradeError = validateGrade(note.grade, exam);
            if (gradeError) return res.status(400).json({ message: gradeError });
        }

        if (!(await validateStudents(studentIds, exam))) {
            return res.status(400).json({ message: "Un ou plusieurs élèves ne font pas partie de la classe de cet examen." });
        }

        const [canCreate, canEdit] = await Promise.all([
            actorHasPermission(actor, "CREATE_GRADES"),
            actorHasPermission(actor, "EDIT_GRADES"),
        ]);

        const savedNotes = await db.sequelize.transaction(async (transaction) => {
            const saved = [];
            for (const noteInput of notes) {
                const existing = await Note.findOne({
                    where: { examId, studentId: Number(noteInput.studentId) },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (existing) {
                    if (!canEdit) {
                        const error = new Error("La permission EDIT_GRADES est requise pour modifier une note.");
                        error.code = "NOTE_PERMISSION_DENIED";
                        throw error;
                    }
                    await existing.update({ grade: noteInput.grade }, { transaction });
                    saved.push(existing);
                } else {
                    if (!canCreate) {
                        const error = new Error("La permission CREATE_GRADES est requise pour créer une note.");
                        error.code = "NOTE_PERMISSION_DENIED";
                        throw error;
                    }
                    saved.push(await Note.create({
                        examId,
                        studentId: Number(noteInput.studentId),
                        grade: noteInput.grade,
                    }, { transaction }));
                }
            }

            return saved;
        });

        return res.json({ notes: savedNotes });
    } catch (err) {
        if (err.code === "NOTE_PERMISSION_DENIED") {
            return res.status(403).json({ message: err.message });
        }
        return next(err);
    }
};

const getExamStats = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const examId = parseId(req.params.id);
        if (!examId) return res.status(400).json({ message: "Identifiant d'examen invalide." });

        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ message: "Examen introuvable." });
        if (!canViewExam(actor, exam)) {
            return res.status(403).json({ message: "Vous ne pouvez pas consulter les statistiques de cet examen." });
        }

        if (isParent(actor)) {
            const linkedStudentIds = await getLinkedStudentIds(actor);
            const childrenInExamGrade = await User.findAll({
                where: { id: linkedStudentIds, gradeId: exam.gradeId },
                include: [{
                    model: Roles,
                    as: "Role",
                    attributes: [],
                    where: { role: "STUDENT" },
                    required: true,
                }],
                attributes: ["id"],
            });
            if (childrenInExamGrade.length === 0) {
                return res.status(403).json({ message: "Aucun de vos enfants n'appartient à cette classe." });
            }
        }

        const notes = await Note.findAll({
            where: { examId },
            attributes: ["grade"],
        });
        const grades = notes.map((note) => Number(note.grade)).filter(Number.isFinite);

        return res.json({
            average: grades.length ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0,
            min: grades.length ? Math.min(...grades) : 0,
            max: grades.length ? Math.max(...grades) : 0,
            count: grades.length,
        });
    } catch (err) {
        return next(err);
    }
};

const getTypeAll = async (req, res, next) => {
    try {
        const actor = await loadActor(req, res);
        if (!actor) return;

        const { type } = req.params;
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ message: "Identifiant invalide." });
        if (!["exam", "student", "subject"].includes(type)) {
            return res.status(400).json({ message: "Type invalide (exam, student ou subject)." });
        }

        const queryOptions = {
            where: {},
            include: [{
                model: Exam,
                required: true,
                include: [
                    { model: Subject },
                    { model: AcademicPeriod, as: "AcademicPeriod" },
                ],
            }],
            order: [["createdAt", "DESC"]],
        };

        const academicPeriodId = req.query?.academicPeriodId;
        if (academicPeriodId !== undefined) {
            if (academicPeriodId === "unassigned") {
                queryOptions.include[0].where = { academicPeriodId: null };
            } else {
                const periodId = parseId(academicPeriodId);
                if (!periodId) return res.status(400).json({ message: "Identifiant de période invalide." });

                const period = await AcademicPeriod.findByPk(periodId);
                if (!period) return res.status(404).json({ message: "Période scolaire introuvable." });

                queryOptions.include[0].include[1].where = { id: periodId };
                queryOptions.include[0].include[1].required = true;
            }
        }

        if (actor.Role?.role === "STUDENT") {
            if (type === "student" && id !== actor.id) {
                return res.status(403).json({ message: "Vous ne pouvez consulter que vos propres notes." });
            }
            if (type === "exam") {
                const exam = await Exam.findByPk(id);
                if (!exam) return res.status(404).json({ message: "Examen introuvable." });
                if (!canViewExam(actor, exam)) return res.status(403).json({ message: "Accès refusé." });
                queryOptions.where.examId = id;
            } else if (type === "subject") {
                queryOptions.include[0].where = { subjectId: id };
            }
            queryOptions.where.studentId = actor.id;
        } else if (actor.Role?.role === "TEACHER") {
            if (type === "exam") {
                const exam = await Exam.findByPk(id);
                if (!exam) return res.status(404).json({ message: "Examen introuvable." });
                if (!canViewExam(actor, exam)) return res.status(403).json({ message: "Accès refusé." });
                queryOptions.where.examId = id;
            } else {
                queryOptions.include[0].where = { teacherId: actor.id };
                if (type === "student") queryOptions.where.studentId = id;
                if (type === "subject") queryOptions.include[0].where.subjectId = id;
            }
        } else if (isParent(actor)) {
            const linkedStudentIds = await getLinkedStudentIds(actor);
            if (type === "student") {
                if (!linkedStudentIds.includes(id)) {
                    return res.status(403).json({ message: "Vous ne pouvez consulter que les notes de vos enfants." });
                }
                queryOptions.where.studentId = id;
            } else if (type === "exam") {
                const exam = await Exam.findByPk(id);
                if (!exam) return res.status(404).json({ message: "Examen introuvable." });
                const childrenInExamGrade = await User.findAll({
                    where: { id: linkedStudentIds, gradeId: exam.gradeId },
                    include: [{
                        model: Roles,
                        as: "Role",
                        attributes: [],
                        where: { role: "STUDENT" },
                        required: true,
                    }],
                    attributes: ["id"],
                });
                const childIds = childrenInExamGrade.map(({ id: childId }) => childId);
                if (childIds.length === 0) {
                    return res.status(403).json({ message: "Aucun de vos enfants n'appartient à cette classe." });
                }
                queryOptions.where.examId = id;
                queryOptions.where.studentId = childIds;
            } else {
                queryOptions.where.studentId = linkedStudentIds;
                queryOptions.include[0].where = { subjectId: id };
            }
        } else if (type === "exam") {
            queryOptions.where.examId = id;
        } else if (type === "student") {
            queryOptions.where.studentId = id;
        } else {
            queryOptions.include[0].where = { subjectId: id };
        }

        return res.json(await Note.findAll(queryOptions));
    } catch (err) {
        return next(err);
    }
};

export default { create, update, delete: remove, saveBulk, getExamStats, getTypeAll };