# uni-v4-hook-address-miner

Multithread Vanity Address Miner for Uniswap v4 Hooks

## Online version

You can use the tool through a fancy UI in [v4hookaddressminer.xyz](https://v4hookaddressminer.xyz/)

## Cli version

1. Download the latest release for your system from [GitHub Releases](https://github.com/GianfrancoBazzani/uni-v4-hook-address-miner/releases).
2. Uncompress the downloaded binary.
3. Run the binary `uni-v4-hook-address-miner`.

### Help 
```shell
❯ ./uni-v4-hook-address-miner --help
```
```shell
Usage: uni-v4-hook-address-miner [OPTIONS] [INIT_CODE_HASH] [HOOK_PERMISSIONS_MASK]

Arguments:
  [INIT_CODE_HASH]         
  [HOOK_PERMISSIONS_MASK]  

Options:
  -d, --deployer-address <DEPLOYER_ADDRESS>  [default: 0x4e59b44847b379578588920ca78fbf26c0b4956c]
  -t, --threads <NUMBER_OF_THREADS>          [default: 8]
  -p, --vanity-prefix <VANITY_PREFIX>        
  -c, --case-sensitive                       
  -h, --help                                 Print help
```

### Example Usage
```shell
❯ ./uni-v4-hook-address-miner -t 10 -p 0dd -c 0x229063f3bd4cc437d4415e5229ae68aeeab5322d76889185a0f267958867d544 0x0000000000000000000000000000000000000003
```
```shell
Run properties:
 * Deployer address: 0x4e59b44847b379578588920ca78fbf26c0b4956c
 * Init code hash: 0x229063f3bd4cc437d4415e5229ae68aeeab5322d76889185a0f267958867d544
 * Hook permissions mask: 0x0000000000000000000000000000000000000003
 * Vanity prefix: "0dd"
 * Number of threads: 10

▰▰▱▱▱▱▱ Mining...

Salt Found!
 * Salt: 0x997c9dca16e43c434b99cd75a8daffd02c02315d227f28e504048ff340074012
 * Address: 0x0dde6775Ae6b503267B6ded53897526b3c760003
```