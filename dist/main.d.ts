import * as github from '@actions/github';
export type ActionContext = typeof github.context;
/** Process event's payload and compute action's outputs. */
export declare function process(context: ActionContext): void;
/** The main function for the action. */
export declare function main(): void;
