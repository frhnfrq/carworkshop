import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const appointmentRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const appointments = await ctx.prisma.appointment.findMany({
      include: { mechanic: true },
      orderBy: {
        appointmentDate: "asc",
      },
    });
    return appointments;
  }),
  create: publicProcedure
    .input(
      z.object({
        clientName: z.string(),
        clientPhone: z.string(),
        carColor: z.string(),
        carLicense: z.string(),
        carEngine: z.string(),
        appointmentDate: z.string(),
        mechanicId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mechanicAppointmentsOnDate = await ctx.prisma.appointment.count({
        where: {
          appointmentDate: new Date(input.appointmentDate),
          mechanicId: input.mechanicId,
        },
      });

      const mechanic = await ctx.prisma.mechanic.findUnique({
        where: { id: input.mechanicId },
      });

      const clientAppointmentsOnDate = await ctx.prisma.appointment.count({
        where: {
          appointmentDate: new Date(input.appointmentDate),
          clientPhone: input.clientPhone,
        },
      });

      if (!mechanic || mechanicAppointmentsOnDate >= mechanic.maxActiveCars) {
        throw new Error("Mechanic is fully booked for the selected date.");
      }

      if (clientAppointmentsOnDate > 0) {
        throw new Error("You have already booked an appointment on this date.");
      }

      await ctx.prisma.appointment.create({
        data: {
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          carColor: input.carColor,
          carLicense: input.carLicense,
          carEngine: input.carEngine,
          appointmentDate: new Date(input.appointmentDate),
          mechanic: { connect: { id: input.mechanicId } },
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        appointmentDate: z.string().optional(),
        mechanicId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.appointmentDate || input.mechanicId) {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id: input.id },
        });

        if (!appointment) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid appointment selected. Doesn't exist",
          });
        }

        const newMechanicId = input.mechanicId || appointment.mechanicId;
        const newAppointmentDate = input.appointmentDate
          ? new Date(input.appointmentDate)
          : appointment.appointmentDate;

        const appointmentsOnDate = await ctx.prisma.appointment.count({
          where: {
            id: { not: input.id },
            appointmentDate: newAppointmentDate,
            mechanicId: newMechanicId,
          },
        });

        const mechanic = await ctx.prisma.mechanic.findUnique({
          where: { id: newMechanicId },
        });

        if (!mechanic || appointmentsOnDate >= mechanic.maxActiveCars) {
          throw new Error("Mechanic is fully booked for the selected date.");
        }
      }

      await ctx.prisma.appointment.update({
        where: {
          id: input.id,
        },
        data: {
          appointmentDate: input.appointmentDate
            ? new Date(input.appointmentDate)
            : undefined,
          mechanic: input.mechanicId
            ? { connect: { id: input.mechanicId } }
            : undefined,
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.appointment.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
