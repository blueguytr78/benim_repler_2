import Icon, { IconName } from 'components/Icon';
import { ZkAccount } from 'contexts/zkAccountBalancesContext';
import { Tooltip } from 'element-react';
import { useEllipsis } from 'hooks';
import React, { useRef } from 'react';

type PrivateAssetItemProps = {
  zkAccount: ZkAccount;
  key: number;
};


const PrivateAssetItem = ({ zkAccount }: PrivateAssetItemProps) => {
  const privateBalanceRef = useRef(null);
  const isEllipsis = useEllipsis(privateBalanceRef);

  const tip = (
    <div className="zkAddressTooltip">
      {zkAccount.privateBalance.toStringUnrounded()}
    </div>
  );

  return (
    <div className="flex items-center justify-between pl-2.5 pr-3.5 py-2 text-sm hover:bg-thirdly">
      <div className="flex gap-3 items-center">
        <Icon
          className={'rounded-full w-8 h-8'}
          name={zkAccount.assetType.icon as IconName}
        />
        <div className="overflow-hidden zkAddressTooltipWrapper">
          <div className="text-white">{zkAccount.assetType.ticker}</div>
          <Tooltip
            visibleArrow={false}
            content={isEllipsis ? tip : ''}
            placement="right-end">
            <div
              ref={privateBalanceRef}
              className="text-secondary overflow-hidden overflow-ellipsis">
              {zkAccount.privateBalance.toStringUnrounded()}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="text-white">{zkAccount.usdBalanceString}</div>
    </div>
  );
};

export default PrivateAssetItem;
