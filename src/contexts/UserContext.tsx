import { UserRead, UserService } from "@/api";
import { useIsAuthenticated } from "@azure/msal-react";
import React, { useContext, useEffect, useState } from "react";

interface UserContextType {
  user?: UserRead,
  setUser: React.Dispatch<React.SetStateAction<UserRead | undefined>>
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRead>();

  const isAuth = useIsAuthenticated();
  useEffect(() => {
    if (isAuth) {
      UserService.readCurrentUser()
        .then((user) => setUser(user))
        .catch((error) => console.error(error));
    }
  }, [isAuth]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext() was used outside of its Provider.");
  }
  return context;
}