use alloy_primitives::{Address, B256};
use uni_v4_hook_address_miner::{fulfills_vanity, mine_salt};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RunProperties {
    deployer_address: Address,
    init_code_hash: B256,
    hook_permissions_mask: Address,
    vanity_prefix: String,
    case_sensitive: bool,
}

#[wasm_bindgen]
impl RunProperties {
    pub fn new(
        deployer_address: &[u8],
        init_code_hash: &[u8],
        hook_permissions_mask: &[u8],
        vanity_prefix: String,
        case_sensitive: bool,
    ) -> RunProperties {
        RunProperties {
            deployer_address: Address::from_slice(deployer_address),
            init_code_hash: B256::from_slice(init_code_hash),
            hook_permissions_mask: Address::from_slice(hook_permissions_mask),
            vanity_prefix,
            case_sensitive,
        }
    }

    pub fn mine_salt(&self) -> RunResult {
        loop {
            let salt = mine_salt(
                self.deployer_address,
                self.init_code_hash,
                self.hook_permissions_mask,
            );
            let address = self.deployer_address.create2(salt, self.init_code_hash);
            if fulfills_vanity(address, &self.vanity_prefix, self.case_sensitive) {
                return RunResult { salt, address };
            }
        }
    }
}

#[wasm_bindgen]
pub struct RunResult {
    salt: B256,
    address: Address,
}

#[wasm_bindgen]
impl RunResult {
    pub fn salt(&self) -> String {
        self.salt.to_string()
    }

    pub fn address(&self) -> String {
        self.address.to_string()
    }
}
