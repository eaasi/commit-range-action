// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { afterEach, expect, test, vi } from 'vitest';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { INITIAL_PUSH_BEFORE_COMMIT_SHA, OutputName } from '../src/constants.js';
import { process } from '../src/main.js';
import { findOldestCommit } from '../src/utils.js';
import { makeCommitSha, makePushEvent } from './utils.js';

vi.mock('@actions/core');

afterEach(() => {
  vi.resetAllMocks();
});

test('handle missing event payload', () => {
  // mock action's context
  const context = structuredClone(github.context);
  context.ref = 'refs/heads/main';
  context.eventName = 'push';
  context.payload = {};

  // run action
  process(context);

  // check results...
  const output = expect(core.setOutput);
  output.toHaveBeenCalledTimes(2);
  output.toHaveBeenCalledWith(OutputName.COMMIT_RANGE, context.ref);
  output.toHaveBeenCalledWith(OutputName.FETCH_DEPTH, 0);
});

test('process push event', () => {
  const numCommits = 5;
  const fetchDepth = numCommits + 1;
  const commitRangeBegin = makeCommitSha();
  const commitRangeEnd = makeCommitSha();
  const commitRange = commitRangeBegin + '..' + commitRangeEnd;

  // mock action's context
  const context = makePushEvent('refs/heads/main', commitRangeBegin, commitRangeEnd, numCommits);

  // run action
  process(context);

  // check results...
  const output = expect(core.setOutput);
  output.toHaveBeenCalledTimes(4);
  output.toHaveBeenCalledWith(OutputName.BEGIN_SHA, commitRangeBegin);
  output.toHaveBeenCalledWith(OutputName.END_SHA, commitRangeEnd);
  output.toHaveBeenCalledWith(OutputName.COMMIT_RANGE, commitRange);
  output.toHaveBeenCalledWith(OutputName.FETCH_DEPTH, fetchDepth);
});

const initialPushVariants = [
  '',
  INITIAL_PUSH_BEFORE_COMMIT_SHA,
  undefined,
  null,
];

test.each(initialPushVariants)('process initial push event (first commit = "%s")', (commitRangeBegin) => {
  const fetchDepth = 0;
  const commitRangeEnd = makeCommitSha();
  const ref = 'refs/heads/main';

  // mock action's context
  const context = makePushEvent(ref, commitRangeBegin as any, commitRangeEnd, fetchDepth);

  // run action
  process(context);

  // check results...
  const output = expect(core.setOutput);
  output.toHaveBeenCalledTimes(2);
  output.toHaveBeenCalledWith(OutputName.COMMIT_RANGE, ref);
  output.toHaveBeenCalledWith(OutputName.FETCH_DEPTH, fetchDepth);
});

test('process forced push event', () => {
  const numCommits = 5;
  const fetchDepth = numCommits + 1;
  const commitRangeEnd = makeCommitSha();
  const ref = 'refs/heads/main';

  // mock action's context
  const context = makePushEvent(ref, makeCommitSha(), commitRangeEnd, numCommits, true);
  const commitRangeBegin = findOldestCommit(context.payload as any).id + '~';
  const commitRange = commitRangeBegin + '..' + commitRangeEnd;

  // run action
  process(context);

  // check results...
  const output = expect(core.setOutput);
  output.toHaveBeenCalledTimes(4);
  output.toHaveBeenCalledWith(OutputName.BEGIN_SHA, commitRangeBegin);
  output.toHaveBeenCalledWith(OutputName.END_SHA, commitRangeEnd);
  output.toHaveBeenCalledWith(OutputName.COMMIT_RANGE, commitRange);
  output.toHaveBeenCalledWith(OutputName.FETCH_DEPTH, fetchDepth);
});
