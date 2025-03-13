import { prisma } from '@/lib/prisma'
import type { EmployeeSalary, Payslip } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export class PayrollService {
  static async calculateSalary(employeeId: string, month: number, year: number) {
    // Get employee's base salary configuration
    const salary = await prisma.employeeSalary.findFirst({
      where: {
        employeeId,
        effectiveFrom: {
          lte: new Date(year, month, 1)
        }
      },
      orderBy: {
        effectiveFrom: 'desc'
      }
    })

    if (!salary) throw new Error('No salary configuration found')

    // Calculate attendance-based deductions
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1)
        }
      }
    })

    const workingDays = this.getWorkingDays(month, year)
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length
    const attendanceRate = presentDays / workingDays

    // Calculate final salary components
    const netSalary = {
      basic: salary.basicSalary * attendanceRate,
      houseRent: salary.houseRent,
      transport: salary.transport,
      medical: salary.medicalAllowance,
      deductions: {
        tax: salary.taxDeduction,
        other: salary.otherDeductions,
        attendance: salary.basicSalary * (1 - attendanceRate)
      }
    }

    const total = (
      netSalary.basic +
      netSalary.houseRent +
      netSalary.transport +
      netSalary.medical -
      netSalary.deductions.tax -
      netSalary.deductions.other -
      netSalary.deductions.attendance
    )

    return {
      components: netSalary,
      total,
      attendance: {
        workingDays,
        presentDays,
        rate: attendanceRate
      }
    }
  }

  static async generatePayslip(employeeId: string, month: number, year: number) {
    const calculation = await this.calculateSalary(employeeId, month, year)
    const now = new Date()

    return prisma.payslip.create({
      data: {
        id: uuidv4(), // Add unique ID
        employeeId,
        month,
        year,
        basicSalary: calculation.components.basic,
        deductions: 
          calculation.components.deductions.tax + 
          calculation.components.deductions.other +
          calculation.components.deductions.attendance,
        additions: 
          calculation.components.houseRent +
          calculation.components.transport +
          calculation.components.medical,
        netSalary: calculation.total,
        createdAt: now,
        updatedAt: now,
        isPaid: false // Add default value for isPaid
      }
    })
  }

  private static getWorkingDays(month: number, year: number): number {
    const date = new Date(year, month, 1)
    let workingDays = 0
    while (date.getMonth() === month) {
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Exclude weekends
        workingDays++
      }
      date.setDate(date.getDate() + 1)
    }
    return workingDays
  }
}
