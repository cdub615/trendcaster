"use client";

import ProtectedRoute from "@/components/protected-route";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {queryOptions, experimental_streamedQuery as streamedQuery, useQuery} from "@tanstack/react-query";
import {Send} from "lucide-react";
import {useEffect, useRef, useState} from "react";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [researchResults, setResearchResults] = useState<string>("");
  const [isResearching, setIsResearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to fetch streaming research data
  const fetchResearchStream = async (query: string): Promise<AsyncIterable<any>> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/research/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query }),
    });

    if (!response.body) throw new Error('No response body');

    // Create async iterator from the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      [Symbol.asyncIterator]: async function* () {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data.trim()) {
                  try {
                    const parsed = JSON.parse(data);
                    yield parsed;
                  } catch (e) {
                    // Skip malformed JSON
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  };

  // Create streamed query options
  const researchQueryOptions = (query: string) => queryOptions({
    queryKey: ['research', query],
    queryFn: streamedQuery({
      queryFn: () => fetchResearchStream(query),
      refetchMode: 'reset',
    }),
    enabled: false, // Don't run automatically
  });

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const researchQuery = useQuery({
    ...researchQueryOptions(currentQuery),
    enabled: !!currentQuery, // Enable when we have a query
  });

  // TODO: This was just an example, we need to implement this in a better way
  // I believe in the stream from the workflow we get an event with a status of suspended, and we can use that to resume the workflow
  const resumeWorkflow = () => {
    const runId = "your-workflow-run-id";
    const newUserData = {input: "Data from the user form"};

    // Make the API call to your Mastra server
    fetch(`https://your-mastra-server-url.com/workflows/runs/${runId}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may also need an API key or auth token here
      },
      body: JSON.stringify({
        step: "step1", // The ID of the suspended step
        resumeData: newUserData,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Workflow resumed successfully:", data);
        // Update your web app UI based on the response
      })
      .catch(error => {
        console.error("Error resuming workflow:", error);
      });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [researchResults]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setIsResearching(true);
    setResearchResults("");

    // Set current query and trigger the streamed query
    setCurrentQuery(text);

    setInput("");
  };

  // Handle streaming data updates
  useEffect(() => {
    if (researchQuery.data && researchQuery.data.length > 0) {
      let results = "";

      researchQuery.data.forEach((chunk: any) => {
        if (chunk.type === 'status') {
          results += `Status: ${chunk.message}\n`;
        } else if (chunk.type === 'chunk') {
          results += JSON.stringify(chunk.data, null, 2) + '\n';
        } else if (chunk.type === 'complete') {
          results += `\n${chunk.message}\n`;
          setIsResearching(false);
        } else if (chunk.type === 'error') {
          results += `Error: ${chunk.error}\n`;
          setIsResearching(false);
        }
      });

      setResearchResults(results);
    }
  }, [researchQuery.data]);

  // Handle query state changes
  useEffect(() => {
    if (researchQuery.isError) {
      setResearchResults(`Error: ${researchQuery.error?.message || 'Unknown error'}`);
      setIsResearching(false);
    }
  }, [researchQuery.isError, researchQuery.error]);

  return (
    <ProtectedRoute>
      <div className="grid grid-rows-[auto_1fr_auto] overflow-hidden w-full mx-auto p-4 gap-4">
        <div className="flex justify-center">
          Ask me anything to get started!
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto space-y-4 pb-4">
          <div className="space-y-4">
            {researchResults && (
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Research Results:</h3>
                <pre className="whitespace-pre-wrap text-sm">{researchResults}</pre>
              </div>
            )}
            {isResearching && (
              <div className="text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                Researching... This may take a moment.
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center space-x-2 pt-2 border-t"
        >
          <Input
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            placeholder="Enter your research query..."
            autoComplete="off"
            autoFocus
            disabled={isResearching}
          />
          <Button type="submit" size="icon" disabled={isResearching}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}