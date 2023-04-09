-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "carColor" TEXT NOT NULL,
    "carLicense" TEXT NOT NULL,
    "carEngine" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "mechanicId" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxActiveCars" INTEGER NOT NULL,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
