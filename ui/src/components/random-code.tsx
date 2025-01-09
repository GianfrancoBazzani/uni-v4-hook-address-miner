import React, { useState, useEffect } from "react";

interface RandomCodeProps {
  length: number;
  interval: number;
  className?: string;
}
export function RandomCode({ length, interval, className }: RandomCodeProps) {

  const [randomString, setRandomString] = useState("");

  // Helper function to generate a random string
  const generateRandomString = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  useEffect(() => {
    // Generate a random string immediately on component mount
    setRandomString(generateRandomString(length));

    // Set up the interval to generate a new random string periodically
    const intervalId = setInterval(() => {
      setRandomString(generateRandomString(length));
    }, interval);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [length, interval]);


  return <code className={className}>{randomString}</code>;
}
