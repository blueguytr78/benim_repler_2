import axios from 'axios';
import {
  createContext,
  ReactElement,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect
} from 'react';
import BN from 'bn.js';
import { MantaUtilities } from 'manta.js';

import Balance from 'types/Balance';
import { useSubstrate } from 'contexts/substrateContext';
import AssetType from 'types/AssetType';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useConfig } from 'contexts/configContext';
import { MAX_UPLOAD_LEN } from '../components/UploadPanel';
import { LevelType, TokenType } from '../components/TokenButton';

export enum Step {
  Home,
  Upload,
  Theme,
  Mint,
  Generating,
  Generated,
  MintedList
}

export type UploadFile = {
  file?: File;
  name?: string;
  url?: string;
  success?: boolean;
};
export type GeneratedImg = {
  style: string;
  url: string;
  cid?: string;
  proofId?: string;
  blur_url?: string;
  assetId?: string;
  watermarkToken?: TokenType | null;
  watermarkLevel?: LevelType | null;
};

export type OnGoingTaskResult = {
  status: boolean;
  urls: GeneratedImg[];
  model_id: string;
};

export type SBTContextValue = {
  currentStep: Step;
  setCurrentStep: (nextStep: Step) => void;
  imgList: Array<UploadFile>;
  setImgList: (imgList: Array<UploadFile>) => void;
  uploadImgs: (files: File[]) => void;
  onGoingTask: OnGoingTaskResult | null;
  setOnGoingTask: (onGoingTask: OnGoingTaskResult | null) => void;
  showOnGoingTask: boolean;
  getPublicBalance: (
    address: string,
    assetType: AssetType
  ) => Promise<Balance | null>;
  nativeTokenBalance: Balance | null;
  skippedStep: boolean;
  toggleSkippedStep: (skippedStep: boolean) => void;
  hintStatus: boolean;
  updateHintStatus: () => void;
};

const SBTContext = createContext<SBTContextValue | null>(null);

export const SBTContextProvider = (props: { children: ReactElement }) => {
  const [currentStep, setCurrentStep] = useState(Step.Home);
  const [imgList, setImgList] = useState([] as Array<UploadFile>);
  const [onGoingTask, setOnGoingTask] = useState<OnGoingTaskResult | null>(
    null
  );
  const [nativeTokenBalance, setNativeTokenBalance] = useState<Balance | null>(
    null
  );
  const [skippedStep, toggleSkippedStep] = useState(false);
  const [hintStatus, setHintStatus] = useState(false);

  const { externalAccount } = useExternalAccount();
  const config = useConfig();
  const { api } = useSubstrate();

  const uploadImgs = useCallback(
    async (files: File[]) => {
      const formData = new FormData();
      formData.append('address', externalAccount.address);
      files.forEach((file) => {
        formData.append('files', file);
      });
      const fileUploadUrl = `${config.SBT_NODE_SERVICE}/npo/files`;
      try {
        const ret = await axios.post<UploadFile[]>(fileUploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (ret.status === 200 || ret.status === 201) {
          const addedImgList = ret?.data?.map((data, index) => ({
            ...data,
            file: files[index]
          }));
          const newImgList = [...imgList, ...addedImgList].slice(
            0,
            MAX_UPLOAD_LEN
          );
          setImgList(newImgList);
        }
      } catch (e: any) {
        const addedImgList = files.map((file) => ({
          file,
          success: false,
          name: file.name
        }));
        const newImgList = [...imgList, ...addedImgList].slice(
          0,
          MAX_UPLOAD_LEN
        );
        setImgList(newImgList);
      }
    },
    [config?.SBT_NODE_SERVICE, externalAccount?.address, imgList]
  );

  useEffect(() => {
    const getOnGoingTask = async () => {
      if (
        externalAccount?.address &&
        (currentStep === Step.Home || currentStep === Step.Upload)
      ) {
        const url = `${config.SBT_NODE_SERVICE}/npo/ongoing`;

        const ret = await axios.post<OnGoingTaskResult>(url, {
          address: externalAccount.address
        });
        if (ret.status === 200 || ret.status === 201) {
          setOnGoingTask(ret?.data);
        }
      }
    };
    getOnGoingTask();
  }, [config.SBT_NODE_SERVICE, currentStep, externalAccount]);

  useEffect(() => {
    const getHintStatus = async () => {
      if (externalAccount?.address && currentStep !== Step.Home) {
        const url = `${config.SBT_NODE_SERVICE}/npo/hint`;
        const data = {
          address: externalAccount?.address
        };
        const ret = await axios.post<{ status: boolean }>(url, data);
        if (ret.status === 200 || ret.status === 201) {
          setHintStatus(ret.data.status);
        }
      }
    };
    getHintStatus();
  }, [config.SBT_NODE_SERVICE, currentStep, externalAccount?.address]);

  const updateHintStatus = useCallback(() => {
    if (externalAccount?.address) {
      const url = `${config.SBT_NODE_SERVICE}/npo/hints`;
      const data = {
        address: externalAccount.address
      };
      axios.post<{ status: boolean }>(url, data);
      setHintStatus(false);
    }
  }, [config.SBT_NODE_SERVICE, externalAccount?.address]);

  const showOnGoingTask = useMemo(() => {
    return (
      (currentStep === Step.Home || currentStep === Step.Upload) &&
      !!onGoingTask &&
      !!Object.keys(onGoingTask)?.length
    );
  }, [currentStep, onGoingTask]);

  const nativeAsset = AssetType.Native(config);

  const getPublicBalance = useCallback(
    async (address: string, assetType: AssetType) => {
      if (!api?.isConnected || !address) {
        return null;
      }

      const balanceRaw = await MantaUtilities.getPublicBalance(
        api,
        new BN(assetType.assetId),
        address
      );
      const balance = balanceRaw ? new Balance(assetType, balanceRaw) : null;
      return balance;
    },
    [api]
  );

  useEffect(() => {
    const fetchPublicBalance = async () => {
      const balance = await getPublicBalance(
        externalAccount?.address,
        nativeAsset
      );
      setNativeTokenBalance(balance);
    };
    fetchPublicBalance();
  }, [externalAccount, getPublicBalance, nativeAsset]);

  const value: SBTContextValue = useMemo(() => {
    return {
      currentStep,
      setCurrentStep,
      imgList,
      setImgList,
      uploadImgs,
      onGoingTask,
      showOnGoingTask,
      setOnGoingTask,
      getPublicBalance,
      nativeTokenBalance,
      toggleSkippedStep,
      skippedStep,
      hintStatus,
      updateHintStatus
    };
  }, [
    currentStep,
    imgList,
    uploadImgs,
    onGoingTask,
    showOnGoingTask,
    getPublicBalance,
    nativeTokenBalance,
    skippedStep,
    hintStatus,
    updateHintStatus
  ]);

  return (
    <SBTContext.Provider value={value}>{props.children}</SBTContext.Provider>
  );
};

export const useSBT = () => {
  const data = useContext(SBTContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useSBT() can only be used inside of <SBTContext />, please declare it at a higher level.'
    );
  }
  return data;
};
