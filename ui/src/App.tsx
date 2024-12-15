import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  return (
    <>
      <div className=" flex flex-col items-center p-10">
        <Card className=" w-full bg-black opacity-80">
          <div className=" absolute right-0">Add GH button TODO</div>
          <h1 className= " text-4xl mt-8 font-semibold">Online Uniswap V4 Hook Address Miner</h1>
          
          <div className= " mx-5 h-96 bg-red-700">
            TODO Add form to mine
          </div>        
          <div className= " mx-5 h-96 bg-red-700">
            TODO Add forge solidity code to copy paste and get the values
          </div>          
          <CardFooter>
            <p>Build by Gianfranco TODO: Add link to twitter</p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default App;
