import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { researchWorkflow } from './workflows/researchWorkflow';
import { learningExtractionAgent } from './agents/learningExtractionAgent';
import { evaluationAgent } from './agents/evaluationAgent';
import { reportAgent } from './agents/reportAgent';
import { researchAgent } from './agents/researchAgent';
import { webSummarizationAgent } from './agents/webSummarizationAgent';
import { generateReportWorkflow } from './workflows/generateReportWorkflow';
import { textQuestionAgent } from './agents/text-question-agent';
import { pdfToQuestionsWorkflow } from './workflows/generate-questions-from-pdf-workflow';
import { pdfQuestionAgent } from './agents/pdf-question-agent';
import { pdfSummarizationAgent } from './agents/pdf-summarization-agent';
import { PinoLogger } from '@mastra/loggers';

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  agents: {
    researchAgent,
    reportAgent,
    evaluationAgent,
    learningExtractionAgent,
    webSummarizationAgent,
    textQuestionAgent,
    pdfQuestionAgent,
    pdfSummarizationAgent,
  },
  workflows: { generateReportWorkflow, researchWorkflow, pdfToQuestionsWorkflow },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
