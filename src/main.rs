use clap::Parser;
use ethereum_types::{Address, H256};
use std::str::FromStr;
use std::thread;
use uni_v4_hook_address_miner::{create2_address, mine_salt};

const CREATE2_UNIVERSAL_DEPLOYER: &str = "0x4e59b44847b379578588920ca78fbf26c0b4956c";

#[derive(Parser)]
#[command( about, long_about = None)]
struct Cli {
    init_code_hash: Option<String>,
    hook_permissions_mask: Option<String>,
    #[arg(short, long, value_name = "NUMBER_OF_THREADS", default_value_t = 8)]
    threads: i32,
    #[arg(short, long, value_name = "DEPLOYER_ADDRESS", default_value = CREATE2_UNIVERSAL_DEPLOYER)]
    deployer_address: Option<String>,
}

fn main() {
    let cli = Cli::parse();
    let mut deployer_address: Address = Address::zero();
    let mut init_code_hash: H256 = H256::zero();
    let mut hook_permissions_mask: Address = Address::zero();
    let threads = cli.threads;

    // Parse the command line arguments
    if let Some(_deployer_address) = cli.deployer_address.as_deref() {
        deployer_address = Address::from_str(_deployer_address).expect("Invalid deployer address");
    }
    if let Some(_init_code_hash) = cli.init_code_hash.as_deref() {
        init_code_hash = H256::from_str(_init_code_hash).expect("Invalid init code hash");
    }
    if let Some(_miner_address) = cli.hook_permissions_mask.as_deref() {
        hook_permissions_mask =
            Address::from_str(_miner_address).expect("Invalid hook permission mask");
    }

    // Validate the command line arguments
    if deployer_address == Address::zero() {
        eprintln!("Invalid deployer address");
        std::process::exit(1);
    }
    if init_code_hash == H256::zero() {
        eprintln!("Invalid initialization code hash");
        std::process::exit(1);
    }
    if hook_permissions_mask == Address::zero() {
        eprintln!("Error:: Invalid miner address");
        std::process::exit(1);
    }

    println!("Starting address mining...");
    println!("Deployer address: {:?}", &deployer_address);
    println!("Init code hash: {:?}", &init_code_hash);
    println!("Hook permissions mask: {:?}", &hook_permissions_mask);

    let handles: Vec<_> = (0..threads)
        .map(|_| {
            thread::spawn(move || {
                let salt: H256 = mine_salt(deployer_address, init_code_hash, hook_permissions_mask);
                let address: Address = create2_address(deployer_address, salt, init_code_hash);
                println!("Found a valid salt!");
                println!("Salt: {:?}", &salt);
                println!("Address: {:?}", &address);
                std::process::exit(0);
            })
        })
        .collect();
    for handle in handles {
        handle.join().unwrap();
    }
}
