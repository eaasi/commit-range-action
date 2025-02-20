// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { afterEach, expect, test, vi } from 'vitest';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { OutputName } from '../src/constants.js';
import { process } from '../src/main.js';

vi.mock('@actions/core');

afterEach(() => {
  vi.resetAllMocks();
});

test('handle missing event payload', () => {
  // mock action's context
  const context = github.context;
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
