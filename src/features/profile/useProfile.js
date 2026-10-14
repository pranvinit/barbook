import { useSession } from "@/features/auth/useSession";
import { useGetProfileQuery } from "./api/profileApi";

export function useProfile() {
  const { user } = useSession();
  return useGetProfileQuery(undefined, { skip: !user });
}
