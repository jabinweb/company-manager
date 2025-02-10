-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "actionAt" TIMESTAMP(3),
ADD COLUMN     "actionById" TEXT,
ADD COLUMN     "comment" TEXT;

-- CreateIndex
CREATE INDEX "LeaveRequest_actionById_idx" ON "LeaveRequest"("actionById");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
