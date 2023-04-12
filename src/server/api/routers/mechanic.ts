import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const mechanicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const mechanics = await ctx.prisma.mechanic.findMany();
    return mechanics;
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        maxActiveCars: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.mechanic.create({
        data: {
          name: input.name,
          maxActiveCars: input.maxActiveCars,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        maxActiveCars: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.mechanic.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          maxActiveCars: input.maxActiveCars,
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
      await ctx.prisma.mechanic.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
