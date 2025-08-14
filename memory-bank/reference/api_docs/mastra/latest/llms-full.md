# Mastra Framework - Complete Technical Documentation

## Overview
Mastra is a comprehensive AI agent orchestration framework that provides tools for building, managing, and deploying AI agents with advanced capabilities including voice interaction, memory management, workflow orchestration, and multi-provider AI model integration.

## Core Architecture

### Agent System
The framework is built around the concept of AI agents that can be configured with various capabilities:

- **Basic Agent**: Core AI agent with model integration
- **Voice-Enabled Agent**: Agents with speech-to-text and text-to-speech capabilities
- **Memory-Enabled Agent**: Agents with persistent memory and context retention
- **Workflow Agent**: Agents that can orchestrate complex multi-step processes

### Key Components

#### 1. Agent Core (`@mastra/core/agent`)
The fundamental building block for creating AI agents:

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const agent = new Agent({
  name: "Agent",
  instructions: `You are a helpful assistant.`,
  model: openai("gpt-4o"),
});
```

#### 2. Voice Integration (`@mastra/voice-*`)
Multiple voice providers for speech capabilities:

- **OpenAI Voice** (`@mastra/voice-openai`): GPT-4o voice integration
- **PlayAI Voice** (`@mastra/voice-playai`): Alternative TTS provider
- **Composite Voice**: Combine different providers for input/output

```typescript
import { OpenAIVoice } from "@mastra/voice-openai";
import { CompositeVoice } from "@mastra/core/voice";

// Single provider
const voice = new OpenAIVoice();

// Multiple providers
const voice = new CompositeVoice({
  input: new OpenAIVoice(),    // For listening
  output: new PlayAIVoice(),   // For speaking
});
```

#### 3. Memory Management (`@mastra/memory`)
Persistent memory systems for context retention:

- **LibSQL Memory** (`@mastra/libsql`): SQLite-based memory storage
- **Memory Types**: Conversation history, user preferences, session data
- **Memory Operations**: Store, retrieve, search, and manage context

#### 4. Logging System (`@mastra/loggers`)
Comprehensive logging for debugging and monitoring:

- **Structured Logging**: JSON-formatted logs with metadata
- **Log Levels**: Debug, info, warn, error
- **Output Formats**: Console, file, remote logging support

## Voice Capabilities

### Speech-to-Text (STT)
Agents can listen to audio input and transcribe it:

```typescript
// Listen to audio stream
const transcription = await agent.voice.listen(audioStream);
console.log(transcription);

// Error handling
try {
  const result = await agent.voice.listen(audioStream);
} catch (error) {
  console.error("Transcription error:", error);
}
```

### Text-to-Speech (TTS)
Agents can generate speech output:

```typescript
// Generate speech
const audioStream = await agent.voice.speak("Hello, I'm your AI assistant!", {
  filetype: "m4a",
});

// Save to file
const filePath = path.join(process.cwd(), "output.mp3");
const writer = createWriteStream(filePath);
audioStream.pipe(writer);
```

### Audio Stream Management
Working with Node.js streams for audio processing:

```typescript
import { createReadStream, createWriteStream } from "fs";
import path from "path";

// Read audio file
const audioInput = createReadStream("input.mp3");

// Process and save
const audioOutput = await agent.voice.speak("Processed text");
const writer = createWriteStream("output.mp3");
audioOutput.pipe(writer);
```

## Memory Systems

### LibSQL Integration
SQLite-based memory storage for persistent context:

```typescript
import { LibSQLMemory } from "@mastra/libsql";

const memory = new LibSQLMemory({
  // Configuration options
});

const agent = new Agent({
  name: "MemoryAgent",
  model: openai("gpt-4o"),
  memory,
});
```

### Memory Operations
Store and retrieve context information:

```typescript
// Store information
await agent.memory.store("user_preference", "theme", "dark");

// Retrieve information
const theme = await agent.memory.retrieve("user_preference", "theme");

// Search memory
const results = await agent.memory.search("user preference");
```

## Workflow Orchestration

### Agent Workflows
Coordinate multiple agents for complex tasks:

```typescript
import { Workflow } from "@mastra/core/workflow";

const workflow = new Workflow({
  agents: [agent1, agent2, agent3],
  steps: [
    // Define workflow steps
  ],
});

const result = await workflow.execute(input);
```

### Workflow Streaming (vNext)
Mastra provides built-in streaming capabilities for workflows, allowing real-time progress updates:

#### Creating and Streaming Workflows
```typescript
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

// Create workflow steps
const step1 = createStep({
  id: "step-1",
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ inputData }) => {
    return { output: inputData.input + " + step-1" };
  },
});

// Create and compose workflow
export const testWorkflow = createWorkflow({
  id: "test-workflow",
  description: 'Test workflow',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ output: z.string() })
})
  .then(step1)
  .commit();
```

#### Streaming Workflow Execution
```typescript
// Get workflow and create run instance
const workflow = mastra.getWorkflow("testWorkflow");
const run = await workflow.createRunAsync();

// Stream the workflow execution
const result = await run.stream({
  inputData: {
    input: "London"
  },
});

// Process streaming results
for await (const chunk of result.stream) {
  console.log(chunk);
}
```

#### Workflow Run Methods
- **`.start()`**: Execute workflow to completion
- **`.stream()`**: Stream workflow progress in real-time
- **`.resume()`**: Resume suspended workflows
- **`.watch()`**: Monitor workflow events

#### Workflow Status Types
```typescript
// Success status
{
  "status": "success",
  "steps": { /* step details */ },
  "result": { "output": "London + step-1" }
}

// Suspended status (waiting for input)
{
  "status": "suspended",
  "steps": { /* step details */ },
  "suspended": [["step-1"]]
}

// Failed status
{
  "status": "failed",
  "steps": { /* step details */ },
  "error": "Error message"
}
```

#### Streaming in API Routes
For Next.js API routes, you can create streaming responses:

```typescript
// Create streaming response using workflow stream
const encoder = new TextEncoder();

const stream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of result.stream) {
        // Send each chunk as it comes from the workflow
        const chunkData = JSON.stringify(chunk);
        controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
      }

      // Send completion signal
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    } catch (error) {
      controller.error(error);
    }
  },
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  },
});
```

### Multi-Agent Coordination
Agents can work together on shared tasks:

```typescript
// Agent collaboration
const researchAgent = new Agent({ /* config */ });
const analysisAgent = new Agent({ /* config */ });
const reportAgent = new Agent({ /* config */ });

// Coordinate tasks
const research = await researchAgent.run("Research topic X");
const analysis = await analysisAgent.run("Analyze: " + research);
const report = await reportAgent.run("Create report from: " + analysis);
```

## AI Model Integration

### Provider Support
Multiple AI model providers:

- **OpenAI**: GPT-4o, GPT-4, GPT-3.5-turbo
- **Google AI**: Gemini models
- **Custom Models**: Via AI SDK providers

### Model Configuration
Flexible model setup:

```typescript
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

// OpenAI
const openaiModel = openai("gpt-4o");

// Google AI
const googleModel = google("gemini-1.5-pro");

// Model switching
const agent = new Agent({
  name: "FlexibleAgent",
  model: process.env.USE_GOOGLE ? googleModel : openaiModel,
});
```

## Development and Deployment

### Local Development
Development workflow with hot reloading:

```typescript
// Development agent
const devAgent = new Agent({
  name: "DevAgent",
  model: openai("gpt-4o"),
  // Development-specific configuration
});
```

### Production Deployment
Production-ready configuration:

```typescript
// Production agent
const prodAgent = new Agent({
  name: "ProdAgent",
  model: openai("gpt-4o"),
  memory: new LibSQLMemory({ /* prod config */ }),
  loggers: new ProductionLoggers(),
});
```

## Best Practices

### 1. Error Handling
Implement robust error handling for voice and memory operations:

```typescript
try {
  const result = await agent.voice.listen(audioStream);
  return result;
} catch (error) {
  console.error("Voice operation failed:", error);
  // Fallback behavior
  return await agent.run("Fallback response");
}
```

### 2. Memory Management
Efficient memory usage:

```typescript
// Clean up old memory
await agent.memory.cleanup({
  olderThan: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days
});

// Batch memory operations
await agent.memory.batchStore([
  { key: "key1", value: "value1" },
  { key: "key2", value: "value2" },
]);
```

### 3. Voice Quality
Optimize voice interactions:

```typescript
// Configure voice quality
const voice = new OpenAIVoice({
  voice: "alloy",        // Voice type
  speed: 1.0,           // Speed multiplier
  format: "mp3",        // Output format
});
```

## Integration Patterns

### Web Application Integration
Integrate with Next.js applications:

```typescript
// API route handler
export async function POST(request: Request) {
  const { message, audio } = await request.json();

  if (audio) {
    const transcription = await agent.voice.listen(audio);
    const response = await agent.run(transcription);
    const audioResponse = await agent.voice.speak(response);
    return new Response(audioResponse);
  }

  const response = await agent.run(message);
  return Response.json({ response });
}
```

### CLI Application Integration
Command-line interface integration:

```typescript
#!/usr/bin/env node
import { Agent } from "@mastra/core/agent";

const agent = new Agent({
  name: "CLIAgent",
  model: openai("gpt-4o"),
});

async function main() {
  const args = process.argv.slice(2);
  const query = args.join(" ");

  const response = await agent.run(query);
  console.log(response);
}

main().catch(console.error);
```

## Configuration Options

### Environment Variables
Common configuration:

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_key

# Database Configuration
LIBSQL_URL=your_database_url
LIBSQL_AUTH_TOKEN=your_auth_token

# Voice Configuration
VOICE_PROVIDER=openai
VOICE_QUALITY=high
```

### Configuration Files
JSON/YAML configuration support:

```json
{
  "agent": {
    "name": "ConfiguredAgent",
    "model": "gpt-4o",
    "voice": {
      "provider": "openai",
      "voice": "alloy",
      "speed": 1.0
    },
    "memory": {
      "type": "libsql",
      "url": "file:./memory.db"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Voice Not Working**
   - Check API keys and provider configuration
   - Verify audio format compatibility
   - Check network connectivity for cloud providers

2. **Memory Errors**
   - Verify database connection
   - Check permissions and file paths
   - Validate memory schema

3. **Model Integration Issues**
   - Verify API keys and quotas
   - Check model availability
   - Validate request formats

### Debug Mode
Enable detailed logging:

```typescript
import { DebugLogger } from "@mastra/loggers";

const agent = new Agent({
  name: "DebugAgent",
  model: openai("gpt-4o"),
  loggers: new DebugLogger(),
});
```

## Performance Considerations

### Memory Optimization
- Use appropriate memory cleanup schedules
- Implement memory size limits
- Batch memory operations when possible

### Voice Processing
- Stream audio processing for large files
- Implement caching for repeated requests
- Use appropriate audio quality settings

### Model Selection
- Choose appropriate model sizes for tasks
- Implement fallback models for reliability
- Monitor API usage and costs

This comprehensive documentation covers all aspects of the Mastra framework, providing developers with the knowledge needed to build sophisticated AI agents with voice capabilities, memory management, and workflow orchestration.
