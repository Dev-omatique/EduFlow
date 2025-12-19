-- CreateTable
CREATE TABLE "roles" (
    "Id_role" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("Id_role")
);

-- CreateTable
CREATE TABLE "classes" (
    "Id_classes" SERIAL NOT NULL,
    "name" TEXT,
    "school_year" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("Id_classes")
);

-- CreateTable
CREATE TABLE "subject" (
    "Id_subject" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("Id_subject")
);

-- CreateTable
CREATE TABLE "permissions" (
    "Id_permission" SERIAL NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("Id_permission")
);

-- CreateTable
CREATE TABLE "grades_status" (
    "Id_grades_status" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "short_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_status_pkey" PRIMARY KEY ("Id_grades_status")
);

-- CreateTable
CREATE TABLE "attendance_status" (
    "Id_attendance_status" SERIAL NOT NULL,
    "label" TEXT,
    "short_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_status_pkey" PRIMARY KEY ("Id_attendance_status")
);

-- CreateTable
CREATE TABLE "parent_type" (
    "Id_parent_type" SERIAL NOT NULL,
    "representative" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_type_pkey" PRIMARY KEY ("Id_parent_type")
);

-- CreateTable
CREATE TABLE "room_type" (
    "Id_room_type" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_type_pkey" PRIMARY KEY ("Id_room_type")
);

-- CreateTable
CREATE TABLE "penalty_type" (
    "Id_penalty_type" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penalty_type_pkey" PRIMARY KEY ("Id_penalty_type")
);

-- CreateTable
CREATE TABLE "users" (
    "Id_users" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_date" TIMESTAMP(3),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_classes" INTEGER,
    "Id_role" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("Id_users")
);

-- CreateTable
CREATE TABLE "principal_teacher" (
    "Id_principal_teacher" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_classes" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "principal_teacher_pkey" PRIMARY KEY ("Id_principal_teacher")
);

-- CreateTable
CREATE TABLE "block_note" (
    "Id_note_pad" SERIAL NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_users" INTEGER NOT NULL,

    CONSTRAINT "block_note_pkey" PRIMARY KEY ("Id_note_pad")
);

-- CreateTable
CREATE TABLE "exams" (
    "Id_exams" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "due_date" TIMESTAMP(3),
    "max_grades" DECIMAL(65,30),
    "coefficient" INTEGER,
    "isGraded" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_subject" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "Id_classes" INTEGER NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("Id_exams")
);

-- CreateTable
CREATE TABLE "grades" (
    "Id_grades" SERIAL NOT NULL,
    "grades" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" INTEGER NOT NULL,
    "Id_exams" INTEGER NOT NULL,
    "Id_grades_status" INTEGER NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("Id_grades")
);

-- CreateTable
CREATE TABLE "rooms" (
    "Id_room" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "floor_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_room_type" INTEGER NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("Id_room")
);

-- CreateTable
CREATE TABLE "news" (
    "Id_news" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reponsible_id" INTEGER NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("Id_news")
);

-- CreateTable
CREATE TABLE "penalty" (
    "Id_penalty" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_penalty_type" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "responsibleId" INTEGER NOT NULL,

    CONSTRAINT "penalty_pkey" PRIMARY KEY ("Id_penalty")
);

-- CreateTable
CREATE TABLE "courses" (
    "Id_courses" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_room" INTEGER NOT NULL,
    "Id_subject" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "Id_classes" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("Id_courses")
);

-- CreateTable
CREATE TABLE "attendance" (
    "Id_attendance" SERIAL NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "Id_attendance_status" INTEGER NOT NULL,
    "Id_courses" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("Id_attendance")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "Id_role" INTEGER NOT NULL,
    "Id_permission" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("Id_role","Id_permission")
);

-- CreateTable
CREATE TABLE "parent_student" (
    "studentId" INTEGER NOT NULL,
    "parentId" INTEGER NOT NULL,
    "Id_parent_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_student_pkey" PRIMARY KEY ("studentId","parentId","Id_parent_type")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "subject_type_key" ON "subject"("type");

-- CreateIndex
CREATE UNIQUE INDEX "grades_status_status_key" ON "grades_status"("status");

-- CreateIndex
CREATE UNIQUE INDEX "grades_status_short_status_key" ON "grades_status"("short_status");

-- CreateIndex
CREATE UNIQUE INDEX "parent_type_representative_key" ON "parent_type"("representative");

-- CreateIndex
CREATE UNIQUE INDEX "room_type_type_key" ON "room_type"("type");

-- CreateIndex
CREATE UNIQUE INDEX "penalty_type_reason_key" ON "penalty_type"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_name_key" ON "rooms"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_Id_classes_fkey" FOREIGN KEY ("Id_classes") REFERENCES "classes"("Id_classes") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_Id_role_fkey" FOREIGN KEY ("Id_role") REFERENCES "roles"("Id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_teacher" ADD CONSTRAINT "principal_teacher_Id_classes_fkey" FOREIGN KEY ("Id_classes") REFERENCES "classes"("Id_classes") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_teacher" ADD CONSTRAINT "principal_teacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_note" ADD CONSTRAINT "block_note_Id_users_fkey" FOREIGN KEY ("Id_users") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_Id_subject_fkey" FOREIGN KEY ("Id_subject") REFERENCES "subject"("Id_subject") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_Id_classes_fkey" FOREIGN KEY ("Id_classes") REFERENCES "classes"("Id_classes") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_Id_exams_fkey" FOREIGN KEY ("Id_exams") REFERENCES "exams"("Id_exams") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_Id_grades_status_fkey" FOREIGN KEY ("Id_grades_status") REFERENCES "grades_status"("Id_grades_status") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_Id_room_type_fkey" FOREIGN KEY ("Id_room_type") REFERENCES "room_type"("Id_room_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_reponsible_id_fkey" FOREIGN KEY ("reponsible_id") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_Id_penalty_type_fkey" FOREIGN KEY ("Id_penalty_type") REFERENCES "penalty_type"("Id_penalty_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "fk_courses_room" FOREIGN KEY ("Id_room") REFERENCES "rooms"("Id_room") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "fk_courses_subject" FOREIGN KEY ("Id_subject") REFERENCES "subject"("Id_subject") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "fk_courses_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "fk_courses_class" FOREIGN KEY ("Id_classes") REFERENCES "classes"("Id_classes") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_Id_attendance_status_fkey" FOREIGN KEY ("Id_attendance_status") REFERENCES "attendance_status"("Id_attendance_status") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_Id_courses_fkey" FOREIGN KEY ("Id_courses") REFERENCES "courses"("Id_courses") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_Id_role_fkey" FOREIGN KEY ("Id_role") REFERENCES "roles"("Id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_Id_permission_fkey" FOREIGN KEY ("Id_permission") REFERENCES "permissions"("Id_permission") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_student" ADD CONSTRAINT "parent_student_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_student" ADD CONSTRAINT "parent_student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("Id_users") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_student" ADD CONSTRAINT "parent_student_Id_parent_type_fkey" FOREIGN KEY ("Id_parent_type") REFERENCES "parent_type"("Id_parent_type") ON DELETE RESTRICT ON UPDATE CASCADE;
