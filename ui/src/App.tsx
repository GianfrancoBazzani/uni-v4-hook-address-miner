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
import { useState } from "react";
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

const minerInputSchema = z.object({
  initCodeHash: z.string().length(66, {
    message: "Must be exactly 66 characters long including leading '0x'",
  }),
  deployerAddress: z.string().length(42, {
    message: "Must be exactly 42 characters long including leading '0x'",
  }),
  vanityPrefix: z
    .string()
    .regex(/^[0-9a-fA-F]*$/, {
      message: "Must contain only hexadecimal characters",
    })
    .optional(),
  caseSensitive: z.boolean().optional(),
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
  beforeSwapReturnDelta: "beforeSwapRD",
  afterSwapReturnDelta: "afterSwapRD",
  afterAddLiquidityReturnDelta: "afterAddLiquidityRD",
  afterRemoveLiquidityReturnDelta: "afterRemoveLiquidityRD",
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

  function computeHookPermissionMaskAndSet(
    values: z.infer<typeof minerInputSchema>
  ) {
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

  function startMining(values: z.infer<typeof minerInputSchema>) {
    // TODO: Start all workers
    setMiningState(MiningStates.RUNNING);

    // TODO: Once finish mining, set the result salt and address
    return;
    setResultSalt(
      "0x229063f3bd4cc437d4415e5229ae68aeeab5322d76889185a0f267958867d544"
    );
    setResultAddress("0xfB46D30c9b3AcC61d714d167179748fD01E09a36");
    setMiningState(MiningStates.FOUND);
  }
  miningState;

  function stopMining() {
    // TODO: Finalize all workers
    setMiningState(MiningStates.STOPPED);
  }

  async function copyToClipboard(
    text: string,
    setCopiedHook: (value: boolean) => void
  ) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 1500);
    });
  }

  return (
    <>
      <div className=" text-pink-100 flex flex-col items-center lg:px-20 md:px-10 sm:px-5  pt-12 mt-12 mb-10">
        <Card className=" flex flex-col items-center w-full px-8 bg-black bg-opacity-80 border-pink-500">
          <h1 className=" text-4xl mt-8 font-semibold">
            Uniswap V4 Hook Address Miner Online Tool
          </h1>
          <Form {...minerForm}>
            <form
              onSubmit={minerForm.handleSubmit(startMining)}
              className="flex flex-col w-full center items-center mt-10"
            >
              <div className="flex flex-row w-full gap-8">
                <div className=" text-justify w-1/2 flex flex-col gap-6">
                  {/**initCodeHash */}
                  <FormField
                    control={minerForm.control}
                    name="initCodeHash"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Init Code Hash</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter init code hash..."
                            className="border-pink-500/50 bg-black text-pink-50 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="h-0 text-red-600/70 mt-1">
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
                            placeholder="Enter deployer address..."
                            className="border-pink-500/50 bg-black text-pink-50 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="h-0 text-red-600/70 mt-1">
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
                                minerForm.getValues().vanityPrefix || ""
                              );
                            }}
                            className="flex w-full flex-col"
                          >
                            <FormControl>
                              <Input
                                placeholder="Enter vanity prefix..."
                                className="flex border-pink-500/50 bg-black text-pink-50 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="h-0 text-red-600/70 mt-1">
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
                <div className=" text-justify  w-1/2">
                  <FormLabel>Hook Permissions</FormLabel>
                  <div className="flex flex-col gap-2 lg:max-h-52 md:max-h-80 flex-wrap border rounded-md p-2 border-pink-500/50">
                    {hookPermissions.map((permission) => (
                      <FormField
                        key={permission}
                        control={minerForm.control}
                        name={permission}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center align-middle gap-2">
                            <FormControl>
                              <Checkbox
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
              <div className="mt-6 p-4 rounded-lg border border-pink-500/20 bg-pink-500/5">
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
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-row items-center gap-1">
                    <code className="text-sm ">Salt:</code>
                    {(miningState == MiningStates.NOT_STARTED ||
                      miningState == MiningStates.STOPPED) && (
                      <span>
                        <code className="text-sm text-pink-50">0x</code>
                        <code className="text-sm text-pink-50/25">
                          {resultSalt.slice(2, 66)}
                        </code>
                      </span>
                    )}
                    {miningState == MiningStates.RUNNING && (
                      <span>
                        <code className="text-sm text-pink-50">0x</code>
                        <RandomCode
                          className="text-sm text-pink-50"
                          length={64}
                          interval={35}
                        />
                      </span>
                    )}
                    {miningState == MiningStates.FOUND && (
                      <code className="text-sm text-pink-50">{resultSalt}</code>
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
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-row items-center gap-1">
                    <code className="text-sm ">Address:</code>
                    {(miningState == MiningStates.NOT_STARTED ||
                      miningState == MiningStates.STOPPED) && (
                      <span>
                        <code className="text-sm text-pink-50">0x</code>
                        <code className="text-sm text-pink-50">
                          {vanityPrefix}
                        </code>
                        <code className="text-sm text-pink-50/25">
                          {resultAddress.slice(2 + vanityPrefix.length, -3)}
                        </code>
                        <code className="text-sm text-pink-50">
                          {hookPermissionsMask
                            .toString(16)
                            .padStart(3, "0")
                            .slice(-3)}
                        </code>
                      </span>
                    )}
                    {miningState == MiningStates.RUNNING && (
                      <span>
                        <code className="text-sm text-pink-50">0x</code>
                        <code className="text-sm text-pink-50">
                          {vanityPrefix}
                        </code>
                        <RandomCode
                          className="text-sm text-pink-50"
                          length={37 - vanityPrefix.length}
                          interval={35}
                        />
                        <code className="text-sm text-pink-50">
                          {hookPermissionsMask
                            .toString(16)
                            .padStart(3, "0")
                            .slice(-3)}
                        </code>
                      </span>
                    )}
                    {miningState == MiningStates.FOUND && (
                      <code className="text-sm text-pink-50">
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
              <div className=" flex flex-row gap-6 mt-6">
                <Button
                  disabled={miningState == MiningStates.RUNNING}
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
                <div className="flex flex-row gap-2 items-center">
                  Threads:
                  <Button
                    type="button"
                    disabled={threads == 1}
                    className=" w-fill px-3 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={() => setThreads(threads - 1)} // TODO: Wrap setTreads into a function that allows thread hot starting/stoping
                  >
                    <SquareMinus />
                  </Button>
                  <div className="w-5">{threads}</div>
                  <Button
                    type="button"
                    disabled={threads == 100} // TODO: set max threads
                    className=" w-fill px-3 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={() => setThreads(threads + 1)} // TODO: Wrap setThreads into a function that allows thread hot starting/stoping
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
            className=" w-full h-fit m-6 "
            filePath="src/contracts/PrintInitCodeHash.s.sol"
          />
        </Card>
      </div>
    </>
  );
}

export default App;
