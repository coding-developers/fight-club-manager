"use client";

import React from "react";

export function useLoading() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const executeWithLoading = React.useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        return await asyncFunction();
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, executeWithLoading };
}
