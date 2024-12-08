use ethereum_types::{Address, H256};
use keccak_hash::keccak;
use rand::Rng;
use std::str::FromStr;

pub fn mine_salt(
    deployer_address: Address,
    init_code_hash: H256,
    hook_permissions_mask: Address,
) -> H256 {
    let all_hook_mask: Address =
        Address::from_str("0x0000000000000000000000000000000000003fff").unwrap();
    loop {
        let h256_bytes: [u8; 32] = rand::thread_rng().gen();
        let salt = H256::from(h256_bytes);
        let address = create2_address(deployer_address, salt, init_code_hash);
        if hook_permissions_mask == address & all_hook_mask {
            return salt;
        }
    }
}

/// Compute the address of a contract created using the `CREATE2` opcode.
/// address = keccak256(0xff + deployer_address_address + salt + keccak256(initialisation_code))[12:]
pub fn create2_address(deployer_address: Address, salt: H256, init_code_hash: H256) -> Address {
    let mut data = [0u8; 85];
    data[0] = 0xff;
    data[1..21].copy_from_slice(&deployer_address.0);
    data[21..53].copy_from_slice(&salt.0);
    data[53..85].copy_from_slice(&init_code_hash.0);

    let hash = keccak(&mut data);
    Address::from_slice(&hash[12..])
}
