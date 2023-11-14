import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import qs from "query-string";
import { useSearch, navigate } from "wouter/use-location";
import { toast } from "react-toastify";
import { createId } from "@paralleldrive/cuid2";
import { Button } from "./Button";

const LOCAl_STORAGE_KEY = "githubAccessToken";
const loginSuccessToastId = createId();

const GitHubLoginButton = () => {
  const [accessToken, setAccessToken] = useState(() => {
    if (window.localStorage.getItem(LOCAl_STORAGE_KEY)) {
      return window.localStorage.getItem(LOCAl_STORAGE_KEY) || null;
    }
    return null;
  });
  const { code, state } = qs.parse(useSearch());

  const { data, error } = useQuery({
    queryKey: ["githubToken", code, state],
    queryFn: async () => {
      const res = await fetch(
        `api/login/github/callback?code=${code}&state=${state}`
      );
      const data = await res.json();
      return data;
    },
    enabled: !accessToken && !!code,
  });

  const saveAccessToken = (token: string) => {
    window.localStorage.setItem(LOCAl_STORAGE_KEY, token);
    setAccessToken(token);
  };

  const logOut = () => {
    window.localStorage.removeItem(LOCAl_STORAGE_KEY);
    setAccessToken(null);
    toast.success("Successfully logged out of GitHub.", {
      autoClose: 3000,
    });
  };

  useEffect(() => {
    if (data && data.access_token && accessToken !== data.access_token) {
      saveAccessToken(data.access_token);
      navigate("/"); // clear github callback query params
      toast.success("Successfully logged in with GitHub.", {
        autoClose: 3000,
        toastId: loginSuccessToastId,
      });
    } else if (error) {
      console.error(error);
      toast.error("Error logging in with GitHub.", { autoClose: 3000 });
    }
  }, [accessToken, data, error]);

  return (
    <>
      {accessToken ? (
        <Button
          Icon={null}
          text="Logout of GitHub"
          theme="dark"
          layoutStyle="flex w-1/4"
          onClick={logOut}
        />
      ) : (
        <Button
          Icon={null}
          text="Login with GitHub"
          theme="dark"
          layoutStyle="flex w-1/4"
          onClick={() => (window.location.href = "/api/login/github")}
        />
      )}
    </>
  );
};

export { GitHubLoginButton };
