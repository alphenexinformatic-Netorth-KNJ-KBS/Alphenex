import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const SESSION_KEY = 'raga_session_token';
  const SESSION_ID_KEY = 'raga_session_id';

  const [sessionToken, setSessionToken] = useState(() => {
    let token = localStorage.getItem(SESSION_KEY);
    if (!token || token.length !== 64) {
      token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(SESSION_KEY, token);
    }
    return token;
  });

  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_ID_KEY) || '');

  // Sync token back to storage if it ever changes from elsewhere (e.g. server update)
  useEffect(() => {
    if (sessionToken) localStorage.setItem(SESSION_KEY, sessionToken);
  }, [sessionToken]);

  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_ID_KEY, sessionId);
  }, [sessionId]);

  return (
    <SessionContext.Provider value={{ sessionToken, setSessionToken, sessionId, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
};
