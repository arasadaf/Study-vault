import { useRef, useEffect, useState } from 'react';

export default function Whiteboard({ socket, roomId, initialDrawings = [] }) {
  const canvasRef = useRef(null);
  const [sessionDrawings, setSessionDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const currentPosition = useRef({ x: 0, y: 0 });

  // Helper to draw a line
  const drawLine = (ctx, x0, y0, x1, y1, color, size, emit = false) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    const drawData = { roomId, x0, y0, x1, y1, color, size };
    socket.emit('draw', drawData);
    setSessionDrawings((prev) => [...prev, drawData]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas before drawing everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial ones from backend
    initialDrawings.forEach((data) => {
      const { x0, y0, x1, y1, color, size } = data;
      drawLine(ctx, x0, y0, x1, y1, color, size, false);
    });

    // Draw session ones
    sessionDrawings.forEach((data) => {
      const { x0, y0, x1, y1, color, size } = data;
      drawLine(ctx, x0, y0, x1, y1, color, size, false);
    });
  }, [initialDrawings, sessionDrawings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Redraw everything on resize
      [...initialDrawings, ...sessionDrawings].forEach((data) => {
        const { x0, y0, x1, y1, color, size } = data;
        drawLine(ctx, x0, y0, x1, y1, color, size, false);
      });
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawHandler = (data) => {
      const { x0, y0, x1, y1, color, size } = data;
      drawLine(ctx, x0, y0, x1, y1, color, size, false);
      // Also save to session so it persists resize
      setSessionDrawings((prev) => [...prev, data]);
    };

    socket.on('receive_draw', drawHandler);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.off('receive_draw', drawHandler);
    };
  }, [socket, initialDrawings, sessionDrawings]);

  const onMouseDown = (e) => {
    setIsDrawing(true);
    currentPosition.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
  };

  const onMouseMove = (e) => {
    if (!isDrawing) return;
    
    const x1 = e.nativeEvent.offsetX;
    const y1 = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext('2d');
    
    drawLine(ctx, currentPosition.current.x, currentPosition.current.y, x1, y1, color, brushSize, true);
    
    currentPosition.current = { x: x1, y: y1 };
  };

  const onMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // You'd typically emit a clear event here too
  };

  const colors = ['#ffffff', '#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#1e293b'];

  return (
    <div className="flex-1 w-full h-full relative">
      <div className="absolute top-4 left-4 glass-panel p-2 rounded-xl flex flex-col gap-3 z-20">
        {/* Colors */}
        <div className="flex flex-col gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
              title={c === '#1e293b' ? 'Eraser' : 'Brush Color'}
            />
          ))}
        </div>
        <div className="w-full h-px bg-slate-700 my-1"></div>
        {/* Brush Size */}
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-8 -rotate-90 origin-center my-4"
        />
        <div className="w-full h-px bg-slate-700 my-1"></div>
        {/* Clear Button */}
        <button 
          onClick={clearCanvas}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Clear Board"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseOut={onMouseUp}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
