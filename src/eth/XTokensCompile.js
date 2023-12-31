// 1. Import packages
import fs from 'fs';
import solc from 'solc';

// 2. Get path and load contract
const source = fs.readFileSync('Xtokens.sol', 'utf8');

// 3. Create input object
const input = {
  language: 'Solidity',
  sources: {
    'Xtokens.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};
// 4. Compile the contract
const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
const contractFile = tempFile.contracts['Xtokens.sol']['Xtokens'];


// 5. Export contract data
export default contractFile;
