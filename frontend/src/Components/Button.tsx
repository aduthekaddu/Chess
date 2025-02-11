interface ButtonIT {
  text: string;
  onClick: () => void;
}
export function Button({ text, onClick }: ButtonIT) {
  return (
    <button
      className="px-10 py-8 bg-green-400 hover:bg-green-500 text-2xl text-white font-bold rounded"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
