import type { GameContextType } from "./../types/contextTypes";
import { useContext } from "react";
import { gameContext } from "../context/boardContextValue";

function useGameState(): GameContextType {
  return useContext(gameContext);
}

export default useGameState;
