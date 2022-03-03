import { useSubstrate } from 'contexts/substrateContext';
import React from 'react';
import { validatePublicAddress } from 'utils/validation/validateAddress';
import { useSend } from '../SendContext';
import SendToAddressSelect from './SendToAddressSelect';

const EXTERNAL_ACCOUNT_LABEL = 'External Public Account';

const _toReactSelectOption = (accountOptions) => {
  return (address) => {
    const internalOption = accountOptions.find(option => option.address === address);
    const isInternal = !!internalOption;
    const label =  isInternal ? internalOption.meta.name : EXTERNAL_ACCOUNT_LABEL;
    return {
      value: address,
      label,
      isInternal
    };
  };
};

const SendToPublicAddressSelect = () => {
  const {
    senderPublicAccountOptions
  } = useSend();

  const toReactSelectOption = _toReactSelectOption(senderPublicAccountOptions);

  return (
    <SendToAddressSelect
      internalAccountOptions={senderPublicAccountOptions.map(option => option.address)}
      toReactSelectOption={toReactSelectOption}
      validateAddress={validatePublicAddress}
    />
  );
};
  // const [menuIsOpen, setMenuIsOpen] = useState(false);
  // const toReactSelectOption = _toReactSelectOption(senderPublicAccountOptions);
  // const selectedOption = receiverAddress ? toReactSelectOption(receiverAddress): null;
  // const [reactSelectExternalOptions, setReactSelectExternalOptions] = useState([]);
  // const reactSelectInternalOptions = senderPublicAccountOptions?.map(account => {
  //   return toReactSelectOption(account.address);
  // });
  // const optionGroups = [
  //   {
  //     label: 'External Public Account',
  //     options: reactSelectExternalOptions
  //   },
  //   {
  //     label: 'My Public Accounts',
  //     options: reactSelectInternalOptions
  //   }
  // ];

// const onChangeOption = (option) => {
//   if (option.isInternal) {
//     setInternalPublicReceiver(option.value);
//     setReactSelectExternalOptions([]);
//   } else {
//     setExternalPublicReceiver(option.value);
//   }
// };


// return (
//   <Select
//   // onFocus={setMenuIsOpen(true)}
//     menuIsOpen={menuIsOpen}
//     onMenuOpen={() => setMenuIsOpen(true)}
//     onMenuClose={() => setMenuIsOpen(false)}
//     className="max-w-100"
//     toReactSelectOption={toReactSelectOption}
//     setReactSelectExternalOptions={setReactSelectExternalOptions}
//     isSearchable={true}
//     value={selectedOption}
//     onChange={onChangeOption}
//     options={optionGroups}
//     placeholder=""
//     styles={dropdownStyles}
//     components={
//       {
//         SingleValue: SendToPublicAddressSelectSingleValue,
//         Option: SendToPublicAddressSelectOption,
//         IndicatorSeparator: EmptyIndicatorSeparator,
//         Input: SendToPublicAddressInput
//       }
//     }
//   />
// );
// };

// const SendToPublicAddressInput = (props) => {
//   const { api } = useSubstrate(); // todo: validate address without api
//   const { onChange: onChangeInputDefault, selectProps } = props;
//   const {
//     onChange: onChangeSelect,
//     setReactSelectExternalOptions,
//     toReactSelectOption,
//     onMenuClose
//   } = selectProps;

//   window.onblur = function () {
//     document.activeElement.blur();
//   };

//   const onChangeInput = async (event) => {
//     onChangeInputDefault(event);
//     if (!api) return;
//     await api.isReady;
//     try {
//       api.createType('AccountId', event.target.value);
//       const address = event.target.value;
//       const reactSelectOption = toReactSelectOption(address);
//       !reactSelectOption.isInternal && setReactSelectExternalOptions([reactSelectOption]);
//       onChangeSelect(reactSelectOption);
//       onMenuClose();
//       event.target.blur();
//     } catch (e) {
//       console.error(e);
//       setReactSelectExternalOptions([]);
//     }
//   };

//   return (
//     <components.Input {...props} onChange={onChangeInput}/>
//   );
// };

// const SendToPublicAddressSelectSingleValue = (props) => {
//   const { data, selectProps } = props;
//   const { label, value } = data;
//   return (
//     <div>
//       {!selectProps.menuIsOpen &&
//         <div className="pl-2 border-0">
//           <div className="text-lg">
//             {label}
//           </div>
//           <div className="text-xs manta-gray">
//             {value}
//           </div>
//         </div>
//       }
//     </div>
//   );
// };

// const SendToPublicAddressSelectOption = (props) => {
//   const { value, innerProps } = props;
//   return (
//     <div {...innerProps}>
//       <div className="flex items-center hover:bg-blue-100">
//         <div className="w-full pl-4 p-2">
//           <components.Option {...props}>{}</ components.Option>
//           <div className="text-xs manta-gray block ">{value}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const EmptyIndicatorSeparator = () => {
//   return <div/>;
// };

// const dropdownStyles = {
//   control: (provided) => ({
//     ...provided,
//     borderWidth: '1px',
//     borderRadius: '0.5rem',
//     backgroundColor: '#f4f7fa',
//     paddingBottom: '0.5rem',
//     paddingTop: '0.3rem',
//     minHeight: '4.2rem',
//     width: '25rem',
//     boxShadow: '0 0 #0000',
//     cursor: 'pointer',
//   }),
//   dropdownIndicator: () => ({paddingRight: '1rem'}),
//   option: () => ({
//     fontSize: '12pt'
//   }),
//   input: (provided) => ({
//     ...provided,
//     fontSize: '1.125rem',
//     paddingLeft: '0.6rem',
//     display: 'block',
//     maxWidth: '100%',
//     overflow: 'hidden',
//     whiteSpace: 'nowrap',
//     textOverflow: 'ellipsis',
//   }),
// };




export default SendToPublicAddressSelect;