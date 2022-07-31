// @ts-nocheck
import { ApiPromise, WsProvider } from '@polkadot/api';
import { localStorageKeys } from 'constants/LocalStorageConstants';
import { stat } from 'fs';
import store from 'store';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import Chain from 'types/Chain';
import BRIDGE_ACTIONS from './bridgeActions';


const getDestinationChainOptions = (originChain, originChainOptions) => {
  return originChainOptions.filter(chain => chain.name !== originChain.name)

}

const getSenderAssetTypeOptions = (originChain, destinationChain) => {
  return AssetType.AllCurrencies(false).filter(
    assetType => assetType.canTransferXcm(originChain, destinationChain))
}

const getNewSenderAssetType = (prevSenderAssetType, senderAssetTypeOptions) => {
  return (
    senderAssetTypeOptions.find(assetType => assetType.name === prevSenderAssetType?.name) 
    || senderAssetTypeOptions[0] || null
  )
}


const initOriginChainOptions = Chain.All();
const initOriginChain = initOriginChainOptions[0];
const initDestinationChainOptions = getDestinationChainOptions(initOriginChain, initOriginChainOptions);
const initDestinationChain = initDestinationChainOptions[0];
const initSenderAssetTypeOptions = getSenderAssetTypeOptions(initOriginChain, initDestinationChain);
const initSenderAssetType = initSenderAssetTypeOptions[0];

console.log('lol', initSenderAssetTypeOptions, initSenderAssetType)
// const chainApis = {};
// for (let i = 0; i < initOriginChainOptions.length; i++) {
//   const chain = initOriginChainOptions[i];
//   const socket = new WsProvider(chain.socket);
//   const api = ApiPromise.create({socket});
//   chainApis[chain.name] = api;
// }

console.log('initSenderAssetTypeOptions', initSenderAssetType)


export const BRIDGE_INIT_STATE = {
  senderPublicAccount: null,
  senderPublicAccountOptions: [],

  senderAssetType: initSenderAssetType,
  senderAssetTypeOptions: initSenderAssetTypeOptions,
  senderAssetCurrentBalance: null,
  senderAssetTargetBalance: null,
  senderNativeTokenPublicBalance: null,

  originChain: initOriginChain,
  originChainOptions: initOriginChainOptions,
  destinationChain: initDestinationChain,
  destinationChainOptions: initDestinationChainOptions,
  chainApis: null
};

const bridgeReducer = (state, action) => {
  switch (action.type) {

  case BRIDGE_ACTIONS.SET_SELECTED_ASSET_TYPE:
    return setSelectedAssetType(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT:
    return setSenderPublicAccount(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT_OPTIONS:
    return setSenderPublicAccountOptions(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE:
    return setSenderAssetCurrentBalance(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE:
    return setSenderAssetTargetBalance(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_NATIVE_TOKEN_PUBLIC_BALANCE:
    return setSenderNativeTokenPublicBalance(state, action);

  case BRIDGE_ACTIONS.SET_ORIGIN_CHAIN:
    return setOriginChain(state, action);
  
  case BRIDGE_ACTIONS.SET_DESTINATION_CHAIN:
    return setDestinationChain(state, action);

  case BRIDGE_ACTIONS.SET_CHAIN_OPTIONS:
    return setChainOptions(state, action);

  case BRIDGE_ACTIONS.SET_CHAIN_APIS:
    return setChainApis(state, action);

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

const balanceUpdateIsStale = (stateAssetType, updateAssetType) => {
  if (!updateAssetType) {
    return false;
  }
  return stateAssetType?.assetId !== updateAssetType.assetId
};

const setSelectedAssetType = (state, action) => {
  store.set(localStorageKeys.CurrentToken, action.selectedAssetType.baseTicker);
  const senderAssetType = action.selectedAssetType;
  let senderAssetTargetBalance = null;
  if (state.senderAssetTargetBalance) {
    senderAssetTargetBalance = Balance.fromBaseUnits(
      senderAssetType, state.senderAssetTargetBalance.valueBaseUnits()
    );
  }
  return {
    ...state,
    senderAssetCurrentBalance: null,
    senderAssetTargetBalance,
    senderAssetType
  };
};

const setSenderPublicAccount = (state, action) => {
  return {
    ...state,
    senderAssetCurrentBalance: null,
    senderPublicAccount: action.senderPublicAccount
  };
};

const setSenderPublicAccountOptions = (state, action) => {
  return {
    ...state,
    senderPublicAccountOptions: action.senderPublicAccountOptions
  };
};

const setSenderAssetCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.senderAssetType, action.senderAssetCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    senderAssetCurrentBalance: action.senderAssetCurrentBalance
  };
};

const setSenderAssetTargetBalance = (state, action) => {
  return {
    ...state,
    senderAssetTargetBalance: action.senderAssetTargetBalance
  };
};

const setSenderNativeTokenPublicBalance = (state, action) => {
  return {
    ...state,
    senderNativeTokenPublicBalance: action.senderNativeTokenPublicBalance
  };
};

const setOriginChain = (state, { originChain }) => {
  let destinationChain = state.destinationChain;
  const destinationChainOptions = getDestinationChainOptions(originChain, state.originChainOptions);
  if (destinationChain.name === originChain.name) {
    destinationChain = destinationChainOptions[0]
  }
  
  const senderAssetTypeOptions = getSenderAssetTypeOptions(originChain, destinationChain);
  const senderAssetType = getNewSenderAssetType(state.senderAssetType, senderAssetTypeOptions);
  
  return {
    ...state,
    originChain,
    destinationChain,
    destinationChainOptions,
    senderAssetType,
    senderAssetTypeOptions,
    senderNativeTokenPublicBalance: null,
    senderAssetCurrentBalance: null
  };
};

const setDestinationChain = (state, { destinationChain }) => {
  const senderAssetTypeOptions = getSenderAssetTypeOptions(state.originChain, destinationChain);
  const senderAssetType = getNewSenderAssetType(state.senderAssetType, senderAssetTypeOptions);

  return {
    ...state,
    senderAssetTypeOptions,
    senderAssetType,
    destinationChain,
    senderNativeTokenPublicBalance: null,
    senderAssetCurrentBalance: null
  };
};

const setChainOptions = (state, { chainOptions }) => {
  const defaultOriginChain = chainOptions[0];
  const defaultDestinationChain = chainOptions[1];
  const destinationChainOptions = getDestinationChainOptions(defaultOriginChain, chainOptions)

  return {
    ...state,
    originChain: defaultOriginChain,
    originChainOptions: chainOptions,
    destinationChain: defaultDestinationChain,
    destinationChainOptions: destinationChainOptions,
    chainApis: []
  }
}

const setChainApis = (state, {chainApis}) => {
  console.log(
    'setChainApis', chainApis
  )
  return {
    ...state,
    chainApis
  }
}

export default bridgeReducer;