// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { randomBytes } from 'node:crypto';
import * as github from '@actions/github';
import { Commit, PushEvent } from '@octokit/webhooks-types';
import { ActionContext } from '../src/main.js';

export function makeCommitSha(): string {
  return randomBytes(20).toString('hex');
}

export function makeDummyCommits(lastid: string, count: number): Array<Commit> {
  const timestamp = new Date();
  const timeDeltaInMsecs = 10 * 60 * 1000;
  const commits: Array<Commit> = [];
  for (let i = count; i > 0; --i) {
    timestamp.setTime(timestamp.getTime() - timeDeltaInMsecs);
    const commit = {
      id: makeCommitSha(),
      message: 'commit #' + i,
      timestamp: timestamp.toISOString(),
    };

    commits.push(commit as Commit);
  }

  if (count > 0)
    commits[0].id = lastid;

  return commits;
}

export function makePushEvent(ref: string, before: string, after: string, count: number, forced = false): ActionContext {
  // mock action's context
  const context = structuredClone(github.context);
  context.ref = ref;
  context.eventName = 'push';
  context.payload = {};

  // mock event's payload
  const payload = context.payload as PushEvent;
  if (before)
    payload.before = before;

  payload.after = after;
  payload.commits = makeDummyCommits(after, count);
  payload.forced = forced;

  return context;
}
