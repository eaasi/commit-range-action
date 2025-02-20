# Commit Range Action

This action determines updated commit ranges based on workflow's event payloads.

Possible use cases for the computed outputs are:
- Adjustment of the `fetch-depth` parameter for [actions/checkout](https://github.com/actions/checkout)
- Configuration of commit ranges for [crate-ci/commited](https://github.com/crate-ci/committed)
