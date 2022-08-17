import { CreateRunParameters, Run } from '@sorry-cypress/common';
import { driver } from '@sorry-cypress/director/execution/mongo/driver';

const makeCreateRunParameters = (): CreateRunParameters => ({
  ciBuildId: 'buildId',
  commit: {
    sha: '1234',
    remoteOrigin: 'https://gitlab-ci-token:token-to-remove@gitlab.com',
  },
  projectId: 'myProject',
  specs: ['one.spec.ts'],
  ci: {
    params: { ciBuildId: 'buildId' },
    provider: 'provider',
  },
  platform: {
    osName: 'ubuntu',
    osVersion: '20.04',
  },
});

const mockInsertOneRun = jest.fn(() => {
  return {
    ops: [
      {
        runId: '123',
        createdAt: '123',
      },
    ],
  };
});

jest.mock('@sorry-cypress/mongo', () => {
  return {
    Collection: {
      project: jest.fn(() => {
        return {
          findOne: jest.fn(),
          insertOne: jest.fn(),
        };
      }),
      run: jest.fn(() => {
        return {
          insertOne: mockInsertOneRun,
        };
      }),
    },
    runTimeoutModel: {
      createRunTimeout: () => {},
    },
  };
});

describe('runs', () => {
  it('removes gitlab_ci_token from remoteOrigin', async () => {
    const createRunParams = makeCreateRunParameters();
    await driver.createRun(createRunParams);

    expect(
      (mockInsertOneRun.mock.calls[0][0] as Run).meta.commit.remoteOrigin
    ).toEqual('gitlab.com');
  });
});
