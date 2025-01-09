import { useState, useEffect } from 'react';
import {Prism, SyntaxHighlighterProps} from 'react-syntax-highlighter';
import { funky } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from 'lucide-react';
import { cn } from "@/lib/utils"

interface CodeDisplayProps {
  language: string;
  title: string;
  filePath: string;
  className?: string;
}

const SyntaxHighlighter = (Prism as any) as React.FC<SyntaxHighlighterProps>;

export function CodeDisplay({ language, title, filePath, className}: CodeDisplayProps) {
  const [code, setCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(filePath)
      .then(response => response.text())
      .then((text) => {setCode(text)})
      .catch(error => console.error('Error loading Solidity file:', error));
  }, [filePath]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Card className={cn(" bg-black border-pink-500/50 overflow-hidden", className)}>
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900/70 border-b border-pink-900/20">
        <h3 className=" font-medium">{title}</h3>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500 duration-200"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
        <SyntaxHighlighter
          language={language}
          style={funky}
          customStyle={{
            backgroundColor: 'transparent',
            fontSize: '0.9rem',
            lineHeight: '1.5',
          }}
        >
          {code}
        </SyntaxHighlighter>
    </Card>
  );
}
