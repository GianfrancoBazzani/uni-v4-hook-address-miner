import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { SquarePlus, SquareMinus , Copy} from "lucide-react";

const minerInputSchema = z.object({
  initCodeHash: z.string().length(66, {
    message: "Must be exactly 66 characters long including leading '0x'", // TODO: Try to display this error
  }),
  deployerAddress: z.string().length(42, {
    message: "Must be exactly 42 characters long including leading '0x'",
  }),
  vanityPrefix: z.string().optional(), // TODO: Validate
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


function App() {
  const [mining, setMining] = useState<boolean>(false);
  const [threads, setThreads] = useState<number>(2);

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

  function startMining(values: z.infer<typeof minerInputSchema>) {
    // TODO: Start workers
    console.log(values);
    setMining(true);
  }

  function stopMining() {
    // TODO: Finalize workers
    setMining(false);
  }
  
  async function copyToClipboard(text: string, valueCopied: string) {
    await navigator.clipboard.writeText(text)
    //TODO: Add a toast notification
    console.log(`Copied ${valueCopied} to clipboard: ${text}`) // TODO: Delete
    
  }

  return (
    <>
      <div className=" text-pink-100 flex flex-col items-center lg:px-20 md:px-10 sm:px-5  pt-12 mt-12">
        <Card className=" flex flex-col items-center w-full px-8 bg-black bg-opacity-80 border-pink-500">
          <h1 className=" text-4xl mt-8 font-semibold">
            Uniswap V4 Hook Address Miner Online Tool
          </h1>
          <Form {...minerForm}>
            <form
              onSubmit={minerForm.handleSubmit(startMining)}
              className="flex flex-col w-full center items-center gap-6 pt-6"
            >
              <div className="flex flex-row w-full gap-8">
                <div className=" text-justify w-1/2 flex flex-col gap-6">
                  {/**initCodeHash */}
                  <FormField
                    control={minerForm.control}
                    name="initCodeHash"
                    render={({ field }) => (
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
                      </FormItem>
                    )}
                  />
                  {/**deployerAddress */}
                  <FormField
                    control={minerForm.control}
                    name="deployerAddress"
                    render={({ field }) => (
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
                        render={({ field }) => (
                          <FormItem className="flex w-full">
                            <FormControl>
                              <Input
                                placeholder="Enter vanity prefix..."
                                className="flex border-pink-500/50 bg-black text-pink-50 placeholder:text-pink-500/30 
                     focus:border-pink-500 focus:ring-pink-500/50 hover:border-pink-500/40 
                     transition-all duration-200"
                                {...field}
                              />
                            </FormControl>
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
                                onCheckedChange={field.onChange}
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
              <div className="mt-4 p-4 rounded-lg border border-pink-500/20 bg-pink-500/5">
                <Label className="text-sm font-medium text-pink-500">
                  Generated Salt
                </Label>
                <div className="mt-2 flex items-center justify-between">
                  <code className="text-pink-50 font-mono text-sm ">
                    Salt: 0x0000000000000000000000000000000000000000000000000000000000000000
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard("TODO: Salt", "salt")}
                    className="ml-4 h-8 w-8 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy salt</span>
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <code className="text-pink-50 font-mono text-sm ">
                    Address:  0xc0fFeE4847b379578588920ca78fbf26c0b4956c
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard("TODO: Address", "address")}
                    className="ml-4 h-8 w-8 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy address</span>
                  </Button>
                </div>

              </div>
              {/** Control Buttons */}
              <div className=" flex flex-row gap-6">
                <Button
                  disabled={mining}
                  className=" w-24 bg-black border-pink-500/50 hover:border-pink-500"
                  type="submit"
                >
                  Mine!
                </Button>
                <Button
                  type="button"
                  disabled={!mining}
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
                    onClick={() => setThreads(threads - 1)} // TODO: Add a function that allows thread hot starting/stoping
                  >
                    <SquareMinus />
                  </Button>
                  <div className="w-5">{threads}</div>
                  <Button
                    type="button"
                    disabled={threads == 100} // TODO: set max threads
                    className=" w-fill px-3 bg-black border-pink-500/50 hover:border-pink-500"
                    onClick={() => setThreads(threads + 1)} // TODO: Add a function that allows thread hot starting/stoping
                  >
                    <SquarePlus />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          {/*<div className=" mx-5 h-96 bg-red-700">
            TODO Add forge solidity code to copy paste and get the values
          </div>*/}
          <CardFooter>
            <p>Build by Gianfranco TODO: Add link to twitter</p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default App;
