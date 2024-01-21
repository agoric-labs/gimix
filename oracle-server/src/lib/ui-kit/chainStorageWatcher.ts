/* global harden */
import { makeClientMarshaller } from "./marshal.js";
import { AgoricChainStoragePathKind } from "./types.js";
import { batchVstorageQuery, keyToPath, pathToKey } from "./batchQuery.js";
import type { UpdateHandler } from "./types.js";

type Subscriber<T> = {
  onUpdate: UpdateHandler<T>;
  onError?: (message: string, code?: number, codespace?: string) => void;
};

const defaults = {
  newPathQueryDelayMs: 20,
  refreshLowerBoundMs: 2000,
  refreshUpperBoundMs: 4000,
};

const randomRefreshPeriod = (
  refreshLowerBoundMs: number,
  refreshUpperBoundMs: number,
) =>
  Math.round(Math.random() * (refreshUpperBoundMs - refreshLowerBoundMs)) +
  refreshLowerBoundMs;

const makePathSubscriber = <T>(
  onUpdate: UpdateHandler<T>,
  onError?: (message: string, code?: number, codespace?: string) => void,
) => ({
  onUpdate,
  onError,
});

export type ChainStorageWatcher = ReturnType<
  typeof makeAgoricChainStorageWatcher
>;

/**
 * Periodically queries the most recent data from chain storage, batching RPC
 * requests for efficiency.
 * @param rpcAddr RPC server URL
 * @param chainId the chain id to use
 * @param onError
 * @param marshaller CapData marshal to use
 * @param newPathQueryDelayMs
 * @param refreshLowerBoundMs
 * @param refreshUpperBoundMs
 * @returns
 */
export const makeAgoricChainStorageWatcher = (
  rpcAddr: string,
  chainId: string,
  onError?: (e: Error) => void,
  marshaller = makeClientMarshaller(),
  newPathQueryDelayMs = defaults.newPathQueryDelayMs,
  refreshLowerBoundMs = defaults.refreshLowerBoundMs,
  refreshUpperBoundMs = defaults.refreshUpperBoundMs,
) => {
  // Map of paths to [identifier, value] pairs of most recent response values.
  //
  // The 'identifier' is used to avoid notifying subscribers for already-seen
  // values. For 'data' queries, 'identifier' is the blockheight of the
  // response. For 'children' queries, 'identifier' is the stringified array
  // of children.
  const latestValueCache = new Map<
    string,
    [identifier: string, value: unknown]
  >();

  const watchedPathsToSubscribers = new Map<string, Set<Subscriber<unknown>>>();
  let isNewPathWatched = false;
  let isQueryInProgress = false;
  let nextQueryTimeout: ReturnType<typeof setTimeout> | null = null;

  const queueNextQuery = () => {
    if (isQueryInProgress || !watchedPathsToSubscribers.size) {
      return;
    }

    if (isNewPathWatched) {
      // If there is any new path to watch, schedule another query very soon.
      if (nextQueryTimeout) {
        globalThis.clearTimeout(nextQueryTimeout);
      }
      nextQueryTimeout = globalThis.setTimeout(
        queryUpdates,
        newPathQueryDelayMs,
      );
    } else {
      // Otherwise, refresh after a normal interval.
      nextQueryTimeout = globalThis.setTimeout(
        queryUpdates,
        randomRefreshPeriod(refreshLowerBoundMs, refreshUpperBoundMs),
      );
    }
  };

  const queryUpdates = async () => {
    isQueryInProgress = true;
    nextQueryTimeout = null;
    isNewPathWatched = false;

    const paths = [...watchedPathsToSubscribers.keys()].map(keyToPath);

    if (!paths.length) {
      isQueryInProgress = false;
      return;
    }

    try {
      const data = await batchVstorageQuery(
        rpcAddr,
        marshaller.fromCapData,
        paths,
      );
      watchedPathsToSubscribers.forEach((subscribers, path) => {
        // Path was watched after query fired, wait until next round.
        if (!data[path]) return;

        if (data[path].error) {
          subscribers.forEach((s) => {
            // @ts-expect-error global harden
            const { message, code, codespace } = harden(data[path].error);
            if (s.onError) {
              s.onError(message, code, codespace);
            }
          });
          return;
        }

        const { blockHeight, value } = data[path];
        const lastValue = latestValueCache.get(path);

        if (
          lastValue &&
          (blockHeight === lastValue[0] ||
            (blockHeight === undefined &&
              JSON.stringify(value) === lastValue[0]))
        ) {
          // The value isn't new, don't emit.
          return;
        }

        latestValueCache.set(path, [
          blockHeight ?? JSON.stringify(value),
          value,
        ]);

        subscribers.forEach((s) => {
          // @ts-expect-error global harden
          s.onUpdate(harden(value));
        });
      });
    } catch (e) {
      onError && onError(e as Error);
    } finally {
      isQueryInProgress = false;
      queueNextQuery();
    }
  };

  const stopWatching = (pathKey: string, subscriber: Subscriber<unknown>) => {
    const subscribersForPath = watchedPathsToSubscribers.get(pathKey);
    if (!subscribersForPath?.size) {
      throw new Error(`cannot unsubscribe from unwatched path ${pathKey}`);
    }

    if (subscribersForPath.size === 1) {
      watchedPathsToSubscribers.delete(pathKey);
      latestValueCache.delete(pathKey);
    } else {
      subscribersForPath.delete(subscriber);
    }
  };

  const queueNewPathForQuery = () => {
    if (!isNewPathWatched) {
      isNewPathWatched = true;
      queueNextQuery();
    }
  };

  const watchLatest = <T>(
    path: [AgoricChainStoragePathKind, string],
    onUpdate: (latestValue: T) => void,
    onPathError?: (message: string, code?: number, codespace?: string) => void,
  ) => {
    const pathKey = pathToKey(path);
    const subscriber = makePathSubscriber(onUpdate, onPathError);

    const latestValue = latestValueCache.get(pathKey);
    if (latestValue) {
      // @ts-expect-error global harden
      subscriber.onUpdate(harden(latestValue[1]) as T);
    }

    const samePathSubscribers = watchedPathsToSubscribers.get(pathKey);
    if (samePathSubscribers !== undefined) {
      samePathSubscribers.add(subscriber as Subscriber<unknown>);
    } else {
      watchedPathsToSubscribers.set(
        pathKey,
        new Set([subscriber as Subscriber<unknown>]),
      );
      queueNewPathForQuery();
    }

    return () => stopWatching(pathKey, subscriber as Subscriber<unknown>);
  };

  const queryOnce = <T>(path: [AgoricChainStoragePathKind, string]) =>
    new Promise<T>((res, rej) => {
      const stop = watchLatest<T>(
        path,
        (val) => {
          stop();
          res(val);
        },
        (e) => rej(e),
      );
    });

  // Assumes argument is an unserialized presence.
  const presenceToSlot = (o: unknown) => marshaller.toCapData(o).slots[0];

  const queryBoardAux = <T>(boardObjects: unknown[]) => {
    const boardIds = boardObjects.map(presenceToSlot);
    return boardIds.map((id) =>
      queryOnce<T>([
        AgoricChainStoragePathKind.Data,
        `published.boardAux.${id}`,
      ]),
    );
  };

  return {
    watchLatest,
    chainId,
    rpcAddr,
    marshaller,
    queryOnce,
    queryBoardAux,
    watchedPathsToSubscribers,
  };
};
