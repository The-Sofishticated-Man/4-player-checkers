import { useContext } from "react";
import type { boardContextType } from "../types/boardTypes";
import { boardContext } from "../context/boardContextValue";


function useBoard(): boardContextType {
    return useContext(boardContext)
}

export default useBoard;