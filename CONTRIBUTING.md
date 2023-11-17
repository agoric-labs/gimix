## Testing the contract

The contract is on a branch in the agoric-sdk zoe package
(see releases for up-to-date details).

```console
$ git clone -b dc-gimix-test1 https://github.com/Agoric/agoric-sdk
$ cd agoric-sdk; yarn && yarn build
$ cd packages/zoe
```

Then run `test-gimix.js`; output should look something like...

```
$ yarn test test/unitTests/contracts/gimix/test-gimix.js
yarn run v1.22.19
$ ava --verbose test/unitTests/contracts/gimix/test-gimix.js
...
  ✔ execute work agreement (678ms)
    ℹ githubOracle starts
    ℹ alice starts
    ℹ bob starts
    ℹ oracle received invation {
        brand: Object @Alleged: Zoe Invitation brand {},
        value: [
          {
            description: 'gimix oracle invitation',
            handle: Object @Alleged: InvitationHandle {},
            installation: Object @Alleged: BundleInstallation {},
            instance: Object @Alleged: InstanceHandle {},
          },
        ],
      }
    ℹ alice offers to give {
        Acceptance: {
          brand: Object @Alleged: ZDEFAULT brand {},
          value: 12000000n,
        },
      }
    ℹ alice wants {
        Stamp: {
          brand: Object @Alleged: GimixOracle brand {},
          value: Object @copyBag {
            payload: Array [ … ],
          },
        },
      }
    ℹ alice exit {
        afterDeadline: {
          deadline: {
            absValue: 1577880000021n,
            timerBrand: Object @Alleged: timerBrand {},
          },
          timer: Object @Alleged: ManualTimer {
...
          },
        },
      }
    ℹ alice invitation Object @Alleged: Zoe Invitation payment {}
    ℹ oracle offer result {
        invitationMakers: Object @Alleged: JobsReportContinuing invitationMakers {},
        kitMustHaveMultipleFacets: Object @Alleged: JobsReportContinuing kitMustHaveMultipleFacets {},
      }
    ℹ alice offer result job id 0n
    ℹ alice assigns to bob and waits for news on https://github.com/alice/project1/issues/1 ...
    ℹ bob opens PR https://github.com/alice/project1/pull/2
    ℹ alice merges https://github.com/alice/project1/pull/2
    ℹ oracle evaluates delivery claim 0n {
        issue: {
          assignee: 'bob',
          num: 1,
          status: 'closed',
          type: 'issue',
        },
        pull: {
          author: 'bob',
          fixes: 'https://github.com/alice/project1/issues/1',
          num: 2,
          status: 'merged',
          type: 'pull',
        },
      }
    ℹ oralce makes JobReport {
        deliverDepositAddr: 'agoric1bob',
        issueURL: 'https://github.com/alice/project1/issues/1',
        jobID: 0n,
      }
    ℹ bob invitation balance {
        brand: Object @Alleged: Zoe Invitation brand {},
        value: [
          {
            customDetails: Object { … },
            description: 'gimix delivery',
            handle: Object @Alleged: InvitationHandle {},
            installation: Object @Alleged: BundleInstallation {},
            instance: Object @Alleged: InstanceHandle {},
          },
        ],
      }
    ℹ bob accepts deliver invitation Object @Alleged: ZoeSeatKit userSeat {} undefined
    ℹ bob payout Acceptance {
        brand: Object @Alleged: ZDEFAULT brand {},
        value: 12000000n,
      }
    ℹ alice payout Acceptance {
        brand: Object @Alleged: ZDEFAULT brand {},
        value: 0n,
      }
    ℹ alice payout Stamp {
        brand: Object @Alleged: GimixOracle brand {},
        value: Object @copyBag {
          payload: [
            Array [ … ],
          ],
        },
      }
    ℹ done
start-gimix gimix started!
  ─

  2 tests passed
  1 test todo
Done in 1.37s.
```