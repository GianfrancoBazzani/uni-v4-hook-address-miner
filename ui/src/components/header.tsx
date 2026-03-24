import { Github, Coffee } from "lucide-react";

export function Header() {
  return (
    <header className=" fixed w-full z-50 bg-opacity-80 backdrop-blur-sm bg-black text-primary-foreground border-b shadow border-pink-500">
      <div className=" px-20 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-pink-200">v4</h1>
          <span className="text-xl" role="img" aria-label="Pick axe">
            🪝
          </span>
          <h1 className="text-xl font-bold text-pink-200">Address Miner</h1>
        </div>
        <div className="flex flex-row gap-3">
          <a
            href="https://buymeacoffee.com/gianfrancobazzani"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-pink-200 hover:text-pink-500 p-2 rounded duration-200">
              <Coffee size={21} />
              <span className="sr-only">GitHub</span>
            </div>
          </a>
          <a
            href="https://github.com/GianfrancoBazzani/uni-v4-hook-address-miner/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-pink-200 hover:text-pink-500 p-2 rounded duration-200">
              <Github size={21} />
              <span className="sr-only">GitHub</span>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}
