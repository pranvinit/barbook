import { useSelector } from "react-redux";
import { selectAuthStatus, selectUser } from "./model/authSlice";

export function useSession() {
  const status = useSelector(selectAuthStatus);
  const user = useSelector(selectUser);
  return { user, status, isLoading: status === "loading" };
}
