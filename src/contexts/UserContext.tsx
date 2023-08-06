import { UserRead, UserService } from "@/api";
import { useIsAuthenticated } from "@azure/msal-react";
import React, { useContext, useEffect, useState } from "react";

interface UserContextType {
  user?: UserRead,
  setUser: React.Dispatch<React.SetStateAction<UserRead | undefined>>
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: React.ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
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

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser() was used outside of its Provider.");
  }
  return context;
}