// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { Commit, PushEvent } from '@octokit/webhooks-types';

export function findOldestCommit(event: PushEvent): Commit {
  return event.commits.reduce((a, b) => {
    return (a.timestamp.localeCompare(b.timestamp) < 0) ? a : b;
  });
}
