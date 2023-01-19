//@ts-nocheck
import Svgs from 'resources/icons';
import classNames from 'classnames';
import { getPrivateTransactionHistory } from 'utils/persistence/privateTransactionHistory';
import { PRIVATE_TX_TYPE, HISTORY_EVENT_STATUS } from 'types/HistoryEvent';

const PrivateActivityTableContent = () => {
  const privateTransactionHistory = getPrivateTransactionHistory().reverse();

  if (privateTransactionHistory && privateTransactionHistory.length > 0) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {privateTransactionHistory.map((transaction, _) => (
          <PrivateActivityItem
            transaction={transaction}
            key={transaction.date}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div className="whitespace-nowrap text-center mt-6">
        You have no activity yet.
      </div>
    );
  }
};

const PrivateActivityItem = ({ transaction }) => {
  const {
    transactionType,
    transactionMsg,
    assetBaseType,
    amount,
    date,
    status,
    subscanUrl
  } = transaction;

  const dateString = `${date.split(' ')[2]} ${date.split(' ')[1]}`;
  const onCLickHandler = (subscanUrl) => () => {
    if (subscanUrl) {
      window.open(subscanUrl, '_blank', 'noopener');
    }
  };

  return (
    <div
      onClick={onCLickHandler(subscanUrl)}
      className="flex flex-col hover:bg-thirdry">
      <div className="flex items-center justify-between pl-2.5 pr-3.5 py-1.5 text-sm">
        <div className="flex flex-col">
          <div className="text-white">{transactionMsg}</div>
          <ActivityMessage
            transactionType={transactionType}
            amount={amount}
            assetBaseType={assetBaseType}
          />
          <StatusMessage status={status} />
        </div>
        <div className="text-white">{dateString}</div>
      </div>
    </div>
  );
};

const ActivityMessage = ({ transactionType, amount, assetBaseType }) => {
  if (transactionType === PRIVATE_TX_TYPE.TO_PRIVATE) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} ${assetBaseType}`}
        <img src={Svgs.ThreeRightArrowIcon} alt={'ThreeArrowRightIcon'} />
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.TO_PUBLIC) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} zk${assetBaseType}`}
        <img src={Svgs.ThreeRightArrowIcon} alt={'ThreeArrowRightIcon'} />
        {`${amount} ${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER) {
    return (
      <div className="text-secondary text-xss">
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  } else {
    return null;
  }
};

const StatusMessage = ({ status }) => {
  let textColor;
  if (status === HISTORY_EVENT_STATUS.FAILED) {
    textColor = 'text-red-500';
  } else if (status === HISTORY_EVENT_STATUS.PENDING) {
    textColor = 'text-yellow-500';
  } else if (status === HISTORY_EVENT_STATUS.SUCCESS) {
    textColor = 'text-green-300';
  }
  const StatusMessageTemplate = ({ iconSrc, iconAlt, message }) => {
    return (
      <div
        className={classNames(
          'text-xss flex flex-row items-center gap-1',
          textColor
        )}>
        <img src={iconSrc} alt={iconAlt} />
        {message}
      </div>
    );
  };
  if (status === HISTORY_EVENT_STATUS.SUCCESS) {
    return (
      <StatusMessageTemplate
        iconSrc={Svgs.TxSuccessIcon}
        iconAlt={'TxSuccessIcon'}
        message={HISTORY_EVENT_STATUS.SUCCESS}
      />
    );
  } else if (status === HISTORY_EVENT_STATUS.FAILED) {
    return (
      <StatusMessageTemplate
        iconSrc={Svgs.TxFailedIcon}
        iconAlt={'TxFailedIcon'}
        message={HISTORY_EVENT_STATUS.FAILED}
      />
    );
  } else if (status === HISTORY_EVENT_STATUS.PENDING) {
    return (
      <StatusMessageTemplate
        iconSrc={Svgs.TxPendingIcon}
        iconAlt={'TxPendingIcon'}
        message={HISTORY_EVENT_STATUS.PENDING}
      />
    );
  } else {
    return null;
  }
};

export default PrivateActivityTableContent;
