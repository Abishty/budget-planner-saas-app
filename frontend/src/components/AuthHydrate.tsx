import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { ME } from "../graphql/operations";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout, setHydrated, setUser } from "../store/authSlice";

export function AuthHydrate() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useQuery(ME, {
    skip: !token,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data.me) dispatch(setUser(data.me));
      else dispatch(logout());
      dispatch(setHydrated(true));
    },
    onError: () => {
      dispatch(logout());
      dispatch(setHydrated(true));
    },
  });

  useEffect(() => {
    if (!token) dispatch(setHydrated(true));
  }, [token, dispatch]);

  return null;
}
