// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { PushEvent, PullRequestEvent } from '@octokit/webhooks-types';
import { INITIAL_PUSH_BEFORE_COMMIT_SHA, OutputName } from './constants.js';
import { findOldestCommit } from './utils.js';

export type ActionContext = typeof github.context;

function isCommitValid(commit: string): boolean {
  return (commit && commit !== INITIAL_PUSH_BEFORE_COMMIT_SHA) ? true : false;
}

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
        if (isCommitValid(event.before)) {
          commitRangeBegin = event.before;
        }
        commitRangeEnd = event.after;
        fetchDepth = event.commits.length;
        if (event.forced) {
          // The before commit could be overwritten during a forced push
          // and would then become unreachable when a repo is cloned later!
          // Hence, let's use the parent of the oldest pushed commit instead.
          const commit = findOldestCommit(event);
          commitRangeBegin = commit.id + '~';
        }
        break;
      case 'pull_request':
        const pr = (payload as PullRequestEvent).pull_request;
        commitRangeBegin = pr.base.sha;
        commitRangeEnd = pr.head.sha;
        fetchDepth = pr.commits;
        break;
      default:
        throw new Error('Unknown event name: ' + context.eventName);
    }
  }
  else {
    core.warning('Event payload is missing! Using defaults.');
  }

  if (commitRangeBegin !== undefined && commitRangeEnd !== undefined) {
    assert(isCommitValid(commitRangeBegin), 'Commit range begin is invalid!');
    core.setOutput(OutputName.BEGIN_SHA, commitRangeBegin);
    assert(commitRangeEnd, 'Commit range end is invalid!');
    core.setOutput(OutputName.END_SHA, commitRangeEnd);
    commitRange = commitRangeBegin + '..' + commitRangeEnd;
  }

  if (fetchDepth > 0) {
    // Since the fetch depth as-is covers only all updated commits,
    // include the parent of the first commit in the range, too!
    ++fetchDepth;
  }

  assert(commitRange, 'Commit range is invalid!');
  core.setOutput(OutputName.COMMIT_RANGE, commitRange);

  assert(fetchDepth >= 0, 'Fetch depth is invalid!');
  core.setOutput(OutputName.FETCH_DEPTH, fetchDepth);
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
