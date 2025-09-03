"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";


const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const token = localStorage.getItem("chess_app_token");

    useEffect(() => {
      if (token) {
        router.push("/auth");
      }
    }, [token]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
