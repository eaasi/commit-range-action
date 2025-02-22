import { Commit, PushEvent } from '@octokit/webhooks-types';
export declare function findOldestCommit(event: PushEvent): Commit;
