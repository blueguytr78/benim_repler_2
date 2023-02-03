import store from 'store';
import TxHistoryEvent, { HISTORY_EVENT_STATUS } from 'types/TxHistoryEvent';
import { ExtrinsicOrHash } from '@polkadot/types/interfaces';

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = (fromJson = true) => {
  const privateTransactionHistory = [
    ...store.get(PRIVATE_TRANSACTION_STORAGE_KEY, [])
  ];
  privateTransactionHistory.forEach((txHistoryEvent) => {
    if (fromJson) {
      TxHistoryEvent.fromJson(txHistoryEvent);
    }
  });
  return privateTransactionHistory;
};

export const setPrivateTransactionHistory = (privateTransactionHistory: TxHistoryEvent[]) => {
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// add pending private transaction to the history
export const appendTxHistoryEvent = (txHistoryEvent: TxHistoryEvent) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory(false)];
  txHistoryEvent.toJson();
  privateTransactionHistory.push(txHistoryEvent);
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// update pending transaction to finalized transaction status
export const updateTxHistoryEventStatus = (
  status: HISTORY_EVENT_STATUS,
  extrinsicHash: ExtrinsicOrHash
) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory(false)];
  privateTransactionHistory.forEach((txHistoryEvent) => {
    if (
      txHistoryEvent.extrinsicHash === extrinsicHash &&
      txHistoryEvent.status === HISTORY_EVENT_STATUS.PENDING
    ) {
      txHistoryEvent.status = status;
    }
  });
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// remove pending history event (usually the last one) from the history
export const removePendingTxHistoryEvent = (extrinsicHash: ExtrinsicOrHash) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory(false)];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  if (extrinsicHash) {
    const txHistoryEvent = privateTransactionHistory.find(
      (txHistoryEvent) => txHistoryEvent.extrinsicHash === extrinsicHash
    );

    if (
      txHistoryEvent &&
      txHistoryEvent.status === HISTORY_EVENT_STATUS.PENDING
    ) {
      privateTransactionHistory.splice(
        privateTransactionHistory.indexOf(txHistoryEvent),
        1
      );
    }
  } else {
    const lastTransaction =
      privateTransactionHistory[privateTransactionHistory.length - 1];
    if (lastTransaction.status !== HISTORY_EVENT_STATUS.PENDING) {
      return;
    }

    privateTransactionHistory.pop();
  }
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};
