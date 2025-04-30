import { Client as WorkflowClient } from '@upstash/workflow';
import { Client as QstashClient } from "@upstash/qstash";
import { QSTASH_TOKEN, QSTASH_URL } from './env.js';

export const workflowClient = new WorkflowClient({
   baseUrl: QSTASH_URL,
   token: QSTASH_TOKEN,
})

export const qstashClient = new QstashClient({
   token: QSTASH_TOKEN,
})