import { useRef, useEffect } from "react";
import Perlin from "./perlin";
import "./asciinoise.css";

function AsciiNoise() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const seed = Math.random();
  const noise = new Perlin(seed);
  const CHAR = "            ·@#xo0$;:'-+,._        ";
  const CELL_SIZE = 12;
  const COLOR = "#f50fb3";
  const FRAME_TIME = 1000 / 60;
  const SCALE = 8;

  function frameCounter() {
    var frame = 0;
    return function () {
      return frame++;
    };
  }
  const countFrame = frameCounter();

  function initWaveMap(
    _waveMap: number[][]
  ): [() => number[][], (newWaveMap: number[][]) => void] {
    let waveMap = _waveMap;
    function getWaveMap(): number[][] {
      return waveMap;
    }
    function setWaveMap(newWaveMap: number[][]): void {
      waveMap = newWaveMap;
    }
    return [getWaveMap, setWaveMap];
  }
  const [getWaveMap, setWaveMap] = initWaveMap([]);

  function generateRandomWaveMap(width: number, height: number) {
    let _waveMap: number[][] = [];
    for (let i = 0; i < width; i++) {
      let row = [];
      for (let j = 0; j < height; j++) {
        const x = (i / width) * SCALE;
        const y = (j / height) * SCALE;
        const rawPerlinVal = noise.perlin3(x, y, 0);
        const value = Math.floor(((rawPerlinVal + 1) / 2) * CHAR.length);
        row.push(value);
      }
      _waveMap.push(row);
    }
    return _waveMap;
  }

  function evolveWaveMap(_waveMap: number[][]) {
    const frame = countFrame();
    let evolvedWaveMap = _waveMap;
    _waveMap.forEach((row, i) => {
      row.forEach((_, j) => {
        const x = (i / _waveMap.length) * SCALE;
        const y = (j / _waveMap[0].length) * SCALE;
        const rawPerlinVal = noise.perlin3(x, y, frame / 100);
        const value = Math.floor(((rawPerlinVal + 1) / 2) * CHAR.length);
        evolvedWaveMap[i][j] = value;
      });
    });
    return evolvedWaveMap;
  }

  function drawWaveMap(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    _waveMap: number[][]
  ) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const XCells = Math.floor(canvasWidth / CELL_SIZE);
    const YCells = Math.floor(canvasHeight / CELL_SIZE);

    ctx.font = `${CELL_SIZE}px monospace`; // Set font size and type
    ctx.fillStyle = COLOR;
    ctx.textBaseline = "top";

    for (let i = 0; i < XCells; i++) {
      for (let j = 0; j < YCells; j++) {
        ctx.fillText(
          CHAR[_waveMap[i % _waveMap.length][j % _waveMap[0].length]],
          i * CELL_SIZE,
          j * CELL_SIZE
        );
      }
    }
  }

  function handleWindowResize() {
    // Init Canvas
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawWaveMap(ctx, canvas.width, canvas.height, getWaveMap());
      }
    }
  }

  function frameLoop() {
    let _waveMap;
    // Initialize WaveMap (80% bigger to allow for resizing the canvas without regenerating the wave map)
    if (getWaveMap().length === 0) {
      const width = Math.floor((window.innerWidth * 1.8) / CELL_SIZE);
      const height = Math.floor((window.innerHeight * 1.8) / CELL_SIZE);
      _waveMap = generateRandomWaveMap(width, height);
      setWaveMap(_waveMap);
    } else {
      _waveMap = getWaveMap();
    }

    const evolvedWaveMap = evolveWaveMap(_waveMap);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawWaveMap(ctx, canvas.width, canvas.height, evolvedWaveMap);
      }
    }

    setWaveMap(evolvedWaveMap);

    animationRef.current = requestAnimationFrame(() => {
      setTimeout(frameLoop, FRAME_TIME);
    });
  }

  useEffect(() => {
    // Init Canvas
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Start animation
    animationRef.current = requestAnimationFrame(() => frameLoop());

    // Add window resize listener
    window.addEventListener("resize", handleWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas className="asciinoise" ref={canvasRef} />;
}

export default AsciiNoise;
