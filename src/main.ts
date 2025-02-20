// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core';
import * as github from '@actions/github';

export type ActionContext = typeof github.context;

/** Process event's payload and compute action's outputs. */
export function process(context: ActionContext): void {
  let commitRangeBegin: string | undefined = undefined;
  let commitRangeEnd: string | undefined = undefined;
  let commitRange: string = context.ref;
  let fetchDepth: number = 0;

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
