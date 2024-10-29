import { ethers } from 'ethers';

// Use ethers to get proper checksum address
export const CONTRACT_ADDRESS = ethers.utils.getAddress("0x9EA0B72072E030C7c607e045D2C383B5118fd20f");

import TuklasArtMarketplaceABI from '../src/components/TuklasMarketplace.json';
export const CONTRACT_ABI = TuklasArtMarketplaceABI.abi;