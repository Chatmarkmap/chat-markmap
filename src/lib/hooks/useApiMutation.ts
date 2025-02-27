import { useState } from "react";

import { useMutation } from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";

export const useApiMutation = (mutation: FunctionReference<"mutation">) => {
  const [pending, setPending] = useState(false);
  const apiMutation = useMutation(mutation);

  const mutate = async (...payload: OptionalRestArgs<typeof mutation>) => {
    setPending(true);
    return await apiMutation(...payload)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => setPending(false));
  };

  return { mutate, pending };
};
