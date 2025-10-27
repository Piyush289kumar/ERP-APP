// app/feature/user/userApi.ts
import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getToken } from "~/utils/auth";
import { setUser, type UserState } from "./userSlice";
import { store } from "~/redux/store";

// Fetch function
export const fetchUserProfile = async (): Promise<UserState> => {
    const token = getToken();
    if (!token) throw new Error("No Token found.");

    console.log("🔑 Token found:", token);

    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile/view`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log("👤 API Response:", data);
    return data.user;
};

// ✅ Hook using explicit generics (this fixes the overload issue)
export function useUserProfile(): UseQueryResult<UserState, Error> {

    console.log("📦 Store instance:", store);
    console.log("📦 Store state before:", store.getState());
    console.log("🟢 useUserProfile hook running...");
    const dispatch = useDispatch();

    return useQuery<UserState, Error>({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5, // cache for 5 min
        retry: 1,
        gcTime: 1000 * 60 * 10, // optional
        onSuccess: (userData: UserState) => {
            console.log("User profile fetched:", userData);
            dispatch(setUser(userData));
        },
        onError: (err: Error) => {
            console.error("❌ Error fetching profile:", err.message);
        },
    } as UseQueryOptions<UserState, Error>); // ✅ Explicitly cast type
}
