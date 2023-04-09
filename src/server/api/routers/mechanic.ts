import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const mechanicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const mechanics = await ctx.prisma.mechanic.findMany();
    return mechanics;
  }),
});
