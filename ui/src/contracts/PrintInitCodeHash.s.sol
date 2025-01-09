/*1. Copy this script to the 'script' directory of your Foundry project.*/
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import "forge-std/console.sol";

/* 2. Replace 'YourHook' with the name of the hook for which you want to compute the Init Code Hash */
import {YourHook as TargetHook} from "../src/YourHook.sol";

contract PrintInitCodeHash is Script {
    /* 3. Uncomment the PoolManager address corresponding to the network you are using */
    // address constant PM_ADDRESS = 0xC81462Fec8B23319F288047f8A03A57682a35C1A; // Unichain Sepolia: 1301
    // address constant PM_ADDRESS = 0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A;  // Sepolia: 11155111
    // address constant PM_ADDRESS = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;  // Base Sepolia: 84532
    // address constant PM_ADDRESS = 0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317;  // Arbitrum Sepolia: 421614

    function run() public {
        // Hook constructor arguments
        bytes memory constructorArguments = abi.encode(PM_ADDRESS /* 4. Add any additional arguments here, if necessary */);

        // Print Init Code Hash
        bytes memory creationCodeWithConstructorArguments =
            abi.encodePacked(type(TargetHook).creationCode, constructorArguments);
        console.log("Init Code Hash:");
        console.logBytes32(keccak256(creationCodeWithConstructorArguments));
    }
}

/* 5. Run `forge script PrintInitCodeHash` to compute the Init Code Hash for the specified hook */