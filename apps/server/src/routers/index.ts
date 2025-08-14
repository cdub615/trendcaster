import {z} from "zod";
import {protectedProcedure, publicProcedure} from "../lib/orpc";
import {mastra} from "../mastra";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  research: protectedProcedure.input(z.object({
    query: z.string(),
  })).handler(async ({ input }) => {
    const { query } = input;

    try {
      // Get the research agent directly for simple request/response
      const agent = mastra.getAgent('researchAgent');

      const researchPrompt = `Research the following topic thoroughly: "${query}".

      Return findings in JSON format with:
      - queries: array of search queries used
      - searchResults: array of relevant sources with title, url, and relevance
      - learnings: key insights discovered
      - summary: concise summary of findings`;

      const result = await agent.generate(
        [
          {
            role: 'user',
            content: researchPrompt,
          },
        ],
        {
          maxSteps: 10,
        },
      );

      // Return the research result
      return {
        success: true,
        query: query,
        result: result.text,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Research error:', error);
      throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),
};
export type AppRouter = typeof appRouter;
