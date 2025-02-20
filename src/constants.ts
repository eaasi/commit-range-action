// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

/** The before commit SHA used in the initial push event */
export const INITIAL_PUSH_BEFORE_COMMIT_SHA: string
    = '0000000000000000000000000000000000000000';

/** Action's output name */
export enum OutputName {
  COMMIT_RANGE = 'commit-range',
  FETCH_DEPTH = 'fetch-depth',
  BEGIN_SHA = 'begin-sha',
  END_SHA = 'end-sha',
};
