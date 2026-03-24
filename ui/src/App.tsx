import "./App.css";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  SquarePlus,
  SquareMinus,
  Copy,
  Check,
  LoaderPinwheel,
  PartyPopper,
} from "lucide-react";
import { CodeDisplay } from "@/components/code-display";
import { RandomCode } from "@/components/random-code";
import { numberToHex } from "viem";
import type {
  WorkerInputs,
  WorkerOutputs,
} from "./lib/miner_wasm_worker/worker.ts";
import { WorkerState } from "./lib/miner_wasm_worker/worker.ts";
import minerWorker from "./lib/miner_wasm_worker/worker.ts?worker";

const minerInputSchema = z.object({
  initCodeHash: z
    .string()
    .length(66, {
      message: "Must be exactly 66 characters long including leading '0x'",
    })
    .regex(/^0x[0-9a-fA-F]*$/, {
      message: "Must contain only hexadecimal characters",
    }),
  deployerAddress: z
    .string()
    .length(42, {
      message: "Must be exactly 42 characters long including leading '0x'",
    })
    .regex(/^0x[0-9a-fA-F]*$/, {
      message: "Must contain only hexadecimal characters",
    }),
  vanityPrefix: z
    .string()
    .max(36, { message: "Max length is 36 characters" })
    .regex(/^[0-9a-fA-F]*$/, {
      message: "Must contain only hexadecimal characters",
    })
    .optional(),
  caseSensitive: z.boolean().default(false),
  beforeInitialize: z.boolean(),
  afterInitialize: z.boolean(),
  beforeAddLiquidity: z.boolean(),
  beforeRemoveLiquidity: z.boolean(),
  afterAddLiquidity: z.boolean(),
  afterRemoveLiquidity: z.boolean(),
  beforeSwap: z.boolean(),
  afterSwap: z.boolean(),
  beforeDonate: z.boolean(),
  afterDonate: z.boolean(),
  beforeSwapReturnDelta: z.boolean(),
  afterSwapReturnDelta: z.boolean(),
  afterAddLiquidityReturnDelta: z.boolean(),
  afterRemoveLiquidityReturnDelta: z.boolean(),
});

const BEFORE_INITIALIZE_FLAG = 1 << 13;
const AFTER_INITIALIZE_FLAG = 1 << 12;
const BEFORE_ADD_LIQUIDITY_FLAG = 1 << 11;
const AFTER_ADD_LIQUIDITY_FLAG = 1 << 10;
const BEFORE_REMOVE_LIQUIDITY_FLAG = 1 << 9;
const AFTER_REMOVE_LIQUIDITY_FLAG = 1 << 8;
const BEFORE_SWAP_FLAG = 1 << 7;
const AFTER_SWAP_FLAG = 1 << 6;
const BEFORE_DONATE_FLAG = 1 << 5;
const AFTER_DONATE_FLAG = 1 << 4;
const BEFORE_SWAP_RETURNS_DELTA_FLAG = 1 << 3;
const AFTER_SWAP_RETURNS_DELTA_FLAG = 1 << 2;
const AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 1;
const AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 0;

const hookPermissions: [
  "beforeInitialize",
  "afterInitialize",
  "beforeAddLiquidity",
  "beforeRemoveLiquidity",
  "afterAddLiquidity",
  "afterRemoveLiquidity",
  "beforeSwap",
  "afterSwap",
  "beforeDonate",
  "afterDonate",
  "beforeSwapReturnDelta",
  "afterSwapReturnDelta",
  "afterAddLiquidityReturnDelta",
  "afterRemoveLiquidityReturnDelta"
] = [
  "beforeInitialize",
  "afterInitialize",
  "beforeAddLiquidity",
  "beforeRemoveLiquidity",
  "afterAddLiquidity",
  "afterRemoveLiquidity",
  "beforeSwap",
  "afterSwap",
  "beforeDonate",
  "afterDonate",
  "beforeSwapReturnDelta",
  "afterSwapReturnDelta",
  "afterAddLiquidityReturnDelta",
  "afterRemoveLiquidityReturnDelta",
];

const hookPermissionsShort = {
  beforeInitialize: "beforeInitialize",
  afterInitialize: "afterInitialize",
  beforeAddLiquidity: "beforeAddLiquidity",
  beforeRemoveLiquidity: "beforeRemoveLiquidity",
  afterAddLiquidity: "afterAddLiquidity",
  afterRemoveLiquidity: "afterRemoveLiquidity",
  beforeSwap: "beforeSwap",
  afterSwap: "afterSwap",
  beforeDonate: "beforeDonate",
  afterDonate: "afterDonate",
  beforeSwapReturnDelta: "beforeSwapReturnDelta",
  afterSwapReturnDelta: "afterSwapReturnDelta",
  afterAddLiquidityReturnDelta: "afterAddLiquidityReturnDelta",
  afterRemoveLiquidityReturnDelta: "afterRemoveLiquidityReturnDelta",
};

enum MiningStates {
  NOT_STARTED,
  RUNNING,
  STOPPED,
  FOUND,
}

function App() {
  const [miningState, setMiningState] = useState<MiningStates>(
    MiningStates.NOT_STARTED
  );
  const [threads, setThreads] = useState<number>(2);
  const [resultSalt, setResultSalt] = useState<string>(
    "0x229063f3bd4cc437d4415e5229ae68aeeab5322d76889185a0f267958867d544"
  );
  const [resultAddress, setResultAddress] = useState<string>(
    "0xfB46D30c9b3AcC61d714d167179748fD01E09a36"
  );
  const [copiedSalt, setCopiedSalt] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [hookPermissionsMask, setHookPermissionsMask] = useState<number>(0);
  const [vanityPrefix, setVanityPrefix] = useState<string>("");
  const [workers, setWorkers] = useState<Array<Worker>>([]);

  const minerForm = useForm<z.infer<typeof minerInputSchema>>({
    resolver: zodResolver(minerInputSchema),
    defaultValues: {
      initCodeHash: "",
      deployerAddress: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
      vanityPrefix: "",
      caseSensitive: false,
      beforeInitialize: false,
      afterInitialize: false,
      beforeAddLiquidity: false,
      beforeRemoveLiquidity: false,
      afterAddLiquidity: false,
      afterRemoveLiquidity: false,
      beforeSwap: false,
      afterSwap: false,
      beforeDonate: false,
      afterDonate: false,
      beforeSwapReturnDelta: false,
      afterSwapReturnDelta: false,
      afterAddLiquidityReturnDelta: false,
      afterRemoveLiquidityReturnDelta: false,
    },
  });

  function fromFromValuesToWorkerInputs(
    values: z.infer<typeof minerInputSchema>
  ): WorkerInputs {
    // Use "as `0x${string}`" carefully, as it skips TypeScript's type checking, here is safe since it is already enforced by form schema.
    return {
      initialize: false,
      initCodeHash: values.initCodeHash as `0x${string}`,
      deployerAddress: values.deployerAddress as `0x${string}`,
      vanityPrefix: values.vanityPrefix as `0x${string}`,
      caseSensitive: values.caseSensitive,
      hookPermissionsMask: numberToHex(hookPermissionsMask, { size: 20 }),
    };
  }

  function computeHookPermissionMaskAndSet(
    values: z.infer<typeof minerInputSchema>
  ): void {
    let _hookPermissionsMask: number = 0;
    if (values.beforeInitialize) {
      _hookPermissionsMask |= BEFORE_INITIALIZE_FLAG;
    }
    if (values.afterInitialize) {
      _hookPermissionsMask |= AFTER_INITIALIZE_FLAG;
    }
    if (values.beforeAddLiquidity) {
      _hookPermissionsMask |= BEFORE_ADD_LIQUIDITY_FLAG;
    }
    if (values.afterAddLiquidity) {
      _hookPermissionsMask |= AFTER_ADD_LIQUIDITY_FLAG;
    }
    if (values.beforeRemoveLiquidity) {
      _hookPermissionsMask |= BEFORE_REMOVE_LIQUIDITY_FLAG;
    }
    if (values.afterRemoveLiquidity) {
      _hookPermissionsMask |= AFTER_REMOVE_LIQUIDITY_FLAG;
    }
    if (values.beforeSwap) {
      _hookPermissionsMask |= BEFORE_SWAP_FLAG;
    }
    if (values.afterSwap) {
      _hookPermissionsMask |= AFTER_SWAP_FLAG;
    }
    if (values.beforeDonate) {
      _hookPermissionsMask |= BEFORE_DONATE_FLAG;
    }
    if (values.afterDonate) {
      _hookPermissionsMask |= AFTER_DONATE_FLAG;
    }
    if (values.beforeSwapReturnDelta) {
      _hookPermissionsMask |= BEFORE_SWAP_RETURNS_DELTA_FLAG;
    }
    if (values.afterSwapReturnDelta) {
      _hookPermissionsMask |= AFTER_SWAP_RETURNS_DELTA_FLAG;
    }
    if (values.afterAddLiquidityReturnDelta) {
      _hookPermissionsMask |= AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG;
    }
    if (values.afterRemoveLiquidityReturnDelta) {
      _hookPermissionsMask |= AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG;
    }
    setHookPermissionsMask(_hookPermissionsMask);
  }

  useEffect(() => {
    if (
      miningState === MiningStates.STOPPED ||
      miningState === MiningStates.FOUND
    ) {
      for (let i = 0; i < workers.length; i++) {
        workers[i].terminate();
      }
      setWorkers([]);
    }
  }, [miningState]);

  function startWorker(inputs: WorkerInputs): void {
    const worker = new minerWorker();

    worker.postMessage({ initialize: true } as WorkerInputs);

    worker.onmessage = (msg: MessageEvent<WorkerOutputs>) => {
      const outputs: WorkerOutputs = msg.data;
      if (outputs.workerState === WorkerState.INITIALIZED) {
        /**1. Start  mining run*/
        worker.postMessage(inputs);
      } else if (outputs.workerState === WorkerState.MINED) {
        /**2. Handle miner outputs */
        setResultSalt(outputs.salt);
        setResultAddress(outputs.address);
        setMiningState(MiningStates.FOUND);
      }
    };

    setWorkers((prevWorkers) => [...prevWorkers, worker]);
  }

  function startMining(values: z.infer<typeof minerInputSchema>): void {
    for (let i = 0; i < threads; i++) {
      startWorker(fromFromValuesToWorkerInputs(values));
    }
    setMiningState(MiningStates.RUNNING);
  }

  function stopMining() {
    setMiningState(MiningStates.STOPPED);
  }

  function incrementThread(): void {
    setThreads((prevThreads) => prevThreads + 1);
    if (miningState === MiningStates.RUNNING) {
      startWorker(fromFromValuesToWorkerInputs(minerForm.getValues()));
    }
  }

  function decrementThread(): void {
    setThreads((prevThreads) => prevThreads - 1);
    if (miningState === MiningStates.RUNNING) {
      workers[workers.length - 1].terminate();
      setWorkers((prevWorkers) => prevWorkers.slice(0, -1));
    }
  }

  function copyToClipboard(
    text: string,
    setCopiedHook: (value: boolean) => void
  ): void {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 1500);
    });
  }

  return (
    <>
      <div className=" text-pink-200 flex flex-col items-center lg:px-20 md:px-10 sm:px-5  pt-12 mt-12 mb-10">
        <Card className=" flex flex-col items-center w-full px-8 bg-black bg-opacity-80 border-pink-500">
          <h1 className=" text-4xl mt-8 font-semibold">
            Uniswap v4 Hook Address Miner
          </h1>
          <h2 className="text-lg mt-4 text-center">
            Mine vanity Uniswap v4 hook addresses with our fast, easy-to-use,
            multithreaded online tool
          </h2>
          <Form {...minerForm}>
            <form
              onSubmit={minerForm.handleSubmit(startMining)}
              className="flex flex-col w-full center items-center mt-10"
            >
              <div className="flex flex-col md:flex-row w-full gap-8">
                <div className=" text-justify w-full md:w-1/2 flex flex-col gap-6">
                  {/**initCodeHash */}
                  <FormField
                    control={minerForm.control}
                    name="initCodeHash"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Init Code Hash</FormLabel>
                        <FormControl>
                          <Input
                            disabled={miningState === MiningStates.RUNNING}
                            placeholder="Enter init code hash..."
                            className="border-pink-500/50 bg-black text-pink-200 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200 mb-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="h-0 text-red-600/70">
                          {fieldState.error?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                  {/**deployerAddress */}
                  <FormField
                    control={minerForm.control}
                    name="deployerAddress"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Deployer Address</FormLabel>
                        <FormControl>
                          <Input
                            disabled={miningState === MiningStates.RUNNING}
                            placeholder="Enter deployer address..."
                            className="border-pink-500/50 bg-black text-pink-200 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200 mb-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="h-0 text-red-600/70">
                          {fieldState.error?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                  {/** Vanity options */}
                  <div>
                    <FormLabel>Vanity Prefix</FormLabel>
                    <div className=" flex flex-row gap-12 ">
                      <FormField
                        control={minerForm.control}
                        name="vanityPrefix"
                        render={({ field, fieldState }) => (
                          <FormItem
                            onChange={() => {
                              setVanityPrefix(
                                (minerForm.getValues().vanityPrefix || "").slice(0, 36)
                              );
                            }}
                            className="flex w-full flex-col"
                          >
                            <FormControl>
                              <Input
                                disabled={miningState === MiningStates.RUNNING}
                                placeholder="Enter vanity prefix..."
                                className="flex border-pink-500/50 bg-black text-pink-200 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200 mb-1"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage className="h-0 text-red-600/70">
                              {fieldState.error?.message}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={minerForm.control}
                        name="caseSensitive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center align-middle gap-2">
                            <FormControl>
                              <Checkbox
                                disabled={miningState === MiningStates.RUNNING}
                                className=" w-5  h-5 p-0 m-0 border-pink-500/50 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 hover:border-pink-500"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              ></Checkbox>
                            </FormControl>
                            <FormLabel className="relative ">
                              Case Sensitive
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                {/**Hook Permissions*/}
                <div className=" text-justify  w-full md:w-1/2">
                  <FormLabel>Hook Permissions</FormLabel>
                  <div className="flex flex-col gap-2 lg:max-h-60 md:max-h-80 flex-wrap border rounded-md p-3 border-pink-500/50">
                    {hookPermissions.map((permission) => (
                      <FormField
                        key={permission}
                        control={minerForm.control}
                        name={permission}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center align-middle gap-2">
                            <FormControl>
                              <Checkbox
                                disabled={miningState === MiningStates.RUNNING}
                                className=" w-5  h-5 p-0 m-0 border-pink-500/50 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 hover:border-pink-500"
                                checked={field.value}
                                onCheckedChange={(values) => {
                                  field.onChange(values);
                                  computeHookPermissionMaskAndSet(
                                    minerForm.getValues()
                                  );
                                }}
                              ></Checkbox>
                            </FormControl>
                            <FormLabel className="relative ">
                              {hookPermissionsShort[permission]}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/**Output Display */}
              <div className="flex flex-col max-w-full mt-6 p-4 rounded-lg border border-pink-500/20 bg-pink-500/5">
                <Label className="text-sm font-medium text-pink-500">
                  {
                    {
                      [MiningStates.NOT_STARTED]: (
                        <span className=" flex flex-row justify-center h-6">
                          Run Not Started
                        </span>
                      ),
                      [MiningStates.RUNNING]: (
                        <span className="flex flex-row justify-center gap-3 h-6">
                          <LoaderPinwheel size={20} className="animate-spin" />
                          Mining...
                        </span>
                      ),
                      [MiningStates.STOPPED]: (
                        <span className=" flex flex-row justify-center h-6">
                          Mining Stopped
                        </span>
                      ),
                      [MiningStates.FOUND]: (
                        <span className=" flex flex-row justify-center gap-3  h-6">
                          <PartyPopper size={20} />
                          Salt Found!
                        </span>
                      ),
                    }[miningState]
                  }
                </Label>
                <div className="flex w-full mt-2 items-center justify-between">
                  <div className="flex flex-row max-w-full items-center gap-1 truncate">
                    <code className="text-sm ">Salt:</code>
                    {(miningState === MiningStates.NOT_STARTED ||
                      miningState === MiningStates.STOPPED) && (
                      <span className="flex max-w-full">
                        <code className="text-sm text-pink-200">0x</code>
                        <code className="text-sm text-pink-200/25">
                          {resultSalt.slice(2, 66)}
                        </code>
                      </span>
                    )}
                    {miningState === MiningStates.RUNNING && (
                      <span>
                        <code className="text-sm text-pink-200">0x</code>
                        <RandomCode
                          className="text-sm text-pink-200"
                          length={64}
                          interval={35}
                        />
                      </span>
                    )}
                    {miningState === MiningStates.FOUND && (
                      <code className="text-sm text-pink-200">{resultSalt}</code>
                    )}
                  </div>
                  <Button
                    disabled={MiningStates.FOUND != miningState}
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(resultSalt, setCopiedSalt)}
                    className="ml-4 h-8 w-8 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500 duration-200"
                  >
                    {copiedSalt ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="sr-only">Copy salt</span>
                  </Button>
                </div>
                <div className="flex w-full mt-2 items-center justify-between">
                  <div className="flex flex-row max-w-full items-center gap-1 truncate">
                    <code className="text-sm ">Address:</code>
                    {(miningState === MiningStates.NOT_STARTED ||
                      miningState === MiningStates.STOPPED) && (
                      <span className="flex max-w-full">
                        <code className="text-sm text-pink-200">0x</code>
                        <code className="text-sm text-pink-200">
                          {vanityPrefix}
                        </code>
                        <code className="text-sm text-pink-200/25">
                          {resultAddress.slice(2 + vanityPrefix.length, -3)}
                        </code>
                        <code className="text-sm text-pink-200">
                          {hookPermissionsMask
                            .toString(16)
                            .padStart(3, "0")
                            .slice(-3)}
                        </code>
                      </span>
                    )}
                    {miningState === MiningStates.RUNNING && (
                      <span>
                        <code className="text-sm text-pink-200">0x</code>
                        <code className="text-sm text-pink-200">
                          {vanityPrefix}
                        </code>
                        <RandomCode
                          className="text-sm text-pink-200"
                          length={37 - vanityPrefix.length}
                          interval={35}
                        />
                        <code className="text-sm text-pink-200">
                          {hookPermissionsMask
                            .toString(16)
                            .padStart(3, "0")
                            .slice(-3)}
                        </code>
                      </span>
                    )}
                    {miningState === MiningStates.FOUND && (
                      <code className="text-sm text-pink-200">
                        {resultAddress}
                      </code>
                    )}
                  </div>
                  <Button
                    disabled={MiningStates.FOUND != miningState}
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(resultAddress, setCopiedAddress)
                    }
                    className="ml-4 h-8 w-8 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500 duration-200"
                  >
                    {copiedAddress ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="sr-only">Copy address</span>
                  </Button>
                </div>
              </div>
              {/** Control Buttons */}
              <div className=" flex flex-col md:flex-row gap-6 mt-6">
                <div className="flex flex-row gap-6 items-center">
                  <Button
                    disabled={miningState === MiningStates.RUNNING}
                    className=" w-24 bg-black border-pink-500/50 hover:border-pink-500"
                    type="submit"
                  >
                    Mine!
                  </Button>
                  <Button
                    type="button"
                    disabled={miningState != MiningStates.RUNNING}
                    className=" w-24 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={stopMining}
                  >
                    Stop
                  </Button>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  Threads:
                  <Button
                    type="button"
                    disabled={threads === 1}
                    className=" w-fill px-3 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={decrementThread}
                  >
                    <SquareMinus />
                  </Button>
                  <div className="w-5">{threads}</div>
                  <Button
                    type="button"
                    className=" w-fill px-3 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={incrementThread}
                  >
                    <SquarePlus />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <CodeDisplay
            language="solidity"
            title="Foundry Script To Get Init Code Hash"
            className=" w-full h-fit mt-6 mb-8 "
            filePath="/PrintInitCodeHash.s.sol"
          />
        </Card>
      </div>
    </>
  );
}

export default App;
