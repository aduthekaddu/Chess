import { useNavigate } from "react-router-dom";
import { Button } from "../Components/Button";

export function Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="pt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid justify-center ">
            <img src={"/chess.jpg"} className="max-h-96 max-w-96" />
          </div>
          <div className="pt-16">
            <div className="flex justify-center">
              <h1 className="text-5xl font-bold">Play Chess Online #1 Site</h1>
            </div>
            <div className="mt-16 flex justify-center">
              <Button
                text="Play Online"
                onClick={() => {
                  navigate("/game");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
