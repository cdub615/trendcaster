import {Mastra} from '@mastra/core';
import {LibSQLStore} from '@mastra/libsql';
import {evaluationAgent} from './agents/evaluationAgent';
import {learningExtractionAgent} from './agents/learningExtractionAgent';
import {reportAgent} from './agents/reportAgent';
import {researchAgent} from './agents/researchAgent';
import {webSummarizationAgent} from './agents/webSummarizationAgent';
import {generateReportWorkflow} from './workflows/generateReportWorkflow';
import {researchWorkflow} from './workflows/researchWorkflow';

export const mastra: Mastra = new Mastra({
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  agents: {
    researchAgent,
    reportAgent,
    evaluationAgent,
    learningExtractionAgent,
    webSummarizationAgent,
  },
  workflows: { generateReportWorkflow, researchWorkflow },
});
