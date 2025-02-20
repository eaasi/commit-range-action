// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core';
import * as github from '@actions/github';
import { PushEvent } from '@octokit/webhooks-types';

export type ActionContext = typeof github.context;

/** Process event's payload and compute action's outputs. */
export function process(context: ActionContext): void {
  let commitRangeBegin: string | undefined = undefined;
  let commitRangeEnd: string | undefined = undefined;
  let commitRange: string = context.ref;
  let fetchDepth: number = 0;

  const payload = context.payload;

  // NOTE: payload could be empty in certain cases!
  if (payload && Object.keys(payload).length > 0) {
    switch (context.eventName) {
      case 'push':
        const event = payload as PushEvent;
        commitRangeBegin = event.before;
        commitRangeEnd = event.after;
        fetchDepth = event.commits.length;
        break;
      default:
        throw new Error('Unknown event name: ' + context.eventName);
    }
  }
  else {
    core.warning('Event payload is missing! Using defaults.');
  }

  if (commitRangeBegin !== undefined && commitRangeEnd !== undefined) {
    core.setOutput('commit-range-begin', commitRangeBegin);
    core.setOutput('commit-range-end', commitRangeEnd);
    commitRange = commitRangeBegin + '..' + commitRangeEnd;
  }

  core.setOutput('commit-range', commitRange);
  core.setOutput('fetch-depth', fetchDepth);
}

/** The main function for the action. */
export function main(): void {
  const context = github.context;
  core.info('Processing event "' + context.eventName + '"...');
  try {
    process(context);
  }
  catch (error) {
    core.error('Processing event "' + context.eventName + '" failed!');
    core.setFailed((error instanceof Error) ? error : 'Determining commit range failed!');
    throw error;
  }
}
