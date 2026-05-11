import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

/**
 * WebWorkerMLCEngineHandler is a helper class that handles messages from the main thread
 * and routes them to the MLCEngine.
 */
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
