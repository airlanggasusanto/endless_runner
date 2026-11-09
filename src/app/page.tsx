import coinSprite from "../../public/coin3_16x16.png"; 

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Simple Image Load</h1>
      
      <img 
        src={coinSprite.src} 
        alt="Coin Sprite Sheet" 
        // This style keeps small pixel art from getting blurry when scaled up
        style={{ imageRendering: "pixelated" }} 
        className="w-full max-w-lg border-2 border-gray-600 rounded p-4 bg-gray-800"
      />
    </main>
  );
}